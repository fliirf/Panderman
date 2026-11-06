"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, CheckIcon as Check, SealCheckIcon as CircleCheck, FileTextIcon as FileText, InfoIcon as Info, SpinnerGapIcon as Loader2, StorefrontIcon as Store, TruckIcon as Truck, UploadSimpleIcon as Upload, XIcon as X } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { checkAvailability, submitOrder } from "@/app/actions";
import { useCart } from "@/components/cart-provider";
import { DateField } from "@/components/date-field";
import { ItemImage } from "@/components/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rentalWindow } from "@/lib/booking";
import { resolveCart } from "@/lib/cart-utils";
import { addDays, toLocalDate } from "@/lib/dates";
import { rupiah, tanggal, tanggalPendek } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";
import type { ISODate, Item, Package, PaymentMethod, PaymentScheme, PrasmananMode, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_FILE = 2 * 1024 * 1024;
const FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

type StepId = "jadwal" | "alamat" | "jaminan" | "bayar";
const STEP_LABEL: Record<StepId, string> = { jadwal: "Jadwal & pengiriman", alamat: "Alamat acara", jaminan: "Jaminan KTP", bayar: "Ringkasan & bayar" };

function Option({ name, value, checked, onChange, title, desc, icon: Icon }: { name: string; value: string; checked: boolean; onChange: (v: string) => void; title: string; desc: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <label className={cn("flex cursor-pointer gap-3 rounded-2xl border border-input bg-card p-4 transition duration-300", checked ? "border-primary bg-accent ring-1 ring-primary" : "hover:bg-muted/50")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-primary" />}
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span className={cn("mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full border", checked && "border-primary bg-primary text-primary-foreground")}>
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
    </label>
  );
}

export function CheckoutFlow({ items, packages, settings, lockedDates }: { items: Item[]; packages: Package[]; settings: Settings; lockedDates: ISODate[] }) {
  const cart = useCart();
  const lines = resolveCart(cart.lines, items, packages);
  const hasTent = lines.some((l) => l.hasTent);
  const hasPrasmanan = lines.some((l) => l.isPrasmanan);
  const hasOther = lines.some((l) => !l.isPrasmanan);

  const [installDate, setInstallDate] = useState<ISODate>();
  const [prasMode, setPrasMode] = useState<PrasmananMode>("antar");
  const [pickupDate, setPickupDate] = useState<ISODate>();
  const [returnDate, setReturnDate] = useState<ISODate>();
  const [address, setAddress] = useState({ text: "", note: "", zoneId: "" });
  const [ktp, setKtp] = useState<File>();
  const [scheme, setScheme] = useState<PaymentScheme>("dp");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string>();
  const [stepIdx, setStepIdx] = useState(0);
  const [pending, start] = useTransition();
  const [done, setDone] = useState<{ code: string; orderId: string }>();

  const needsDelivery = hasOther || (hasPrasmanan && prasMode === "antar");
  const steps = ["jadwal", needsDelivery && "alamat", "jaminan", "bayar"].filter(Boolean) as StepId[];
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  const eventStart = cart.eventStart;
  const eventEnd = cart.eventEnd ?? eventStart;
  const price = calculatePrice({ lines, needsDelivery, zoneId: address.zoneId, extraDays: 0 }, settings);

  if (done)
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-janur text-janur-foreground"><CircleCheck className="size-8" /></span>
        <div className="space-y-2">
          <h1 className="font-display text-4xl leading-[1.05]">Pesanan diajukan</h1>
          <p className="text-muted-foreground">
            Nomor pesanan <b className="text-foreground">{done.code}</b>. {hasTent ? "Admin akan meninjau tanggal pemasangan dan mengabari Anda lewat WhatsApp." : "Silakan lakukan pembayaran dari halaman pesanan."}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link href={`/pesanan/${done.orderId}`} className={cn(buttonVariants({ size: "lg" }), "px-5")}>Lihat pesanan</Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-5")}>Ke beranda</Link>
        </div>
      </div>
    );

  if (!cart.ready) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;
  if (!lines.length || !eventStart)
    return (
      <div className="kawung rounded-[1.75rem] text-pine py-16 text-center">
        <p className="font-medium">{lines.length ? "Tanggal acara belum dipilih" : "Keranjang kosong"}</p>
        <Link href={lines.length ? "/keranjang" : "/katalog"} className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>{lines.length ? "Kembali ke keranjang" : "Lihat katalog"}</Link>
      </div>
    );

  const windowFrom = addDays(eventStart, -settings.installWindow.maxDaysBefore);
  const windowTo = addDays(eventStart, -settings.installWindow.minDaysBefore);

  function validate(): string | undefined {
    if (step === "jadwal") {
      if (hasTent && !installDate) return "Pilih tanggal pemasangan tenda.";
      if (hasPrasmanan && prasMode === "ambil") {
        if (!pickupDate || !returnDate) return "Pilih tanggal ambil dan kembali alat prasmanan.";
        if (pickupDate > eventStart!) return "Tanggal ambil paling lambat di hari acara.";
        if (returnDate < eventEnd!) return "Tanggal kembali paling cepat setelah acara selesai.";
      }
    }
    if (step === "alamat") {
      if (address.text.trim().length < 10) return "Isi alamat lokasi acara dengan lengkap.";
      if (!address.zoneId) return "Pilih zona lokasi acara.";
    }
    if (step === "jaminan" && !ktp) return "Unggah foto KTP sebagai jaminan.";
    if (step === "bayar" && !agree) return "Centang persetujuan ketentuan sewa.";
  }

  function next() {
    const err = validate();
    setError(err);
    if (err) return;
    if (step === "jadwal") {
      // cek stok sepanjang rentang sebenarnya (pasang s.d. bongkar), FR-19
      const w = rentalWindow({ eventStart: eventStart!, installDate, teardownDate: addDays(eventEnd!, 1), prasmanan: prasMode === "ambil" ? { mode: "ambil", pickupDate, returnDate } : undefined });
      start(async () => {
        const stock = await checkAvailability(w.from, w.to);
        const short = lines.find((l) => {
          if (l.kind === "item") return l.qty > (stock[l.id] ?? 0);
          const p = packages.find((x) => x.id === l.id)!;
          return p.contents.some((c) => c.qty * l.qty > (stock[c.itemId] ?? 0));
        });
        if (short) setError(`Stok ${short.name} tidak cukup untuk ${tanggalPendek(w.from)} – ${tanggalPendek(w.to)}.`);
        else setStepIdx((i) => i + 1);
      });
      return;
    }
    if (step === "bayar") {
      start(async () => {
        const res = await submitOrder({
          lines: cart.lines,
          eventStart: eventStart!,
          eventEnd: eventEnd!,
          installDate,
          prasmanan: hasPrasmanan ? { mode: prasMode, pickupDate, returnDate } : undefined,
          address: needsDelivery ? address : undefined,
          scheme,
          method,
        });
        if (res.ok) {
          cart.clear();
          setDone({ code: res.code, orderId: res.orderId });
          window.scrollTo({ top: 0 });
        }
      });
      return;
    }
    setStepIdx((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pickFile(f?: File) {
    if (!f) return;
    if (!FILE_TYPES.includes(f.type)) return toast.error("Format harus JPG, PNG, atau PDF.");
    if (f.size > MAX_FILE) return toast.error("Ukuran file maksimal 2 MB.");
    setKtp(f);
    setError(undefined);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* Stepper */}
        <ol className="flex gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex-1 space-y-2">
              <div className={cn("h-1 rounded-full", i <= stepIdx ? "bg-primary" : "bg-muted")} />
              <p className={cn("hidden text-xs sm:block", i === stepIdx ? "font-medium" : "text-muted-foreground")}>{i + 1}. {STEP_LABEL[s]}</p>
            </li>
          ))}
        </ol>
        <h2 className="font-display text-3xl sm:hidden">{stepIdx + 1}. {STEP_LABEL[step]}</h2>

        <div className="space-y-6 rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-5 sm:p-6">
          {step === "jadwal" && (
            <>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary p-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tanggal acara</p>
                  <p className="font-medium">{tanggal(eventStart)}{eventEnd !== eventStart && ` – ${tanggal(eventEnd!)}`}</p>
                </div>
                <Link href="/keranjang" className="text-primary underline-offset-4 hover:underline">Ubah</Link>
              </div>

              {hasTent && (
                <div className="space-y-2">
                  <Label>Tanggal pemasangan tenda</Label>
                  <DateField
                    value={installDate}
                    onChange={setInstallDate}
                    defaultMonth={windowFrom}
                    disabled={[{ before: toLocalDate(windowFrom) }, { after: toLocalDate(windowTo) }, ...lockedDates.map(toLocalDate)]}
                    modifiers={{ locked: lockedDates.map(toLocalDate), window: { from: toLocalDate(windowFrom), to: toLocalDate(windowTo) } }}
                    placeholder={`Pilih antara ${tanggalPendek(windowFrom)} – ${tanggalPendek(windowTo)}`}
                    legend={<span className="flex gap-4"><span><span className="mr-1 inline-block size-2.5 rounded-sm bg-accent align-middle" />H-5 s.d. H-1</span><span className="line-through">12</span> sudah dipesan</span>}
                  />
                  <p className="text-xs text-muted-foreground">Admin akan menyetujui, atau mengusulkan tanggal lain/tambahan hari sewa bila jadwal penuh. Pembongkaran {tanggal(addDays(eventEnd!, 1))}.</p>
                </div>
              )}

              {hasOther && (
                <div className="flex gap-3 rounded-xl border p-4 text-sm">
                  <Truck className="size-5 shrink-0 text-primary" />
                  <p><span className="font-medium">Tenda & perlengkapan pesta</span> diantar dan dipasang oleh tim kami.</p>
                </div>
              )}

              {hasPrasmanan && (
                <div className="space-y-3">
                  <Label>Alat prasmanan</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Option name="pras" value="antar" checked={prasMode === "antar"} onChange={(v) => setPrasMode(v as PrasmananMode)} icon={Truck} title="Diantar" desc={hasOther ? "Sekalian dengan barang lain" : "Ongkir sesuai zona"} />
                    <Option name="pras" value="ambil" checked={prasMode === "ambil"} onChange={(v) => setPrasMode(v as PrasmananMode)} icon={Store} title="Ambil sendiri" desc={settings.pickupAddress} />
                  </div>
                  {prasMode === "ambil" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Tanggal ambil</Label><DateField value={pickupDate} onChange={setPickupDate} defaultMonth={addDays(eventStart, -1)} disabled={[{ after: toLocalDate(eventStart) }]} /></div>
                      <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Tanggal kembali</Label><DateField value={returnDate} onChange={setReturnDate} defaultMonth={eventEnd} disabled={[{ before: toLocalDate(eventEnd!) }]} /></div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === "alamat" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="addr">Alamat lokasi acara</Label>
                <Textarea id="addr" rows={3} value={address.text} onChange={(e) => setAddress({ ...address, text: e.target.value })} placeholder="Nama jalan, nomor rumah, RT/RW, desa, kecamatan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Catatan lokasi <span className="font-normal text-muted-foreground">(opsional)</span></Label>
                <Input id="note" value={address.note} onChange={(e) => setAddress({ ...address, note: e.target.value })} placeholder="Akses jalan, jenis lahan (tanah, paving, rumput)…" className="h-11" />
              </div>
              <div className="space-y-3">
                <Label>Zona jarak dari gudang kami</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {settings.zones.map((z) => (
                    <Option key={z.id} name="zone" value={z.id} checked={address.zoneId === z.id} onChange={(v) => setAddress({ ...address, zoneId: v })} title={z.name} desc={`Ongkir & pasang ${rupiah(z.fee)}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Ragu zona Anda? Pilih perkiraan terdekat, admin akan mengoreksi saat meninjau.</p>
              </div>
            </>
          )}

          {step === "jaminan" && (
            <>
              <div className="flex gap-3 rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
                <Info className="size-5 shrink-0" />
                <p>Tanpa deposit uang. Foto KTP hanya dilihat oleh admin dan disimpan di akun Anda untuk pesanan berikutnya.</p>
              </div>
              {ktp ? (
                <div className="flex items-center gap-4 rounded-xl border p-4">
                  <span className="grid size-12 place-items-center rounded-lg bg-janur text-janur-foreground"><FileText className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ktp.name}</p>
                    <p className="text-xs text-muted-foreground">{(ktp.size / 1024).toFixed(0)} KB · siap diunggah</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setKtp(undefined)} aria-label="Hapus file"><X /></Button>
                </div>
              ) : (
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
                  className="flex cursor-pointer flex-col items-center gap-3 kawung rounded-[1.75rem] border border-dashed border-primary/25 text-pine px-6 py-12 text-center transition hover:border-primary/40 hover:bg-accent/30"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-janur text-janur-foreground"><Upload className="size-5" /></span>
                  <span className="text-sm"><span className="font-medium text-primary">Pilih file</span> atau seret ke sini</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, atau PDF · maks. 2 MB</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                </label>
              )}
            </>
          )}

          {step === "bayar" && (
            <>
              <div className="space-y-3">
                <Label>Skema pembayaran</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Option name="scheme" value="dp" checked={scheme === "dp"} onChange={(v) => setScheme(v as PaymentScheme)} title={`DP ${settings.dpPercent}% dulu`} desc={`Bayar ${rupiah(price.dp)}, sisanya saat pemasangan`} />
                  <Option name="scheme" value="lunas" checked={scheme === "lunas"} onChange={(v) => setScheme(v as PaymentScheme)} title="Langsung lunas" desc={`Bayar ${rupiah(price.total)} sekaligus`} />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Metode</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Option name="method" value="transfer" checked={method === "transfer"} onChange={(v) => setMethod(v as PaymentMethod)} title="Transfer bank / e-wallet" desc={settings.bankAccounts.map((b) => b.bank).join(", ") + " · unggah bukti"} />
                  <Option name="method" value="tunai" checked={method === "tunai"} onChange={(v) => setMethod(v as PaymentMethod)} title="Tunai" desc="Dibayar saat pemasangan / pengambilan" />
                </div>
              </div>
              <div className="rounded-2xl bg-secondary p-4 text-sm">
                <p className="font-medium">Yang terjadi berikutnya</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                  {hasTent && <li>Admin meninjau tanggal pemasangan {installDate && tanggalPendek(installDate)}.</li>}
                  <li>Setelah jadwal disetujui, bayar {scheme === "dp" ? "DP" : "lunas"} dalam {settings.dpDeadlineHours} jam agar pesanan tidak batal otomatis.</li>
                  <li>Nota {scheme === "dp" ? "DP" : "lunas"} terbit setelah pembayaran diverifikasi.</li>
                </ol>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
                <span className="text-muted-foreground">Saya setuju dengan ketentuan sewa: barang rusak/hilang didenda sesuai harga barang asli.</span>
              </label>
            </>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:text-red-400" role="alert">{error}</p>}

          <div className="flex items-center justify-between border-t pt-5">
            {stepIdx > 0 ? (
              <Button variant="ghost" onClick={() => { setError(undefined); setStepIdx((i) => i - 1); }}><ArrowLeft /> Kembali</Button>
            ) : (
              <Link href="/keranjang" className={buttonVariants({ variant: "ghost" })}><ArrowLeft /> Keranjang</Link>
            )}
            <Button onClick={next} disabled={pending} size="lg">
              {pending && <Loader2 className="animate-spin" />}
              {step === "bayar" ? "Ajukan pesanan" : "Lanjut"} {!pending && step !== "bayar" && <ArrowRight />}
            </Button>
          </div>
        </div>
      </div>

      {/* Ringkasan biaya (FR-22) */}
      <aside className="ticket-edge h-fit space-y-5 rounded-[1.75rem] bg-card p-6 shadow-[0_24px_48px_-30px_color-mix(in_oklch,var(--pine)_45%,transparent)] ring-1 ring-foreground/[0.06] [--cut:62%] lg:sticky lg:top-24">
        <p className="font-display text-2xl">Ringkasan pesanan</p>
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.kind + l.id} className="flex items-center gap-3 text-sm">
              <ItemImage category={l.category} image={l.image} sizes="80px" alt="" className="size-10 shrink-0 rounded-lg" iconSize={18} />
              <span className="min-w-0 flex-1 truncate">{l.qty}× {l.name}</span>
              <span className="tabular">{rupiah(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2.5 border-t border-foreground/10 pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{rupiah(price.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Ongkir & pasang</dt><dd className="tabular">{!needsDelivery ? "Ambil sendiri" : address.zoneId ? rupiah(price.deliveryFee) : "Pilih zona"}</dd></div>
          {price.extraDaysFee > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Tambahan hari</dt><dd className="tabular">{rupiah(price.extraDaysFee)}</dd></div>}
          <div className="flex items-baseline justify-between border-t border-dashed border-foreground/25 pt-4"><dt className="font-medium">Total</dt><dd className="font-display text-3xl tabular">{rupiah(price.total)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">DP {settings.dpPercent}%</dt><dd className="tabular">{rupiah(price.dp)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Sisa pelunasan</dt><dd className="tabular">{rupiah(price.remaining)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}

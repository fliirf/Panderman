"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckIcon as Check, FileImageIcon as FileImage, SpinnerGapIcon as Loader2, XIcon as X } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { approveSchedule, proposeSchedule, recordCashPayment, recordReturn, verifyPayment } from "@/app/actions";
import { QtyStepper } from "@/components/add-to-cart";
import { DateField } from "@/components/date-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toLocalDate } from "@/lib/dates";
import { rupiah, STATUS, tanggal } from "@/lib/format";
import { calculatePenalty } from "@/lib/pricing";
import type { ISODate, OrderStatus, Payment } from "@/lib/types";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>, msg: string) =>
    start(async () => {
      await fn();
      toast.success(msg);
      router.refresh();
    });
  return { pending, run };
}

export function ScheduleReview({ orderId, installDate, lockedDates, extraDayRate }: { orderId: string; installDate: ISODate; lockedDates: ISODate[]; extraDayRate: number }) {
  const { pending, run } = useAction();
  const [date, setDate] = useState<ISODate>();
  const [extra, setExtra] = useState(1);
  const [note, setNote] = useState("");
  const others = lockedDates.filter((d) => d !== installDate);
  const clash = others.includes(installDate);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-secondary p-4 text-sm">
        <p className="text-muted-foreground">Diajukan penyewa</p>
        <p className="font-display text-2xl">{tanggal(installDate)}</p>
        <p className={clash ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}>{clash ? "Bentrok dengan pemasangan lain" : "Tidak bentrok dengan pemasangan lain"}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending || clash} onClick={() => run(() => approveSchedule(orderId), "Jadwal disetujui. Penyewa diminta membayar.")}>
          {pending && <Loader2 className="animate-spin" />}<Check /> Setujui jadwal
        </Button>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Usulkan tanggal / tambah hari</DialogTrigger>
          <DialogContent>
            <DialogTitle>Usulkan jadwal lain</DialogTitle>
            <DialogDescription>Penyewa akan diminta menyetujui. Total biaya dihitung ulang jika disetujui.</DialogDescription>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Tanggal pemasangan baru</Label><DateField value={date} onChange={setDate} defaultMonth={installDate} disabled={others.map(toLocalDate)} modifiers={{ locked: others.map(toLocalDate) }} /></div>
              <div className="space-y-2">
                <Label>Tambahan hari sewa</Label>
                <div className="flex items-center gap-3"><QtyStepper value={extra} onChange={(n) => setExtra(Math.max(0, n))} /><span className="text-sm text-muted-foreground tabular">+ {rupiah(extra * extraDayRate)}</span></div>
              </div>
              <div className="space-y-2"><Label htmlFor="note">Pesan untuk penyewa</Label><Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: tim pasang tanggal itu penuh…" /></div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
              <Button disabled={!date || pending} onClick={() => run(() => proposeSchedule(orderId, { installDate: date!, extraDays: extra, note }), "Usulan dikirim ke penyewa")}>Kirim usulan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function PaymentReview({ payment }: { payment: Payment }) {
  const { pending, run } = useAction();
  return (
    <div className="space-y-4">
      {/* ponytail: pratinjau bukti; backend menyajikan file lewat route ber-otorisasi (NFR-06) */}
      <div className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed bg-muted/40 text-sm text-muted-foreground">
        <span className="flex flex-col items-center gap-2"><FileImage className="size-8" strokeWidth={1.25} />bukti-transfer.jpg</span>
      </div>
      <p className="text-sm">Nominal: <b className="tabular">{rupiah(payment.amount)}</b> · {payment.type.toUpperCase()} via {payment.method}</p>
      <div className="flex gap-2">
        <Button disabled={pending} onClick={() => run(() => verifyPayment(payment.id, true), "Pembayaran diverifikasi, nota terbit")}><Check /> Terima</Button>
        <Button variant="outline" disabled={pending} onClick={() => run(() => verifyPayment(payment.id, false), "Bukti ditolak, penyewa diminta unggah ulang")}><X /> Tolak</Button>
      </div>
    </div>
  );
}

export function CashPayment({ orderId, outstanding }: { orderId: string; outstanding: number }) {
  const { pending, run } = useAction();
  const [amount, setAmount] = useState(String(outstanding));
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
        <Input inputMode="numeric" value={Number(amount || 0).toLocaleString("id-ID")} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className="h-9 pl-9 tabular" />
      </div>
      <Button variant="outline" disabled={pending || !Number(amount)} onClick={() => run(() => recordCashPayment(orderId, Number(amount)), "Pembayaran tunai dicatat")}>Catat tunai</Button>
    </div>
  );
}

export function ReturnForm({ orderId, lines }: { orderId: string; lines: { itemId: string; name: string; qty: number; replacementPrice: number }[] }) {
  const { pending, run } = useAction();
  const [damaged, setDamaged] = useState<Record<string, number>>({});
  const penalty = calculatePenalty(lines.map((l) => ({ replacementPrice: l.replacementPrice, damagedQty: damaged[l.itemId] ?? 0 })));

  return (
    <div className="space-y-4">
      <ul className="divide-y text-sm">
        {lines.map((l) => (
          <li key={l.itemId} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1"><p className="truncate">{l.name}</p><p className="text-xs text-muted-foreground">Keluar {l.qty} · harga asli {rupiah(l.replacementPrice)}</p></div>
            <span className="text-xs text-muted-foreground">Rusak/hilang</span>
            <Input inputMode="numeric" className="h-8 w-16 text-center tabular" value={damaged[l.itemId] ?? 0} onChange={(e) => setDamaged({ ...damaged, [l.itemId]: Math.min(l.qty, Number(e.target.value.replace(/\D/g, "")) || 0) })} />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between rounded-2xl bg-secondary p-3 text-sm">
        <span>Denda</span><b className="tabular">{rupiah(penalty)}</b>
      </div>
      <Button
        className="w-full"
        disabled={pending}
        onClick={() => run(() => recordReturn(orderId, Object.entries(damaged).filter(([, q]) => q > 0).map(([itemId, qty]) => ({ itemId, qty }))), penalty ? "Pengembalian dicatat, tagihan denda dikirim" : "Semua barang kembali dalam kondisi baik")}
      >
        Catat pengembalian
      </Button>
    </div>
  );
}

export function StatusSelect({ status }: { status: OrderStatus }) {
  const [value, setValue] = useState<OrderStatus>(status);
  const items = Object.entries(STATUS).map(([v, s]) => ({ value: v, label: s.label }));
  return (
    <Select items={items} value={value} onValueChange={(v) => { setValue(v as OrderStatus); toast.success(`Status diubah ke ${STATUS[v as OrderStatus].label}`); }}>
      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent>{items.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SpinnerGapIcon as Loader2, PencilSimpleIcon as Pencil, PlusIcon as Plus, TrashSimpleIcon as Trash } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { saveItem, saveSettings } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABEL, rupiah, UNIT_LABEL } from "@/lib/format";
import type { Item, Package, Settings } from "@/lib/types";

const selectCls = "h-9 w-full rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>{children}</div>;
}

function useSave(fn: (fd: FormData) => Promise<unknown>, msg: string, after?: () => void) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      await fn(fd);
      toast.success(msg);
      after?.();
      router.refresh();
    });
  };
  return { pending, onSubmit };
}

/** Tambah/ubah barang satuan (FR-33) */
export function ItemDialog({ item }: { item?: Item }) {
  const [open, setOpen] = useState(false);
  const { pending, onSubmit } = useSave(saveItem, item ? "Barang diperbarui" : "Barang ditambahkan", () => setOpen(false));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={item ? <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${item.name}`} /> : <Button />}>
        {item ? <Pencil /> : <><Plus /> Tambah barang</>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{item ? "Ubah barang" : "Tambah barang"}</DialogTitle>
        <DialogDescription>Harga barang asli dipakai sebagai dasar denda jika rusak/hilang.</DialogDescription>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          <input type="hidden" name="id" value={item?.id ?? ""} />
          <F label="Nama" className="col-span-2"><Input name="name" defaultValue={item?.name} required /></F>
          <F label="Kategori">
            <select name="category" defaultValue={item?.category ?? "tenda"} className={selectCls}>
              {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </F>
          <F label="Satuan harga">
            <select name="unit" defaultValue={item?.unit ?? "unit"} className={selectCls}>
              {Object.entries(UNIT_LABEL).map(([k, v]) => <option key={k} value={k}>per {v}</option>)}
            </select>
          </F>
          <F label="Harga sewa / acara (Rp)"><Input name="price" type="number" min={0} defaultValue={item?.price} required /></F>
          <F label="Jumlah stok"><Input name="stock" type="number" min={0} defaultValue={item?.stock} required /></F>
          <F label="Harga barang asli (Rp)"><Input name="replacementPrice" type="number" min={0} defaultValue={item?.replacementPrice} required /></F>
          <F label="Spesifikasi"><Input name="spec" defaultValue={item?.spec} placeholder="5×5 m · ±40 tamu" /></F>
          <F label="Deskripsi" className="col-span-2"><Textarea name="description" rows={2} defaultValue={item?.description} /></F>
          <F label="Foto" className="col-span-2"><Input name="image" type="file" accept=".jpg,.jpeg,.png" /></F>
          <DialogFooter className="col-span-2">
            <DialogClose render={<Button variant="outline" type="button" />}>Batal</DialogClose>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Susun paket dari barang satuan (FR-34) */
export function PackageDialog({ items, pkg }: { items: Item[]; pkg?: Package }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(pkg?.contents ?? [{ itemId: items[0].id, qty: 1 }]);
  const { pending, onSubmit } = useSave(saveItem, pkg ? "Paket diperbarui" : "Paket dibuat", () => setOpen(false));
  const normal = rows.reduce((s, r) => s + (items.find((i) => i.id === r.itemId)?.price ?? 0) * r.qty, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={pkg ? <Button variant="outline" size="sm" /> : <Button />}>
        {pkg ? <><Pencil /> Ubah</> : <><Plus /> Susun paket</>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogTitle>{pkg ? "Ubah paket" : "Susun paket baru"}</DialogTitle>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <F label="Nama paket" className="col-span-2"><Input name="name" defaultValue={pkg?.name} required /></F>
            <F label="Kapasitas tamu"><Input name="guestCapacity" type="number" min={1} defaultValue={pkg?.guestCapacity} required /></F>
            <F label="Harga paket (Rp)"><Input name="price" type="number" min={0} defaultValue={pkg?.price} required /></F>
            <F label="Deskripsi" className="col-span-2"><Textarea name="description" rows={2} defaultValue={pkg?.description} /></F>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Isi paket</Label>
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <select value={r.itemId} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, itemId: e.target.value } : x)))} className={selectCls}>
                  {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                </select>
                <Input type="number" min={1} value={r.qty} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) || 1 } : x)))} className="w-20" />
                <Button type="button" variant="ghost" size="icon" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Hapus baris" disabled={rows.length === 1}><Trash /></Button>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRows([...rows, { itemId: items[0].id, qty: 1 }])}><Plus /> Tambah barang</Button>
              <p className="text-xs text-muted-foreground">Harga satuan total: <span className="tabular">{rupiah(normal)}</span></p>
            </div>
            <input type="hidden" name="contents" value={JSON.stringify(rows)} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Batal</DialogClose>
            <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />}Simpan paket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Tarif & ketentuan bisnis (FR-35, NFR-20) */
export function SettingsForm({ settings }: { settings: Settings }) {
  const [zones, setZones] = useState(settings.zones);
  const [banks, setBanks] = useState(settings.bankAccounts);
  const { pending, onSubmit } = useSave(saveSettings, "Pengaturan disimpan");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4 rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-5">
        <h2 className="font-medium">Pembayaran & jadwal</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="DP (%)"><Input name="dpPercent" type="number" min={0} max={100} defaultValue={settings.dpPercent} /></F>
          <F label="Batas bayar DP (jam)"><Input name="dpDeadlineHours" type="number" min={1} defaultValue={settings.dpDeadlineHours} /></F>
          <F label="Tarif tambahan hari (Rp)"><Input name="extraDayRate" type="number" min={0} defaultValue={settings.extraDayRate} /></F>
          <F label="Jendela pasang (H- maks / min)">
            <div className="flex gap-2"><Input name="maxDaysBefore" type="number" min={1} defaultValue={settings.installWindow.maxDaysBefore} /><Input name="minDaysBefore" type="number" min={0} defaultValue={settings.installWindow.minDaysBefore} /></div>
          </F>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Ongkir & pasang per zona</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setZones([...zones, { id: `z${zones.length + 1}`, name: `Zona ${zones.length + 1}`, maxKm: 0, fee: 0 }])}><Plus /> Zona</Button>
        </div>
        <div className="space-y-2">
          {zones.map((z, i) => (
            <div key={z.id} className="grid grid-cols-[1fr_90px_140px_auto] gap-2">
              <Input value={z.name} onChange={(e) => setZones(zones.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Nama zona" />
              <Input type="number" value={z.maxKm} onChange={(e) => setZones(zones.map((x, j) => (j === i ? { ...x, maxKm: Number(e.target.value) } : x)))} aria-label="Maks km" />
              <Input type="number" value={z.fee} onChange={(e) => setZones(zones.map((x, j) => (j === i ? { ...x, fee: Number(e.target.value) } : x)))} aria-label="Tarif" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setZones(zones.filter((_, j) => j !== i))} aria-label="Hapus zona"><Trash /></Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Kolom: nama · maks km · tarif (Rp)</p>
        </div>
        <input type="hidden" name="zones" value={JSON.stringify(zones)} />
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Rekening tujuan transfer</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setBanks([...banks, { bank: "", number: "", holder: "" }])}><Plus /> Rekening</Button>
        </div>
        {banks.map((b, i) => (
          <div key={i} className="grid grid-cols-[100px_1fr_1fr_auto] gap-2">
            <Input value={b.bank} placeholder="Bank" onChange={(e) => setBanks(banks.map((x, j) => (j === i ? { ...x, bank: e.target.value } : x)))} />
            <Input value={b.number} placeholder="Nomor" onChange={(e) => setBanks(banks.map((x, j) => (j === i ? { ...x, number: e.target.value } : x)))} />
            <Input value={b.holder} placeholder="Atas nama" onChange={(e) => setBanks(banks.map((x, j) => (j === i ? { ...x, holder: e.target.value } : x)))} />
            <Button type="button" variant="ghost" size="icon" onClick={() => setBanks(banks.filter((_, j) => j !== i))} aria-label="Hapus rekening"><Trash /></Button>
          </div>
        ))}
        <input type="hidden" name="bankAccounts" value={JSON.stringify(banks)} />
      </section>

      <section className="space-y-4 rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-5">
        <h2 className="font-medium">Alamat ambil sendiri</h2>
        <Input name="pickupAddress" defaultValue={settings.pickupAddress} />
      </section>

      <div className="flex justify-end"><Button type="submit" disabled={pending} className="h-10 px-6">{pending && <Loader2 className="animate-spin" />}Simpan pengaturan</Button></div>
    </form>
  );
}

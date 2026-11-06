"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CopyIcon as Copy, FileTextIcon as FileText, SpinnerGapIcon as Loader2, UploadSimpleIcon as Upload, XIcon as X } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { cancelOrder, respondProposal, uploadPaymentProof } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { rupiah } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function ProposalActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const act = (accept: boolean) =>
    start(async () => {
      await respondProposal(orderId, accept);
      toast.success(accept ? "Usulan disetujui. Total biaya diperbarui." : "Usulan ditolak. Admin akan menghubungi Anda.");
      router.refresh();
    });
  return (
    <div className="flex gap-2">
      <Button onClick={() => act(true)} disabled={pending}>{pending && <Loader2 className="animate-spin" />}Setujui usulan</Button>
      <Button variant="outline" onClick={() => act(false)} disabled={pending}>Tolak</Button>
    </div>
  );
}

export function PaymentUpload({ orderId, amount, settings }: { orderId: string; amount: number; settings: Settings }) {
  const [file, setFile] = useState<File>();
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  const pick = (f?: File) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type)) return toast.error("Format harus JPG, PNG, atau PDF.");
    if (f.size > 2 * 1024 * 1024) return toast.error("Ukuran file maksimal 2 MB.");
    setFile(f);
  };

  if (sent) return <p className="rounded-xl bg-violet-50 p-4 text-sm text-violet-800">Bukti bayar terkirim. Admin akan memverifikasi, biasanya kurang dari 1 jam di jam kerja.</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {settings.bankAccounts.map((b) => (
          <div key={b.number} className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <div>
              <p className="font-medium">{b.bank} · <span className="font-mono">{b.number}</span></p>
              <p className="text-xs text-muted-foreground">a.n. {b.holder}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(b.number); toast("Nomor disalin"); }}><Copy /> Salin</Button>
          </div>
        ))}
      </div>
      <p className="text-sm">Transfer tepat <b className="tabular">{rupiah(amount)}</b>, lalu unggah buktinya.</p>
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <FileText className="size-5 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setFile(undefined)} aria-label="Hapus"><X /></Button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 kawung rounded-[1.75rem] border border-dashed border-primary/25 text-pine p-5 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-accent/30">
          <Upload className="size-4" /> Pilih bukti transfer (JPG, PNG, PDF · maks. 2 MB)
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
      )}
      <Button
        className="w-full"
        disabled={!file || pending}
        onClick={() =>
          start(async () => {
            const fd = new FormData();
            fd.set("bukti", file!);
            await uploadPaymentProof(orderId, fd);
            setSent(true);
          })
        }
      >
        {pending && <Loader2 className="animate-spin" />}Kirim bukti bayar
      </Button>
    </div>
  );
}

export function CancelOrder({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" className="text-muted-foreground hover:text-destructive" />}>Batalkan pesanan</DialogTrigger>
      <DialogContent>
        <DialogTitle>Batalkan pesanan?</DialogTitle>
        <DialogDescription>Stok dan tanggal pemasangan akan dilepas. Pembayaran yang sudah masuk mengikuti kebijakan pembatalan mitra.</DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Tidak</DialogClose>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => start(async () => { await cancelOrder(orderId); toast.success("Pesanan dibatalkan"); router.push("/pesanan"); })}
          >
            {pending && <Loader2 className="animate-spin" />}Ya, batalkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

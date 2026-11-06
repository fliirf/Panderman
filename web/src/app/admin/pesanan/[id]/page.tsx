import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon as ArrowLeft, FileTextIcon as FileText, IdentificationCardIcon as IdCard, MapPinIcon as MapPin, PhoneIcon as Phone } from "@phosphor-icons/react/ssr";
import { CashPayment, PaymentReview, ReturnForm, ScheduleReview, StatusSelect } from "@/components/admin-order-actions";
import { Card, CostBreakdown, ScheduleList } from "@/components/order-parts";
import { StatusBadge } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { itemQuantities } from "@/lib/booking";
import { getAllItems, getLockedInstallDates, getOrder, getPackages, getSettings } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import { orderSummary } from "@/lib/order-utils";
import { cn } from "@/lib/utils";

async function Content({ params }: PageProps<"/admin/pesanan/[id]">) {
  const { id } = await params;
  const [order, items, packages, settings, locked] = await Promise.all([getOrder(id), getAllItems(), getPackages(), getSettings(), getLockedInstallDates()]);
  if (!order) notFound();
  const s = orderSummary(order, items, packages, settings);
  const returnLines = [...itemQuantities(order.lines, packages)].map(([itemId, qty]) => {
    const i = items.find((x) => x.id === itemId)!;
    return { itemId, qty, name: i.name, replacementPrice: i.replacementPrice };
  });
  const canReturn = ["dp_terverifikasi", "lunas"].includes(order.status);

  return (
    <>
      <Link href="/admin/pesanan" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Pesanan</Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl leading-[1.05]">{order.code}</h1><StatusBadge status={order.status} /></div>
          <p className="text-sm text-muted-foreground">Masuk {tanggal(order.createdAt.slice(0, 10))} · {order.scheme === "dp" ? `DP ${settings.dpPercent}%` : "Lunas"} · {order.method}</p>
        </div>
        {s.paid > 0 && <Link href={`/nota/${order.id}`} target="_blank" className={cn(buttonVariants({ variant: "outline" }))}><FileText /> Nota</Link>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {order.status === "menunggu_jadwal" && order.installDate && (
            <Card title="Tinjau jadwal pemasangan">
              {order.proposal?.status === "menunggu" ? (
                <p className="text-sm text-muted-foreground">Menunggu tanggapan penyewa atas usulan {tanggal(order.proposal.installDate)} (+{order.proposal.extraDays} hari).</p>
              ) : (
                <ScheduleReview orderId={order.id} installDate={order.installDate} lockedDates={locked} extraDayRate={settings.extraDayRate} />
              )}
            </Card>
          )}

          {s.pendingPayment && <Card title="Verifikasi pembayaran"><PaymentReview payment={s.pendingPayment} /></Card>}

          {canReturn && <Card title="Pengembalian barang"><ReturnForm orderId={order.id} lines={returnLines} /></Card>}

          <Card title="Rincian biaya"><CostBreakdown s={s} /></Card>

          <Card title="Riwayat pembayaran">
            {order.payments.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p> : (
              <ul className="divide-y text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5">
                    <span>{p.type.toUpperCase()} · {p.method} <span className="text-muted-foreground">· {tanggal(p.createdAt.slice(0, 10))}</span></span>
                    <span className="flex items-center gap-3"><span className="tabular">{rupiah(p.amount)}</span><span className={cn("text-xs", p.status === "terverifikasi" ? "text-emerald-700 dark:text-emerald-400" : p.status === "ditolak" ? "text-red-700 dark:text-red-400" : "text-violet-700 dark:text-violet-300")}>{p.status}</span></span>
                  </li>
                ))}
              </ul>
            )}
            {s.outstanding > 0 && order.status !== "menunggu_jadwal" && (
              <div className="mt-4 space-y-2 border-t pt-4"><p className="text-sm text-muted-foreground">Terima pembayaran tunai</p><CashPayment orderId={order.id} outstanding={s.outstanding} /></div>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Card title="Status"><StatusSelect status={order.status} /></Card>
          <Card title="Penyewa">
            <div className="space-y-3 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <a href={`https://wa.me/62${order.customer.phone.slice(1)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Phone className="size-4" />{order.customer.phone}</a>
              {order.address && <p className="flex gap-2"><MapPin className="size-4 shrink-0 text-muted-foreground" /><span>{order.address.text}{order.address.note && <span className="block text-muted-foreground">{order.address.note}</span>}<span className="block text-muted-foreground">{s.zone?.name}</span></span></p>}
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><IdCard className="size-4" />Lihat foto KTP</button>
            </div>
          </Card>
          <Card title="Jadwal"><ScheduleList order={order} /></Card>
          {order.penalty && <Card title="Denda"><p className="text-sm">{order.penalty.note}: <b className="tabular">{rupiah(order.penalty.amount)}</b></p></Card>}
        </div>
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/admin/pesanan/[id]">) {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><Content {...props} /></Suspense>;
}

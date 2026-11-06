import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon as ArrowLeft, CalendarDotsIcon as CalendarClock, FileTextIcon as FileText, MapPinIcon as MapPin } from "@phosphor-icons/react/ssr";
import { CancelOrder, PaymentUpload, ProposalActions } from "@/components/order-actions";
import { Card, CostBreakdown, ScheduleList, StatusTimeline } from "@/components/order-parts";
import { StatusBadge } from "@/components/shared";
import { PageSkeleton } from "@/components/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { getAllItems, getOrder, getPackages, getSettings } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import { orderSummary } from "@/lib/order-utils";
import { cn } from "@/lib/utils";

async function Content({ params }: PageProps<"/pesanan/[id]">) {
  const { id } = await params;
  const [order, items, packages, settings] = await Promise.all([getOrder(id), getAllItems(), getPackages(), getSettings()]);
  // ponytail: backend wajib cek order.userId === sesi user (NFR-06)
  if (!order) notFound();
  const s = orderSummary(order, items, packages, settings);
  const p = order.proposal?.status === "menunggu" ? order.proposal : undefined;
  const canPay = order.status === "menunggu_pembayaran" || (order.status === "dp_terverifikasi" && s.outstanding > 0) || (order.status === "selesai" && s.outstanding > 0);
  const payAmount = order.status === "menunggu_pembayaran" && order.scheme === "dp" ? s.price.dp : s.outstanding;
  const hasNota = s.paid > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Link href="/pesanan" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Pesanan saya</Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl leading-[1.05] sm:text-3xl">{order.code}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">Dipesan {tanggal(order.createdAt.slice(0, 10))} · {order.scheme === "dp" ? `DP ${settings.dpPercent}%` : "Lunas"} via {order.method}</p>
        </div>
        {hasNota && (
          <Link href={`/nota/${order.id}`} target="_blank" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-4")}>
            <FileText /> Nota {order.status === "lunas" || order.status === "selesai" ? "lunas" : "DP"}
          </Link>
        )}
      </div>

      <Card><StatusTimeline status={order.status} /></Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {p && (
            <Card className="bg-janur/15 ring-janur/50">
              <div className="flex gap-3">
                <CalendarClock className="size-5 shrink-0 text-[oklch(0.45_0.09_75)] dark:text-janur" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-medium">Admin mengusulkan perubahan jadwal</p>
                    <p className="text-sm text-muted-foreground">{p.note}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-background p-3"><dt className="text-xs text-muted-foreground">Pemasangan baru</dt><dd className="font-medium">{tanggal(p.installDate)}</dd></div>
                    <div className="rounded-lg bg-background p-3"><dt className="text-xs text-muted-foreground">Tambahan biaya</dt><dd className="font-medium tabular">{p.extraDays} hari · {rupiah(p.extraDays * settings.extraDayRate)}</dd></div>
                  </dl>
                  <ProposalActions orderId={order.id} />
                </div>
              </div>
            </Card>
          )}

          {order.status === "menunggu_jadwal" && !p && (
            <Card><p className="text-sm text-muted-foreground">Admin sedang meninjau tanggal pemasangan. Anda akan dikabari lewat WhatsApp, lalu bisa membayar {order.scheme === "dp" ? "DP" : "lunas"} dalam {settings.dpDeadlineHours} jam.</p></Card>
          )}

          {canPay && (
            <Card title={order.status === "menunggu_pembayaran" ? `Bayar ${order.scheme === "dp" ? "DP" : "lunas"}` : "Pelunasan"}>
              {order.method === "tunai" ? (
                <p className="text-sm text-muted-foreground">Siapkan <b className="text-foreground tabular">{rupiah(payAmount)}</b> tunai saat pemasangan/pengambilan.</p>
              ) : (
                <PaymentUpload orderId={order.id} amount={payAmount} settings={settings} />
              )}
            </Card>
          )}

          {s.pendingPayment && (
            <Card><p className="text-sm">Bukti bayar <b className="tabular">{rupiah(s.pendingPayment.amount)}</b> sedang diverifikasi admin.</p></Card>
          )}

          <Card title="Jadwal"><ScheduleList order={order} /></Card>

          {order.address && (
            <Card title="Lokasi acara">
              <div className="flex gap-3 text-sm">
                <MapPin className="size-5 shrink-0 text-primary" />
                <div><p>{order.address.text}</p>{order.address.note && <p className="text-muted-foreground">{order.address.note}</p>}</div>
              </div>
            </Card>
          )}

          {order.penalty && (
            <Card title="Tagihan denda" className="border-red-200">
              <p className="text-sm">{order.penalty.note}: <b className="tabular">{rupiah(order.penalty.amount)}</b></p>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card title="Rincian biaya"><CostBreakdown s={s} /></Card>
          {["menunggu_jadwal", "menunggu_pembayaran"].includes(order.status) && <CancelOrder orderId={order.id} />}
        </div>
      </div>
    </div>
  );
}

export default function Page(props: PageProps<"/pesanan/[id]">) {
  return <Suspense fallback={<PageSkeleton />}><Content {...props} /></Suspense>;
}

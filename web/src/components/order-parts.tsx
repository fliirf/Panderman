import { CheckIcon as Check } from "@phosphor-icons/react/ssr";
import { ItemImage } from "@/components/shared";
import { rupiah, tanggal } from "@/lib/format";
import type { orderSummary } from "@/lib/order-utils";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

const FLOW: { status: Order["status"][]; label: string }[] = [
  { status: ["menunggu_jadwal"], label: "Jadwal diajukan" },
  { status: ["menunggu_pembayaran"], label: "Jadwal disetujui" },
  { status: ["menunggu_verifikasi"], label: "Pembayaran dikirim" },
  { status: ["dp_terverifikasi", "lunas"], label: "Terverifikasi" },
  { status: ["selesai"], label: "Selesai" },
];

/** Timeline status pesanan (FR-26) */
export function StatusTimeline({ status }: { status: Order["status"] }) {
  if (status === "dibatalkan") return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Pesanan ini dibatalkan.</p>;
  const current = FLOW.findIndex((f) => f.status.includes(status));
  return (
    <ol className="grid grid-cols-5 gap-2">
      {FLOW.map((f, i) => (
        <li key={f.label} className="space-y-2">
          <div className="flex items-center">
            <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border text-[11px]", i < current && "border-primary bg-primary text-primary-foreground", i === current && "border-primary text-primary ring-4 ring-accent")}>
              {i < current ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            {i < FLOW.length - 1 && <span className={cn("h-px flex-1", i < current ? "bg-primary" : "bg-border")} />}
          </div>
          <p className={cn("text-[11px] leading-tight sm:text-xs", i === current ? "font-medium" : "text-muted-foreground")}>{f.label}</p>
        </li>
      ))}
    </ol>
  );
}

export function ScheduleList({ order }: { order: Order }) {
  const rows = [
    ["Acara", tanggal(order.eventStart) + (order.eventEnd !== order.eventStart ? ` – ${tanggal(order.eventEnd)}` : "")],
    order.installDate && ["Pemasangan tenda", tanggal(order.installDate)],
    ["Pembongkaran", tanggal(order.teardownDate)],
    order.prasmanan?.mode === "ambil" && ["Ambil prasmanan", tanggal(order.prasmanan.pickupDate!)],
    order.prasmanan?.mode === "ambil" && ["Kembali prasmanan", tanggal(order.prasmanan.returnDate!)],
  ].filter(Boolean) as [string, string][];
  return (
    <dl className="divide-y text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
      ))}
    </dl>
  );
}

export function CostBreakdown({ s }: { s: ReturnType<typeof orderSummary> }) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {s.lines.map((l, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <ItemImage category={l.category} image={l.image} sizes="64px" alt="" className="size-10 shrink-0 rounded-lg" iconSize={18} />
            <span className="min-w-0 flex-1">{l.qty}× {l.name}</span>
            <span className="tabular">{rupiah(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t pt-4 text-sm">
        <Row k="Subtotal" v={rupiah(s.price.subtotal)} />
        <Row k={`Ongkir & pasang${s.zone ? ` (${s.zone.name.split(" (")[0]})` : ""}`} v={s.zone ? rupiah(s.price.deliveryFee) : "Ambil sendiri"} />
        {s.price.extraDaysFee > 0 && <Row k="Tambahan hari sewa" v={rupiah(s.price.extraDaysFee)} />}
        {s.penalty > 0 && <Row k="Denda kerusakan" v={rupiah(s.penalty)} className="text-red-700 dark:text-red-400" />}
        <Row k="Total" v={rupiah(s.price.total + s.penalty)} className="border-t pt-3 text-base font-semibold" />
        <Row k="Sudah dibayar" v={rupiah(s.paid)} />
        <Row k="Sisa tagihan" v={rupiah(s.outstanding)} className="font-medium" />
      </dl>
    </div>
  );
}

function Row({ k, v, className }: { k: string; v: string; className?: string }) {
  return <div className={cn("flex justify-between", className)}><dt className={cn(!className && "text-muted-foreground")}>{k}</dt><dd className="tabular">{v}</dd></div>;
}

export function Card({ title, children, className, action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-5", className)}>
      {title && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-2xl">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

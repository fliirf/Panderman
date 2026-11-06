import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, StatusBadge } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllItems, getOrders, getPackages, getSettings } from "@/lib/data";
import { rupiah, STATUS, tanggalPendek } from "@/lib/format";
import { orderSummary } from "@/lib/order-utils";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pesanan" };

async function Content({ searchParams }: PageProps<"/admin/pesanan">) {
  const { status } = await searchParams;
  const [orders, items, packages, settings] = await Promise.all([getOrders(), getAllItems(), getPackages(), getSettings()]);
  const filtered = typeof status === "string" ? orders.filter((o) => o.status === status) : orders;
  const tabs: (OrderStatus | undefined)[] = [undefined, "menunggu_jadwal", "menunggu_pembayaran", "menunggu_verifikasi", "dp_terverifikasi", "lunas", "selesai", "dibatalkan"];

  return (
    <>
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const n = t ? orders.filter((o) => o.status === t).length : orders.length;
          return (
            <Link key={t ?? "all"} href={t ? `?status=${t}` : "?"} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm transition", status === t || (!status && !t) ? "border-pine bg-pine text-pine-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>
              {t ? STATUS[t].label.replace("Menunggu ", "") : "Semua"} <span className="opacity-60 tabular">{n}</span>
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Pesanan</TableHead>
              <TableHead>Penyewa</TableHead>
              <TableHead className="hidden md:table-cell">Pasang</TableHead>
              <TableHead className="hidden md:table-cell">Acara</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id} className="relative">
                <TableCell className="pl-5 font-medium"><Link href={`/admin/pesanan/${o.id}`} className="after:absolute after:inset-0">{o.code}</Link></TableCell>
                <TableCell><p>{o.customer.name}</p><p className="text-xs text-muted-foreground">{o.customer.phone}</p></TableCell>
                <TableCell className="hidden md:table-cell">{o.installDate ? tanggalPendek(o.installDate) : <span className="text-muted-foreground">–</span>}</TableCell>
                <TableCell className="hidden md:table-cell">{tanggalPendek(o.eventStart)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="pr-5 text-right tabular">{rupiah(orderSummary(o, items, packages, settings).price.total)}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Tidak ada pesanan.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default function Page(props: PageProps<"/admin/pesanan">) {
  return (
    <>
      <PageHeader title="Pesanan" description="Semua pesanan, dari pengajuan jadwal sampai selesai." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><Content {...props} /></Suspense>
    </>
  );
}

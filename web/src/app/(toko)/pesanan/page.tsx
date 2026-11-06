import type { Metadata } from "next";
import Link from "next/link";
import { CaretRightIcon as ChevronRight, ClipboardTextIcon as ClipboardList } from "@phosphor-icons/react/ssr";
import { ItemImage, PageHeader, StatusBadge } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { getAllItems, getMyOrders, getPackages, getSettings } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import { orderSummary } from "@/lib/order-utils";

export const metadata: Metadata = { title: "Pesanan saya" };

export default async function PesananPage() {
  const [orders, items, packages, settings] = await Promise.all([getMyOrders(), getAllItems(), getPackages(), getSettings()]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader title="Pesanan saya" description="Status, nota, dan tagihan untuk setiap pesanan." />
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 kawung rounded-[1.75rem] text-pine py-16 text-center">
          <ClipboardList className="size-10 text-muted-foreground" strokeWidth={1.25} />
          <p className="font-medium">Belum ada pesanan</p>
          <Link href="/katalog" className={buttonVariants()}>Mulai pesan</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const s = orderSummary(o, items, packages, settings);
            const action = o.proposal?.status === "menunggu" ? "Admin mengusulkan jadwal lain" : o.status === "menunggu_pembayaran" ? "Segera bayar DP" : s.penalty && s.outstanding ? "Ada tagihan denda" : undefined;
            return (
              <li key={o.id}>
                <Link href={`/pesanan/${o.id}`} className="group flex items-center gap-4 rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-4 transition hover:shadow-sm sm:p-5">
                  <ItemImage category={s.lines[0].category} image={s.lines[0].image} sizes="80px" alt="" className="hidden size-16 shrink-0 rounded-xl sm:block" iconSize={24} />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{o.code}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{s.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</p>
                    <p className="text-sm">Acara {tanggal(o.eventStart)} · <span className="font-medium tabular">{rupiah(s.price.total)}</span></p>
                    {action && <p className="text-xs font-medium text-[oklch(0.45_0.09_75)] dark:text-janur">● {action}</p>}
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

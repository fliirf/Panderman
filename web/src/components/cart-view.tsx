"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon as ArrowRight, InfoIcon as Info, HandbagSimpleIcon as ShoppingBag, TrashSimpleIcon as Trash } from "@phosphor-icons/react/ssr";
import { checkAvailability } from "@/app/actions";
import { QtyStepper } from "@/components/add-to-cart";
import { useCart } from "@/components/cart-provider";
import { DateRangeField } from "@/components/date-field";
import { ItemImage } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { resolveCart } from "@/lib/cart-utils";
import { addDays } from "@/lib/dates";
import { rupiah } from "@/lib/format";
import type { Item, Package } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CartView({ items, packages }: { items: Item[]; packages: Package[] }) {
  const cart = useCart();
  const lines = resolveCart(cart.lines, items, packages);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const [fetched, setStock] = useState<Record<string, number>>();
  const stock = cart.eventStart ? fetched : undefined;

  useEffect(() => {
    if (cart.eventStart) checkAvailability(addDays(cart.eventStart, -1), addDays(cart.eventEnd ?? cart.eventStart, 1)).then(setStock);
  }, [cart.eventStart, cart.eventEnd]);

  const shortage = (kind: string, id: string, qty: number) => {
    if (!stock) return undefined;
    if (kind === "item") return qty > (stock[id] ?? 0) ? stock[id] ?? 0 : undefined;
    const p = packages.find((x) => x.id === id);
    const max = p ? Math.min(...p.contents.map((c) => Math.floor((stock[c.itemId] ?? 0) / c.qty))) : 0;
    return qty > max ? max : undefined;
  };
  const hasShortage = lines.some((l) => shortage(l.kind, l.id, l.qty) !== undefined);

  if (!cart.ready) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;

  if (lines.length === 0)
    return (
      <div className="flex flex-col items-center gap-4 kawung rounded-[1.75rem] text-pine py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1.25} />
        <div>
          <p className="font-medium">Keranjang masih kosong</p>
          <p className="text-sm text-muted-foreground">Mulai dari katalog atau pilih paket hajatan.</p>
        </div>
        <Link href="/katalog" className={buttonVariants({ size: "lg" })}>Lihat katalog</Link>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06] p-4">
          <p className="mb-2 text-sm font-medium">Tanggal acara</p>
          <DateRangeField value={{ from: cart.eventStart, to: cart.eventEnd }} onChange={(r) => cart.setEvent(r.from, r.to)} />
        </div>

        <ul className="divide-y rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06]">
          {lines.map((l) => {
            const short = shortage(l.kind, l.id, l.qty);
            return (
              <li key={l.kind + l.id} className="flex gap-4 p-4">
                <ItemImage category={l.category} image={l.image} sizes="80px" alt="" className="size-20 shrink-0 rounded-xl" iconSize={28} />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={l.slug} className="font-medium hover:underline">{l.name}</Link>
                      <p className="text-xs text-muted-foreground">{l.kind === "package" ? "Paket" : "Satuan"} · {l.spec} · {rupiah(l.price)}</p>
                    </div>
                    <p className="shrink-0 font-semibold tabular">{rupiah(l.price * l.qty)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <QtyStepper value={l.qty} onChange={(n) => cart.setQty(l.kind, l.id, n)} />
                    <button onClick={() => cart.remove(l.kind, l.id)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
                      <Trash className="size-4" /> Hapus
                    </button>
                  </div>
                  {short !== undefined && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">Stok tidak cukup di tanggal ini, tersisa {short}.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="ticket-edge h-fit space-y-5 rounded-[1.75rem] bg-card p-6 shadow-[0_24px_48px_-30px_color-mix(in_oklch,var(--pine)_45%,transparent)] ring-1 ring-foreground/[0.06] [--cut:62%] lg:sticky lg:top-24">
        <p className="font-display text-2xl">Ringkasan</p>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal ({lines.length} item)</span><span className="tabular">{rupiah(subtotal)}</span></div>
        <p className="flex gap-2 rounded-2xl bg-secondary p-3.5 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0" /> Ongkir & pasang dihitung dari zona lokasi acara di langkah berikutnya.
        </p>
        <Link
          href="/checkout"
          aria-disabled={!cart.eventStart || hasShortage}
          className={cn(buttonVariants({ size: "lg" }), "w-full", (!cart.eventStart || hasShortage) && "pointer-events-none opacity-50")}
        >
          Lanjut checkout <ArrowRight />
        </Link>
        {!cart.eventStart && <p className="text-center text-xs text-muted-foreground">Pilih tanggal acara dulu.</p>}
      </aside>
    </div>
  );
}

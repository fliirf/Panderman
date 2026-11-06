import Link from "next/link";
import { UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { QuickAdd } from "@/components/add-to-cart";
import { ItemImage } from "@/components/shared";
import { CATEGORY_LABEL, rupiah, UNIT_LABEL } from "@/lib/format";
import type { Item, Package } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Status stok sebagai teks biasa (bukan label di atas foto) */
export function StockPill({ qty, className }: { qty?: number; className?: string }) {
  if (qty === undefined) return null;
  return (
    <span className={cn("text-xs font-medium tabular", qty === 0 ? "text-red-700 dark:text-red-400" : qty <= 3 ? "text-[oklch(0.5_0.1_75)] dark:text-janur" : "text-primary", className)}>
      {qty === 0 ? "Habis di tanggal ini" : qty <= 3 ? `Tinggal ${qty}` : `Tersedia ${qty.toLocaleString("id-ID")}`}
    </span>
  );
}

export function ItemCard({ item, available, query, tall }: { item: Item; available?: number; query: string; tall?: boolean }) {
  return (
    <Link href={`/barang/${item.slug}${query}`} className="group flex flex-col">
      <div className="relative">
        <ItemImage
          category={item.category}
          image={item.image}
          alt={item.name}
          className={cn("rounded-3xl transition-[border-radius] duration-700 ease-(--ease-out-expo) group-hover:rounded-[2rem] [&_img]:transition-transform [&_img]:duration-[1200ms] [&_img]:ease-(--ease-out-expo) group-hover:[&_img]:scale-[1.04]", tall ? "aspect-[4/5]" : "aspect-square", available === 0 && "opacity-55 grayscale")}
        />
        <div className="absolute right-3 bottom-3 translate-y-1 opacity-0 transition duration-500 ease-(--ease-spring) group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <QuickAdd kind="item" id={item.id} name={item.name} disabled={available === 0} />
        </div>
      </div>
      <div className="mt-3.5 space-y-1 px-1">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{CATEGORY_LABEL[item.category]}</span>
          <StockPill qty={available} />
        </div>
        <h3 className="font-display text-[1.4rem] leading-tight">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.spec}</p>
        <p className="pt-1 font-medium tabular">
          {rupiah(item.price)}
          <span className="text-sm font-normal text-muted-foreground"> / {UNIT_LABEL[item.unit]}</span>
        </p>
      </div>
    </Link>
  );
}

export function PackageCard({ pkg, available, items, query }: { pkg: Package; available?: number; items: Item[]; query: string }) {
  return (
    <Link href={`/paket/${pkg.slug}${query}`} className="group grid overflow-hidden rounded-[2rem] bg-card ring-1 ring-foreground/[0.06] transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_color-mix(in_oklch,var(--pine)_45%,transparent)] sm:grid-cols-[44%_1fr]">
      <ItemImage category="paket" image={pkg.image} alt={pkg.name} sizes="(min-width:1024px) 22vw, 100vw" className="aspect-[16/10] sm:aspect-auto sm:min-h-72 [&_img]:transition-transform [&_img]:duration-[1200ms] group-hover:[&_img]:scale-[1.04]" />
      <div className="flex flex-col gap-5 p-6 sm:p-7">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><UsersThreeIcon size={16} /> ±{pkg.guestCapacity} tamu</span>
            <StockPill qty={available} />
          </div>
          <h3 className="font-display text-3xl leading-tight">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground">{pkg.description}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {pkg.contents.map((c) => `${c.qty} ${items.find((i) => i.id === c.itemId)?.name}`).join(", ")}
        </p>
        <div className="mt-auto flex items-end justify-between border-t border-foreground/10 pt-4">
          <p className="text-lg font-medium tabular">{rupiah(pkg.price)}<span className="text-sm font-normal text-muted-foreground"> / acara</span></p>
          <QuickAdd kind="package" id={pkg.id} name={pkg.name} disabled={available === 0} />
        </div>
      </div>
    </Link>
  );
}

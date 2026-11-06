import Image from "next/image";
import Link from "next/link";
import { ArmchairIcon, BowlFoodIcon, FlowerIcon, LightbulbFilamentIcon, PackageIcon, TableIcon, TentIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { STATUS } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Category, OrderStatus } from "@/lib/types";

export const CATEGORY_ICON = {
  tenda: TentIcon,
  kursi: ArmchairIcon,
  meja: TableIcon,
  lighting: LightbulbFilamentIcon,
  dekorasi: FlowerIcon,
  prasmanan: BowlFoodIcon,
} satisfies Record<Category, unknown>;

/** Foto barang. Tanpa foto: bidang kawung bernuansa pinus, bukan kotak kosong. */
export function ItemImage({ category, image, alt, className, sizes = "(min-width: 1024px) 25vw, 50vw", priority, iconSize = 36 }: { category: Category | "paket"; image?: string; alt: string; className?: string; sizes?: string; priority?: boolean; iconSize?: number }) {
  const Icon = category === "paket" ? PackageIcon : CATEGORY_ICON[category];
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {image ? (
        <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="kawung absolute inset-0 grid place-items-center text-pine" role="img" aria-label={alt}>
          <Icon size={iconSize} weight="thin" />
        </div>
      )}
    </div>
  );
}

const TONE = {
  amber: "bg-janur/25 text-[oklch(0.42_0.08_80)] dark:text-janur",
  blue: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200",
  violet: "bg-violet-100 text-violet-900 dark:bg-violet-400/15 dark:text-violet-200",
  emerald: "bg-primary/10 text-primary",
  zinc: "bg-muted text-muted-foreground",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const s = STATUS[status];
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", TONE[s.tone], className)}>{s.label}</span>;
}

export function Logo({ href = "/", suffix, invert }: { href?: string; suffix?: string; invert?: boolean }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", invert && "text-white")}>
      <span className="grid size-8 place-items-center rounded-full bg-janur text-janur-foreground transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-[-8deg]">
        <TentIcon size={17} weight="fill" />
      </span>
      <span className="font-display text-[1.35rem] leading-none">
        {SITE.name}
        {suffix && <span className="ml-2 font-sans text-xs tracking-normal text-muted-foreground">{suffix}</span>}
      </span>
    </Link>
  );
}

export function PageHeader({ title, description, children }: { title: React.ReactNode; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
        {description && <p className="max-w-[60ch] text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/** Bar bawah di HP: harga + lompat ke panel pesan (anchor #pesan), tanpa JS. */
export function MobileBookBar({ price, unit }: { price: string; unit: string }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-4 rounded-full bg-card/90 py-2 pr-2 pl-5 shadow-[0_16px_40px_-16px_color-mix(in_oklch,var(--pine)_55%,transparent)] ring-1 ring-foreground/[0.07] backdrop-blur-xl lg:hidden">
      <p className="text-sm"><span className="font-medium tabular">{price}</span> <span className="text-muted-foreground">/ {unit}</span></p>
      <a href="#pesan" className="inline-flex h-10 items-center rounded-full bg-pine px-5 text-sm font-medium text-pine-foreground active:scale-[0.97]">Cek tanggal</a>
    </div>
  );
}

/** Kartu bersekat ganda: cangkang tipis + inti, sudut konsentris. Dipakai untuk panel penting saja. */
export function Bezel({ children, className, innerClassName, id }: { children: React.ReactNode; className?: string; innerClassName?: string; id?: string }) {
  return (
    <div id={id} className={cn("rounded-[1.75rem] bg-foreground/[0.04] p-1.5 ring-1 ring-foreground/[0.06]", className)}>
      <div className={cn("rounded-[calc(1.75rem-0.375rem)] bg-card dark:shadow-none shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_12px_32px_-18px_color-mix(in_oklch,var(--pine)_35%,transparent)]", innerClassName)}>{children}</div>
    </div>
  );
}

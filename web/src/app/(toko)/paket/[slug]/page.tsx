import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TruckIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { AddToCart } from "@/components/add-to-cart";
import { StockPill } from "@/components/catalog-cards";
import { DateParam } from "@/components/date-param";
import { Bezel, ItemImage, MobileBookBar } from "@/components/shared";
import { PageSkeleton } from "@/components/skeletons";
import { getAllItems, getEventAvailability, getPackage } from "@/lib/data";
import { rupiah } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/paket/[slug]">) {
  const pkg = await getPackage((await params).slug);
  return { title: pkg?.name ?? "Paket" };
}

async function Content({ params, searchParams }: PageProps<"/paket/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const pkg = await getPackage(slug);
  if (!pkg) notFound();
  const mulai = typeof sp.mulai === "string" ? sp.mulai : undefined;
  const selesai = typeof sp.selesai === "string" ? sp.selesai : undefined;
  const [items, avail] = await Promise.all([getAllItems(), getEventAvailability(mulai, selesai)]);
  const contents = pkg.contents.map((c) => ({ ...c, item: items.find((i) => i.id === c.itemId)! }));
  const normal = contents.reduce((s, c) => s + c.item.price * c.qty, 0);
  const qty = avail?.packages[pkg.id];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pb-0">
      <MobileBookBar price={rupiah(pkg.price)} unit="acara" />
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/katalog?jenis=paket" className="hover:text-foreground">Paket</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{pkg.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="space-y-10">
          <ItemImage category="paket" image={pkg.image} alt={pkg.name} priority sizes="(min-width:1024px) 55vw, 100vw" className="aspect-[4/3] rounded-[2rem]" />
          <section>
            <h2 className="mb-5 font-display text-3xl">Isi paket</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {contents.map((c) => (
                <li key={c.itemId}>
                  <Link href={`/barang/${c.item.slug}`} className="group flex items-center gap-4 rounded-2xl bg-card p-2.5 pr-4 ring-1 ring-foreground/[0.06] transition-shadow duration-500 hover:shadow-[0_14px_30px_-20px_color-mix(in_oklch,var(--pine)_45%,transparent)]">
                    <ItemImage category={c.item.category} image={c.item.image} alt="" sizes="64px" className="size-16 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.item.spec}</span>
                    </span>
                    <span className="font-display text-2xl tabular">{c.qty}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><UsersThreeIcon size={16} /> Untuk ±{pkg.guestCapacity} tamu</p>
            <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl">{pkg.name}</h1>
            <p className="max-w-[52ch] text-lg text-muted-foreground">{pkg.description}</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="text-2xl font-medium tabular">{rupiah(pkg.price)}</p>
              {normal > pkg.price && <p className="text-sm text-muted-foreground tabular"><s>{rupiah(normal)}</s> kalau sewa satuan, hemat {rupiah(normal - pkg.price)}</p>}
            </div>
          </div>

          <Bezel className="scroll-mt-24" innerClassName="space-y-4 p-5 sm:p-6" id="pesan">
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl">Cek tanggal acara</p>
              <StockPill qty={qty} />
            </div>
            <Suspense><DateParam /></Suspense>
            <AddToCart kind="package" id={pkg.id} name={pkg.name} max={qty} />
          </Bezel>

          <p className="flex gap-3 text-sm"><TruckIcon size={20} className="shrink-0 text-primary" />Diantar, dipasang, dan dibongkar H+1 oleh tim kami.</p>
        </div>
      </div>
    </div>
  );
}

export default function PaketPage(props: PageProps<"/paket/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

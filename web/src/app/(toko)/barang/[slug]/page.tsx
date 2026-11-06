import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShieldCheckIcon, StorefrontIcon, TruckIcon } from "@phosphor-icons/react/ssr";
import { AddToCart } from "@/components/add-to-cart";
import { StockPill } from "@/components/catalog-cards";
import { DateParam } from "@/components/date-param";
import { Bezel, ItemImage, MobileBookBar } from "@/components/shared";
import { PageSkeleton } from "@/components/skeletons";
import { getEventAvailability, getItem, getSettings } from "@/lib/data";
import { CATEGORY_LABEL, rupiah, UNIT_LABEL } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/barang/[slug]">) {
  const item = await getItem((await params).slug);
  return { title: item?.name ?? "Barang" };
}

async function Content({ params, searchParams }: PageProps<"/barang/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const item = await getItem(slug);
  if (!item) notFound();
  const mulai = typeof sp.mulai === "string" ? sp.mulai : undefined;
  const selesai = typeof sp.selesai === "string" ? sp.selesai : undefined;
  const [avail, settings] = await Promise.all([getEventAvailability(mulai, selesai), getSettings()]);
  const qty = avail?.items[item.id];
  const selfPickup = item.category === "prasmanan";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pb-0">
      <MobileBookBar price={rupiah(item.price)} unit={UNIT_LABEL[item.unit]} />
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/katalog" className="hover:text-foreground">Katalog</Link>
        <span aria-hidden>/</span>
        <Link href={`/katalog?kategori=${item.category}`} className="hover:text-foreground">{CATEGORY_LABEL[item.category]}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <ItemImage category={item.category} image={item.image} alt={item.name} priority sizes="(min-width:1024px) 55vw, 100vw" className="aspect-[4/5] rounded-[2rem] lg:sticky lg:top-24 lg:self-start" />

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl">{item.name}</h1>
            <p className="max-w-[52ch] text-lg text-muted-foreground">{item.description}</p>
            <p className="text-2xl font-medium tabular">
              {rupiah(item.price)} <span className="text-base font-normal text-muted-foreground">/ {UNIT_LABEL[item.unit]} per acara</span>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-6 border-y border-foreground/10 py-5 text-sm">
            <div><dt className="text-muted-foreground">Ukuran / kapasitas</dt><dd className="mt-1 font-medium">{item.spec}</dd></div>
            <div><dt className="text-muted-foreground">Dihitung per</dt><dd className="mt-1 font-medium">{UNIT_LABEL[item.unit]}</dd></div>
          </dl>

          <Bezel className="scroll-mt-24" innerClassName="space-y-4 p-5 sm:p-6" id="pesan">
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl">Cek tanggal acara</p>
              <StockPill qty={qty} />
            </div>
            <Suspense><DateParam /></Suspense>
            <AddToCart kind="item" id={item.id} name={item.name} max={qty} />
          </Bezel>

          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              {selfPickup ? <StorefrontIcon size={20} className="shrink-0 text-primary" /> : <TruckIcon size={20} className="shrink-0 text-primary" />}
              <span>{selfPickup ? <>Bisa <b className="font-medium">diantar</b> atau <b className="font-medium">diambil sendiri</b> di {settings.pickupAddress}.</> : <>Diantar dan dipasang tim kami. Ongkir sesuai zona, mulai {rupiah(settings.zones[0].fee)}.</>}</span>
            </li>
            <li className="flex gap-3"><ShieldCheckIcon size={20} className="shrink-0 text-primary" /><span>Tanpa deposit, cukup foto KTP. Denda hanya bila rusak atau hilang, sesuai harga barang.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function BarangPage(props: PageProps<"/barang/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

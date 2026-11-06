import { PageSkeleton } from "@/components/skeletons";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog-filters";
import { ItemCard, PackageCard } from "@/components/catalog-cards";
import { getAllItems, getEventAvailability, getItems, getPackages } from "@/lib/data";
import { CATEGORY_LABEL, tanggal } from "@/lib/format";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Katalog" };

async function Content({ searchParams }: PageProps<"/katalog">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const mulai = str("mulai");
  const selesai = str("selesai");
  const kategori = str("kategori") as Category | undefined;
  const isPaket = str("jenis") === "paket";

  const [items, packages, allItems, avail] = await Promise.all([
    getItems({ category: kategori, q: str("q"), maxPrice: Number(str("harga")) || undefined }),
    getPackages({ minGuests: Number(str("tamu")) || undefined }),
    getAllItems(),
    getEventAvailability(mulai, selesai),
  ]);
  const query = mulai ? `?mulai=${mulai}${selesai ? `&selesai=${selesai}` : ""}` : "";
  const count = isPaket ? packages.length : items.length;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6">
      <div className="mb-10 space-y-3">
        <h1 className="font-display text-5xl leading-[1.02] sm:text-7xl">{isPaket ? <>Paket <em>hajatan</em></> : kategori ? CATEGORY_LABEL[kategori] : <>Semua <em>barang</em></>}</h1>
        <p className="max-w-[60ch] text-muted-foreground">
          {mulai ? (
            <>Sisa stok untuk acara <span className="font-medium text-foreground">{tanggal(mulai)}{selesai && selesai !== mulai ? ` sampai ${tanggal(selesai)}` : ""}</span>, sudah termasuk hari pasang & bongkar.</>
          ) : (
            "Pilih tanggal acara untuk melihat sisa stok."
          )}
        </p>
      </div>

      <Suspense>
        <CatalogFilters />
      </Suspense>

      <p className="mt-10 mb-5 text-sm text-muted-foreground">{count} {isPaket ? "paket" : "barang"}</p>

      {count === 0 ? (
        <div className="kawung rounded-[2rem] py-24 text-center text-pine"><p className="font-display text-3xl">Belum ada yang cocok.</p><p className="mt-2 text-sm text-muted-foreground">Coba kategori lain atau hapus kata pencarian.</p></div>
      ) : isPaket ? (
        <div className="grid gap-5">
          {packages.map((p) => <PackageCard key={p.id} pkg={p} items={allItems} available={avail?.packages[p.id]} query={query} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-y-14">
          {items.map((i) => <ItemCard key={i.id} item={i} tall available={avail?.items[i.id]} query={query} />)}
        </div>
      )}
    </div>
  );
}

export default function KatalogPage(props: PageProps<"/katalog">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

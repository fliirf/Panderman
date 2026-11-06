import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, UsersThreeIcon, WhatsappLogoIcon } from "@phosphor-icons/react/ssr";
import { HeroSearch } from "@/components/hero-search";
import { getAllItems, getPackages } from "@/lib/data";
import { HERO_PHOTO } from "@/lib/data/mock";
import { CATEGORY_LABEL, rupiah } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Category } from "@/lib/types";

const STEPS = [
  { title: "Pilih tanggal, lalu barang", body: "Sisa stok langsung menyesuaikan tanggal acara, termasuk hari pasang dan bongkar." },
  { title: "Ajukan hari pemasangan", body: "Pilih H-5 sampai H-1. Admin mengonfirmasi atau menawarkan tanggal lain." },
  { title: "Bayar DP atau lunas", body: "Transfer lalu unggah bukti, atau bayar tunai saat tim kami datang." },
  { title: "Terima nota, tinggal hajatan", body: "Nota terbit otomatis. Tim kembali H+1 untuk membongkar." },
];

export default async function Home() {
  const [items, packages] = await Promise.all([getAllItems(), getPackages()]);
  const cats = (Object.keys(CATEGORY_LABEL) as Category[]).map((c) => {
    const list = items.filter((i) => i.category === c);
    return { c, count: list.length, cover: list[0]?.image, from: Math.min(...list.map((i) => i.price)) };
  });
  const [big, ...rest] = [packages[1], packages[0], packages[2]];

  return (
    <>
      {/* Hero: foto penuh dalam bingkai, judul + bar pemesanan */}
      <section className="px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="relative mx-auto flex min-h-[min(calc(100dvh-6.5rem),780px)] max-w-[1400px] flex-col justify-end overflow-hidden rounded-[2rem] bg-pine">
          <Image src={HERO_PHOTO} alt="Tenda resepsi berplafon kain dengan meja bundar dan kursi tamu" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,oklch(0.2_0.04_168/0.55)_60%,oklch(0.18_0.04_168/0.92))]" />
          <div className="relative grid gap-8 p-5 pb-6 sm:p-10 lg:p-14">
            <div className="max-w-2xl space-y-5 text-white">
              <h1 className="rise font-display text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[5.25rem]">
                Hajatan rapi, <em className="text-janur">tamu betah.</em>
              </h1>
              <p className="rise max-w-md text-base text-white/80 sm:text-lg" style={{ "--i": 1 } as React.CSSProperties}>
                Tenda, kursi, dekorasi, dan alat prasmanan di Batu dan Malang. Cek stok sesuai tanggal, kami yang pasang.
              </p>
            </div>
            <div className="rise max-w-3xl" style={{ "--i": 2 } as React.CSSProperties}>
              <HeroSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Fakta layanan, satu baris tenang */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <dl className="grid divide-foreground/10 border-y border-foreground/10 sm:grid-cols-3 sm:divide-x">
          {[["Diantar & dipasang", "Tim kami datang, memasang, dan membongkar."], [`DP ${50}%`, "Sisanya dibayar saat pemasangan."], ["Tanpa deposit", "Cukup unggah foto KTP sekali."]].map(([t, d]) => (
            <div key={t} className="flex items-baseline gap-3 py-5 sm:block sm:px-6 sm:first:pl-0">
              <dt className="font-display text-2xl">{t}</dt>
              <dd className="text-sm text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Kategori: geser horizontal, foto potret */}
      <section className="reveal pt-28">
        <div className="mx-auto mb-8 flex max-w-6xl items-end justify-between gap-6 px-4 sm:px-6">
          <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">Isi gudang kami</h2>
          <Link href="/katalog" className="group hidden items-center gap-1.5 text-sm sm:flex">
            Semua barang <ArrowUpRightIcon className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        <div className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] sm:scroll-px-6 sm:px-6">
          {cats.map(({ c, count, cover, from }, i) => (
            <Link key={c} href={`/katalog?kategori=${c}`} className="group w-[68%] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]">
              <div className={`relative overflow-hidden rounded-3xl bg-secondary ${i % 2 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                {cover && <Image src={cover} alt={CATEGORY_LABEL[c]} fill sizes="(min-width:1024px) 25vw, 70vw" className="object-cover transition-transform duration-[1200ms] ease-(--ease-out-expo) group-hover:scale-[1.04]" />}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl">{CATEGORY_LABEL[c]}</p>
                <p className="text-xs text-muted-foreground">{count} pilihan · mulai {rupiah(from)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Paket: bento asimetris */}
      <section className="reveal mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <div className="mb-10 max-w-xl space-y-3">
          <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">Paket yang sudah <em>dihitung pas</em></h2>
          <p className="text-muted-foreground">Isi disesuaikan jumlah tamu, harganya lebih ringan daripada sewa satuan.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:grid-rows-2">
          <Link href={`/paket/${big.slug}`} className="group relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-[2rem] bg-pine p-7 text-white lg:row-span-2">
            {big.image && <Image src={big.image} alt={big.name} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-out-expo) group-hover:scale-[1.03]" />}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,oklch(0.18_0.04_168/0.9))]" />
            <div className="relative flex items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-1.5 text-sm text-white/75"><UsersThreeIcon size={16} /> ±{big.guestCapacity} tamu</p>
                <h3 className="font-display text-4xl">{big.name}</h3>
                <p className="max-w-sm text-sm text-white/75">{big.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-white/60">per acara</p>
                <p className="text-xl font-medium tabular">{rupiah(big.price)}</p>
              </div>
            </div>
          </Link>
          {rest.map((p) => (
            <Link key={p.id} href={`/paket/${p.slug}`} className="group grid grid-cols-[42%_1fr] overflow-hidden rounded-[2rem] bg-card ring-1 ring-foreground/[0.06] transition-shadow duration-500 hover:shadow-[0_20px_40px_-24px_color-mix(in_oklch,var(--pine)_40%,transparent)]">
              <div className="relative min-h-52">
                {p.image && <Image src={p.image} alt={p.name} fill sizes="(min-width:1024px) 20vw, 42vw" className="object-cover transition-transform duration-[1200ms] ease-(--ease-out-expo) group-hover:scale-[1.05]" />}
              </div>
              <div className="flex flex-col justify-between gap-4 p-6">
                <div className="space-y-1.5">
                  <h3 className="font-display text-3xl">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <p className="text-sm text-muted-foreground">±{p.guestCapacity} tamu</p>
                  <p className="font-medium tabular">{rupiah(p.price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cara pesan: split editorial, judul menempel */}
      <section id="cara-pesan" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-4 pt-32 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-5xl leading-[1.02] sm:text-6xl">Empat langkah, <em>tanpa telepon bolak-balik.</em></h2>
        </div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="reveal grid grid-cols-[3.5rem_1fr] gap-4 rounded-3xl p-5 transition-colors duration-500 hover:bg-card sm:p-7">
              <span className="font-display text-5xl leading-none text-janur [-webkit-text-stroke:1px_var(--pine)] tabular">{i + 1}</span>
              <div className="space-y-1.5 pt-1">
                <p className="text-lg font-medium">{s.title}</p>
                <p className="text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Ajakan konsultasi: bidang janur bermotif kawung */}
      <section className="reveal mx-auto max-w-6xl px-4 pt-28 sm:px-6">
        <div className="kawung relative overflow-hidden rounded-[2rem] bg-janur px-7 py-12 text-pine sm:px-12 sm:py-16">
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl font-display text-4xl leading-[1.05] sm:text-5xl">Tamu di atas 300? Kita hitung kebutuhannya bareng.</h2>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="group inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-pine pr-1.5 pl-6 text-sm font-medium text-pine-foreground transition-transform duration-300 ease-(--ease-spring) active:scale-[0.97]">
              Chat WhatsApp
              <span className="grid size-9 place-items-center rounded-full bg-white/12 transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-12"><WhatsappLogoIcon size={18} weight="fill" /></span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

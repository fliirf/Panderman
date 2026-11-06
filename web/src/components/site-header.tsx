"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HandbagSimpleIcon } from "@phosphor-icons/react/ssr";
import { useCart } from "@/components/cart-provider";
import { Logo } from "@/components/shared";
import { ThemeSwitch } from "@/components/theme";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/katalog", label: "Katalog" },
  { href: "/katalog?jenis=paket", label: "Paket" },
  { href: "/#cara-pesan", label: "Cara pesan" },
  { href: "/pesanan", label: "Pesanan saya" },
];

function NavList({ path }: { path: string }) {
  return (
    <>
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground",
            path === n.href && "bg-foreground/[0.06] text-foreground",
          )}
        >
          {n.label}
        </Link>
      ))}
    </>
  );
}

function ActiveNav() {
  return <NavList path={usePathname()} />;
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className="relative z-50 grid size-10 place-items-center rounded-full md:hidden"
      >
        <span className={cn("absolute h-[1.5px] w-5 bg-foreground transition-transform duration-500 ease-(--ease-spring)", open ? "rotate-45" : "-translate-y-[4px]")} />
        <span className={cn("absolute h-[1.5px] w-5 bg-foreground transition-transform duration-500 ease-(--ease-spring)", open ? "-rotate-45" : "translate-y-[4px]")} />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-30 flex flex-col justify-between bg-background px-6 pt-28 pb-10 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col">
            {[...NAV, { href: "/masuk", label: "Masuk" }].map((n, i) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} style={{ "--i": i } as React.CSSProperties} className="rise border-b border-foreground/10 py-4 font-display text-4xl">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="rise flex items-center justify-between" style={{ "--i": 6 } as React.CSSProperties}><p className="text-sm text-muted-foreground">WhatsApp {SITE.phone}</p><ThemeSwitch /></div>
        </div>,
        document.body,
      )}
    </>
  );
}

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 rounded-full bg-card/80 pr-2 pl-5 shadow-[0_10px_30px_-18px_color-mix(in_oklch,var(--pine)_45%,transparent)] ring-1 ring-foreground/[0.07] backdrop-blur-xl">
        <Logo />
        <nav className="ml-4 hidden items-center gap-0.5 md:flex">
          <Suspense fallback={<NavList path="" />}><ActiveNav /></Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/keranjang" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")} aria-label={`Keranjang, ${count} item`}>
            <HandbagSimpleIcon size={20} />
            {count > 0 && (
              <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-janur text-[10px] font-semibold text-janur-foreground tabular">{count}</span>
            )}
          </Link>
          <Link href="/masuk" className={cn(buttonVariants(), "hidden sm:inline-flex")}>Masuk</Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-foreground/10">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-sm font-display text-2xl leading-snug">Tenda berdiri sebelum tamu datang, dibongkar sesudah tamu pulang.</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Sewa</p>
          <ul className="space-y-2">
            <li><Link className="hover:underline" href="/katalog?kategori=tenda">Tenda</Link></li>
            <li><Link className="hover:underline" href="/katalog?kategori=kursi">Kursi & meja</Link></li>
            <li><Link className="hover:underline" href="/katalog?kategori=prasmanan">Alat prasmanan</Link></li>
            <li><Link className="hover:underline" href="/katalog?jenis=paket">Paket hajatan</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Gudang</p>
          <address className="space-y-2 not-italic">
            <p>Jl. Panderman No. 12, Batu</p>
            <p>WhatsApp {SITE.phone}</p>
            <p>Setiap hari, 07.00 sampai 20.00</p>
          </address>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-foreground/10 px-4 py-5 text-xs text-muted-foreground sm:px-6">
        <p>© 2026 {SITE.name}</p>
        <div className="flex items-center gap-4"><p className="hidden sm:block">Data KTP & alamat hanya dilihat Anda dan admin.</p><ThemeSwitch /></div>
      </div>
    </footer>
  );
}

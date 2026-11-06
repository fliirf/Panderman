"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { SignOutIcon } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/shared";
import { ThemeSwitch } from "@/components/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/jadwal", label: "Jadwal" },
  { href: "/admin/barang", label: "Barang" },
  { href: "/admin/paket", label: "Paket" },
  { href: "/admin/pengaturan", label: "Tarif" },
];

function Tabs({ badge, path }: { badge: number; path: string }) {
  return (
    <nav className="flex gap-0.5 overflow-x-auto [scrollbar-width:none]">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300",
              active ? "bg-pine text-pine-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {n.label}
            {n.href === "/admin/pesanan" && badge > 0 && (
              <span className="grid size-4.5 place-items-center rounded-full bg-janur text-[10px] font-semibold text-janur-foreground tabular">{badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveTabs({ badge }: { badge: number }) {
  return <Tabs badge={badge} path={usePathname()} />;
}

/** Navigasi admin: pill mengambang di atas, sama bahasanya dengan situs publik. */
export function AdminTopbar({ badge }: { badge: number }) {
  const tabs = <Suspense fallback={<Tabs badge={badge} path="" />}><ActiveTabs badge={badge} /></Suspense>;
  return (
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[1.75rem] bg-card/85 p-1.5 shadow-[0_10px_30px_-18px_color-mix(in_oklch,var(--pine)_45%,transparent)] ring-1 ring-foreground/[0.07] backdrop-blur-xl md:rounded-full">
        <div className="flex h-11 items-center gap-4 pl-3.5">
          <Logo href="/admin" suffix="Admin" />
          <div className="hidden min-w-0 flex-1 justify-center md:flex">{tabs}</div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeSwitch className="hidden sm:inline-flex" />
            <span className="hidden text-right text-xs leading-tight xl:block">
              <span className="block font-medium">Admin Mitra</span>
              <span className="text-muted-foreground">admin@panderman.test</span>
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-janur text-xs font-semibold text-janur-foreground">AM</span>
            <Link href="/masuk" aria-label="Keluar" className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <SignOutIcon size={18} />
            </Link>
          </div>
        </div>
        <div className="px-1 pt-1.5 pb-0.5 md:hidden">{tabs}</div>
      </div>
    </header>
  );
}

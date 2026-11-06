"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/ssr";
import { useCart } from "@/components/cart-provider";
import { DateRangeField } from "@/components/date-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRICE = [
  { value: "0", label: "Semua harga" },
  { value: "50000", label: "≤ Rp50.000" },
  { value: "500000", label: "≤ Rp500.000" },
  { value: "5000000", label: "≤ Rp5.000.000" },
];
const GUESTS = [
  { value: "0", label: "Semua kapasitas" },
  { value: "100", label: "≥ 100 tamu" },
  { value: "200", label: "≥ 200 tamu" },
  { value: "300", label: "≥ 300 tamu" },
];

export function CatalogFilters() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const cart = useCart();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const jenis = sp.get("jenis") === "paket" ? "paket" : "barang";
  const kategori = sp.get("kategori");
  const mulai = sp.get("mulai") ?? undefined;
  const selesai = sp.get("selesai") ?? undefined;

  function update(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${path}?${next}`, { scroll: false });
  }

  // tanggal dari keranjang dipakai kalau URL belum punya
  useEffect(() => {
    if (!mulai && cart.ready && cart.eventStart) update({ mulai: cart.eventStart, selesai: cart.eventEnd });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.ready]);

  // pencarian ketik, dengan jeda
  useEffect(() => {
    const t = setTimeout(() => q !== (sp.get("q") ?? "") && update({ q: q || undefined }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-300",
      active ? "bg-pine text-pine-foreground" : "bg-card text-muted-foreground ring-1 ring-foreground/[0.07] hover:text-foreground",
    );

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5 rounded-[1.75rem] bg-foreground/[0.04] p-1.5 ring-1 ring-foreground/[0.06] sm:grid-cols-[1fr_1.2fr_auto] sm:rounded-full">
        <DateRangeField
          value={{ from: mulai, to: selesai }}
          onChange={(r) => {
            cart.setEvent(r.from, r.to);
            update({ mulai: r.from, selesai: r.to });
          }}
          placeholder="Tanggal acara (untuk cek stok)"
          className="h-12 rounded-full border-0 px-5"
        />
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tenda, kursi, lampu" className="h-12 rounded-full border-0 pl-11" />
        </div>
        <div className="flex rounded-full bg-card p-1">
          {(["barang", "paket"] as const).map((j) => (
            <button
              key={j}
              onClick={() => update({ jenis: j === "paket" ? "paket" : undefined, kategori: undefined })}
              className={cn("h-10 flex-1 rounded-full px-5 text-sm whitespace-nowrap transition-colors duration-300", jenis === j ? "bg-janur font-medium text-janur-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {j === "barang" ? "Satuan" : "Paket"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {jenis === "barang" ? (
          <div className="-mx-4 flex flex-1 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <button className={chip(!kategori)} onClick={() => update({ kategori: undefined })}>Semua</button>
            {Object.entries(CATEGORY_LABEL).map(([k, label]) => (
              <button key={k} className={chip(kategori === k)} onClick={() => update({ kategori: k })}>{label}</button>
            ))}
          </div>
        ) : (
          <div className="hidden flex-1 sm:block" />
        )}
        <Select
          items={jenis === "barang" ? PRICE : GUESTS}
          value={(jenis === "barang" ? sp.get("harga") : sp.get("tamu")) ?? "0"}
          onValueChange={(v) => update(jenis === "barang" ? { harga: v === "0" ? undefined : (v as string) } : { tamu: v === "0" ? undefined : (v as string) })}
        >
          <SelectTrigger className="w-full shrink-0 sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(jenis === "barang" ? PRICE : GUESTS).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

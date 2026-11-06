"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { useCart } from "@/components/cart-provider";
import { DateRangeField } from "@/components/date-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABEL } from "@/lib/format";

const OPTIONS = [{ value: "semua", label: "Semua kebutuhan" }, { value: "paket", label: "Paket hajatan" }, ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))];

/** Bar pemesanan kaca di atas foto hero: tanggal dulu, baru barang. */
export function HeroSearch() {
  const router = useRouter();
  const cart = useCart();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [cat, setCat] = useState("semua");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (range.from) cart.setEvent(range.from, range.to);
    const q = new URLSearchParams();
    if (range.from) q.set("mulai", range.from);
    if (range.to) q.set("selesai", range.to);
    if (cat === "paket") q.set("jenis", "paket");
    else if (cat !== "semua") q.set("kategori", cat);
    router.push(`/katalog?${q}`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-1.5 rounded-[1.75rem] bg-white/14 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] ring-1 ring-white/25 backdrop-blur-xl sm:grid-cols-[1.25fr_1fr_auto] sm:rounded-full"
    >
      <label className="block">
        <span className="sr-only">Tanggal acara</span>
        <DateRangeField value={range} onChange={setRange} className="h-12 rounded-full border-0 bg-card/95 px-5 text-foreground hover:bg-card" />
      </label>
      <label className="block">
        <span className="sr-only">Kebutuhan</span>
        <Select items={OPTIONS} value={cat} onValueChange={(v) => setCat(v as string)}>
          <SelectTrigger className="h-12! w-full border-0 bg-card/95 px-5 text-foreground hover:bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <button type="submit" className="group flex h-12 items-center justify-between gap-3 rounded-full bg-janur pr-1.5 pl-6 text-sm font-medium text-janur-foreground transition-transform duration-300 ease-(--ease-spring) active:scale-[0.97]">
        Cek stok
        <span className="grid size-9 place-items-center rounded-full bg-janur-foreground/10 transition-transform duration-500 ease-(--ease-spring) group-hover:translate-x-0.5">
          <ArrowRightIcon size={16} weight="bold" />
        </span>
      </button>
    </form>
  );
}

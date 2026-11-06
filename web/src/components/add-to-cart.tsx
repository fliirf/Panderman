"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MinusIcon as Minus, PlusIcon as Plus, HandbagSimpleIcon as ShoppingBag } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import type { CartLine } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QtyStepper({ value, onChange, max, className }: { value: number; onChange: (n: number) => void; max?: number; className?: string }) {
  return (
    <div className={cn("inline-flex h-10 items-center rounded-full border border-input bg-card", className)}>
      <button type="button" aria-label="Kurangi" className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus className="size-3.5" />
      </button>
      <input
        aria-label="Jumlah"
        inputMode="numeric"
        className="h-full w-12 bg-transparent text-center text-sm tabular outline-none"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, "") || "1");
          onChange(max ? Math.min(n, max) : n);
        }}
      />
      <button type="button" aria-label="Tambah" className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground disabled:opacity-40" disabled={max !== undefined && value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function toastAdded(name: string, push: (href: string) => void) {
  toast.success(`${name} masuk keranjang`, { action: { label: "Lihat", onClick: () => push("/keranjang") } });
}

/** Tombol kecil di kartu katalog */
export function QuickAdd({ kind, id, name, disabled }: { kind: CartLine["kind"]; id: string; name: string; disabled?: boolean }) {
  const { add } = useCart();
  const router = useRouter();
  return (
    <Button
      size="icon-lg"
      variant="outline"
      disabled={disabled}
      aria-label={`Tambah ${name} ke keranjang`}
      onClick={(e) => {
        e.preventDefault();
        add({ kind, id, qty: 1 });
        toastAdded(name, router.push);
      }}
      className="border-0 bg-card/95 shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--pine)_50%,transparent)] hover:bg-janur hover:text-janur-foreground"
    >
      <Plus size={18} />
    </Button>
  );
}

/** Blok jumlah + tombol di halaman detail */
export function AddToCart({ kind, id, name, max, defaultQty = 1 }: { kind: CartLine["kind"]; id: string; name: string; max?: number; defaultQty?: number }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(defaultQty);
  const out = max === 0;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <QtyStepper value={qty} onChange={setQty} max={max} className="h-12" />
      <Button
        disabled={out}
        size="lg" className="flex-1"
        onClick={() => {
          add({ kind, id, qty });
          toastAdded(name, router.push);
        }}
      >
        <ShoppingBag /> {out ? "Stok habis di tanggal ini" : "Tambah ke keranjang"}
      </Button>
      <Link href="/keranjang" className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline sm:hidden">Lihat keranjang</Link>
    </div>
  );
}

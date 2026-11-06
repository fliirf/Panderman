"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartLine, ISODate } from "@/lib/types";

// ponytail: keranjang di localStorage; FR-12 (simpan di akun) dipindah ke server saat backend siap.
type Cart = { lines: CartLine[]; eventStart?: ISODate; eventEnd?: ISODate };
type Ctx = Cart & {
  ready: boolean;
  count: number;
  add: (line: CartLine) => void;
  setQty: (kind: CartLine["kind"], id: string, qty: number) => void;
  remove: (kind: CartLine["kind"], id: string) => void;
  setEvent: (start?: ISODate, end?: ISODate) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "pdm-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ lines: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkron sekali dari localStorage setelah hidrasi
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(cart));
  }, [cart, ready]);

  const same = (l: CartLine, kind: string, id: string) => l.kind === kind && l.id === id;

  const value: Ctx = {
    ...cart,
    ready,
    count: cart.lines.length,
    add: (line) =>
      setCart((c) => {
        const found = c.lines.find((l) => same(l, line.kind, line.id));
        const lines = found
          ? c.lines.map((l) => (l === found ? { ...l, qty: l.qty + line.qty } : l))
          : [...c.lines, line];
        return { ...c, lines };
      }),
    setQty: (kind, id, qty) =>
      setCart((c) => ({ ...c, lines: c.lines.map((l) => (same(l, kind, id) ? { ...l, qty: Math.max(1, qty) } : l)) })),
    remove: (kind, id) => setCart((c) => ({ ...c, lines: c.lines.filter((l) => !same(l, kind, id)) })),
    setEvent: (eventStart, eventEnd) => setCart((c) => ({ ...c, eventStart, eventEnd: eventEnd ?? eventStart })),
    clear: () => setCart({ lines: [] }),
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus di dalam CartProvider");
  return ctx;
}

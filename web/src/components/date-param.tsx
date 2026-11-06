"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";
import { DateRangeField } from "@/components/date-field";

/** Pilih tanggal acara yang disimpan di URL (?mulai=&selesai=) dan keranjang. */
export function DateParam() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const cart = useCart();
  const mulai = sp.get("mulai") ?? undefined;

  const go = (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set("mulai", from);
    if (to) q.set("selesai", to);
    router.replace(`${path}?${q}`, { scroll: false });
  };

  useEffect(() => {
    if (!mulai && cart.ready && cart.eventStart) go(cart.eventStart, cart.eventEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.ready]);

  return (
    <DateRangeField
      value={{ from: mulai, to: sp.get("selesai") ?? undefined }}
      onChange={(r) => {
        cart.setEvent(r.from, r.to);
        go(r.from, r.to);
      }}
      placeholder="Pilih tanggal acara untuk cek stok"
    />
  );
}

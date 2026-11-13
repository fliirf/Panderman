import type { CartLine, Item, Package } from "./types";

export type ResolvedLine = CartLine & { name: string; price: number; category: Item["category"] | "paket"; slug: string; spec: string; hasTent: boolean; isPrasmanan: boolean; image?: string | null };

/** Gabungkan isi keranjang dengan data barang/paket. Baris yang barangnya sudah tidak ada dibuang. */
export function resolveCart(lines: CartLine[], items: Item[], packages: Package[]): ResolvedLine[] {
  return lines.flatMap((l): ResolvedLine[] => {
    if (l.kind === "item") {
      const i = items.find((x) => x.id === l.id);
      return i ? [{ ...l, name: i.name, image: i.image, price: i.price, category: i.category, slug: `/barang/${i.slug}`, spec: i.spec, hasTent: i.category === "tenda", isPrasmanan: i.category === "prasmanan" }] : [];
    }
    const p = packages.find((x) => x.id === l.id);
    if (!p) return [];
    const hasTent = p.contents.some((c) => items.find((i) => i.id === c.itemId)?.category === "tenda");
    return [{ ...l, name: p.name, image: p.image, price: p.price, category: "paket", slug: `/paket/${p.slug}`, spec: `±${p.guestCapacity} tamu`, hasTent, isPrasmanan: false }];
  });
}

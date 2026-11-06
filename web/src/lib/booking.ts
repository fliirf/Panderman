import { eachDay } from "./dates.ts";
import type { ISODate, Item, Order, Package } from "./types";

const ACTIVE: Order["status"][] = [
  "menunggu_jadwal",
  "menunggu_pembayaran",
  "menunggu_verifikasi",
  "dp_terverifikasi",
  "lunas",
];
export const isActive = (o: Order) => ACTIVE.includes(o.status);

/** Rentang barang keluar gudang: pasang/ambil s.d. bongkar/kembali (FR-19). */
// ponytail: satu rentang per pesanan (gabungan tenda & prasmanan); pisah per baris kalau mitra butuh presisi lebih.
export function rentalWindow(o: Pick<Order, "eventStart" | "installDate" | "teardownDate" | "prasmanan">) {
  const starts = [o.eventStart, o.installDate, o.prasmanan?.pickupDate].filter(Boolean) as ISODate[];
  const ends = [o.teardownDate, o.prasmanan?.returnDate].filter(Boolean) as ISODate[];
  return { from: starts.sort()[0], to: ends.sort().at(-1)! };
}

/** Jumlah tiap barang dalam pesanan, paket dipecah jadi isinya. */
export function itemQuantities(lines: Order["lines"], packages: Package[]) {
  const q = new Map<string, number>();
  const add = (id: string, n: number) => q.set(id, (q.get(id) ?? 0) + n);
  for (const l of lines) {
    if (l.kind === "item") add(l.itemId, l.qty);
    else packages.find((p) => p.id === l.packageId)?.contents.forEach((c) => add(c.itemId, c.qty * l.qty));
  }
  return q;
}

/** Sisa stok terkecil sepanjang rentang tanggal (NFR-11). */
export function availableQty(item: Item, from: ISODate, to: ISODate, orders: Order[], packages: Package[]) {
  const days = eachDay(from, to);
  let maxBooked = 0;
  for (const day of days) {
    let booked = 0;
    for (const o of orders.filter(isActive)) {
      const w = rentalWindow(o);
      if (day >= w.from && day <= w.to) booked += itemQuantities(o.lines, packages).get(item.id) ?? 0;
    }
    maxBooked = Math.max(maxBooked, booked);
  }
  return Math.max(0, item.stock - maxBooked);
}

/** Tanggal pasang tenda yang sudah dipakai pesanan aktif (NFR-12). */
export const lockedInstallDates = (orders: Order[]) =>
  orders.filter(isActive).flatMap((o) => (o.installDate ? [o.installDate] : []));

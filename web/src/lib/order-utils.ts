import { calculatePrice } from "./pricing.ts";
import type { Item, Order, Package, Settings } from "./types";

/** Rincian lengkap satu pesanan: nama baris, biaya, sudah dibayar, sisa tagihan. */
export function orderSummary(o: Order, items: Item[], packages: Package[], s: Settings) {
  const lines = o.lines.map((l) => {
    const name = l.kind === "item" ? items.find((i) => i.id === l.itemId)?.name : packages.find((p) => p.id === l.packageId)?.name;
    const category = l.kind === "item" ? items.find((i) => i.id === l.itemId)?.category ?? "tenda" : ("paket" as const);
    const image = l.kind === "item" ? items.find((i) => i.id === l.itemId)?.image : packages.find((p) => p.id === l.packageId)?.image;
    return { ...l, name: name ?? "(dihapus)", category, image };
  });
  const price = calculatePrice({ lines, needsDelivery: !!o.address, zoneId: o.address?.zoneId, extraDays: o.extraDays }, s);
  const paid = o.payments.filter((p) => p.status === "terverifikasi").reduce((sum, p) => sum + p.amount, 0);
  const pendingPayment = o.payments.find((p) => p.status === "menunggu");
  const penalty = o.penalty?.amount ?? 0;
  const outstanding = Math.max(0, price.total + penalty - paid);
  return { lines, price, paid, pendingPayment, penalty, outstanding, zone: s.zones.find((z) => z.id === o.address?.zoneId) };
}

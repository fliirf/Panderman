import "server-only";
import { availableQty, lockedInstallDates } from "../booking.ts";
import { addDays } from "../dates.ts";
import type { Category, ISODate } from "../types";
import { currentUserId, items, orders, packages, settings } from "./mock";

// Satu-satunya pintu data untuk UI. Tahap backend: isi fungsi ini diganti query Prisma.

export async function getItems(filter: { category?: Category; q?: string; maxPrice?: number } = {}) {
  return items.filter(
    (i) =>
      (!filter.category || i.category === filter.category) &&
      (!filter.q || i.name.toLowerCase().includes(filter.q.toLowerCase())) &&
      (!filter.maxPrice || i.price <= filter.maxPrice),
  );
}
export const getAllItems = async () => items;
export const getItem = async (slug: string) => items.find((i) => i.slug === slug);

export async function getPackages(filter: { minGuests?: number } = {}) {
  return packages.filter((p) => !filter.minGuests || p.guestCapacity >= filter.minGuests);
}
export const getPackage = async (slug: string) => packages.find((p) => p.slug === slug);

export const getSettings = async () => settings;

/** Sisa stok per barang untuk rentang tanggal tertentu. */
export async function getAvailability(from: ISODate, to: ISODate = from) {
  return Object.fromEntries(items.map((i) => [i.id, availableQty(i, from, to, orders, packages)]));
}

/**
 * Sisa stok untuk tanggal acara: rentang diperlebar H-1 (pasang) s.d. H+1 (bongkar).
 * ponytail: perkiraan untuk katalog; checkout memakai tanggal pasang sebenarnya.
 */
export async function getEventAvailability(mulai?: ISODate, selesai?: ISODate) {
  if (!mulai) return undefined;
  const stock = await getAvailability(addDays(mulai, -1), addDays(selesai ?? mulai, 1));
  const pkg = Object.fromEntries(
    packages.map((p) => [p.id, Math.min(...p.contents.map((c) => Math.floor((stock[c.itemId] ?? 0) / c.qty)))]),
  );
  return { items: stock, packages: pkg };
}

export const getLockedInstallDates = async () => lockedInstallDates(orders);

export const getMyOrders = async () => orders.filter((o) => o.userId === currentUserId);
export const getOrders = async () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getOrder = async (id: string) => orders.find((o) => o.id === id);

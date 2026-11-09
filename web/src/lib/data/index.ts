import "server-only";
import { connection } from "next/server";
import { availableQty, lockedInstallDates } from "../booking.ts";
import { addDays } from "../dates.ts";
import type { Category, ISODate } from "../types";
import { currentUserId, items, orders, packages, settings } from "./mock";
import { prisma } from "@/lib/prisma";

// Satu-satunya pintu data untuk UI. Tahap backend: isi fungsi ini diganti query Prisma.


export async function getItems(
  filter: { category?: Category; q?: string; maxPrice?: number } = {}
) {
  await connection();

  return prisma.item.findMany({
    where: {
      ...(filter.category && {
        category: filter.category,
      }),
      ...(filter.q && {
        name: {
          contains: filter.q,
          mode: "insensitive",
        },
      }),
      ...(filter.maxPrice !== undefined && {
        price: {
          lte: filter.maxPrice,
        },
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


export async function getAllItems() {
  await connection();

  return prisma.item.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}


export async function getItem(slug: string) {
  await connection();

  return prisma.item.findUnique({
    where: { slug },
  });
}

export async function getPackages(
  filter: { minGuests?: number } = {}
) {
  await connection();

  return prisma.package.findMany({
    where: {
      ...(filter.minGuests !== undefined && {
        guestCapacity: {
          gte: filter.minGuests,
        },
      }),
    },
    include: {
      contents: {
        select: {
          itemId: true,
          qty: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPackage(slug: string) {
  await connection();

  return prisma.package.findUnique({
    where: { slug },
    include: {
      contents: {
        select: {
          itemId: true,
          qty: true,
        },
      },
    },
  });
}

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

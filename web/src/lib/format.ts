import type { Category, ISODate, OrderStatus, PriceUnit } from "./types";

const rp = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
export const rupiah = (n: number) => rp.format(n);

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dateShort = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
export const tanggal = (d: ISODate) => dateFmt.format(new Date(d + "T00:00:00Z"));
export const tanggalPendek = (d: ISODate) => dateShort.format(new Date(d + "T00:00:00Z"));

export const CATEGORY_LABEL: Record<Category, string> = {
  tenda: "Tenda",
  kursi: "Kursi",
  meja: "Meja",
  lighting: "Lighting",
  dekorasi: "Dekorasi",
  prasmanan: "Alat Prasmanan",
};

export const UNIT_LABEL: Record<PriceUnit, string> = { unit: "unit", set: "set", m2: "m²" };

export const STATUS: Record<OrderStatus, { label: string; tone: "amber" | "blue" | "violet" | "emerald" | "zinc" | "red" }> = {
  menunggu_jadwal: { label: "Menunggu Persetujuan Jadwal", tone: "amber" },
  menunggu_pembayaran: { label: "Menunggu Pembayaran", tone: "blue" },
  menunggu_verifikasi: { label: "Menunggu Verifikasi", tone: "violet" },
  dp_terverifikasi: { label: "DP Terverifikasi", tone: "emerald" },
  lunas: { label: "Lunas", tone: "emerald" },
  dibatalkan: { label: "Dibatalkan", tone: "red" },
  selesai: { label: "Selesai", tone: "zinc" },
};

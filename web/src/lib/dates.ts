import type { ISODate } from "./types";

// Semua tanggal diperlakukan sebagai tanggal kalender UTC supaya tidak geser karena zona waktu.
export const toDate = (d: ISODate) => new Date(d + "T00:00:00Z");
export const toISO = (d: Date): ISODate => d.toISOString().slice(0, 10);

export function addDays(d: ISODate, n: number): ISODate {
  const x = toDate(d);
  x.setUTCDate(x.getUTCDate() + n);
  return toISO(x);
}

export function eachDay(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export const todayISO = (): ISODate => {
  // tanggal lokal user (WIB), bukan UTC
  const now = new Date();
  return toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
};

/** ISODate -> Date lokal (untuk react-day-picker yang bekerja di zona lokal) */
export const toLocalDate = (d: ISODate) => {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
};
export const fromLocalDate = (d: Date): ISODate =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

import type { Settings } from "./types";

export type PriceInput = {
  lines: { price: number; qty: number }[];
  needsDelivery: boolean;
  zoneId?: string;
  extraDays: number;
};

export type PriceBreakdown = {
  subtotal: number;
  deliveryFee: number;
  extraDaysFee: number;
  total: number;
  dp: number;
  remaining: number;
};

// Semua uang dalam Rupiah bulat (integer), jadi tidak ada selisih pembulatan (NFR-13).
export function calculatePrice(input: PriceInput, s: Settings): PriceBreakdown {
  const subtotal = input.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const zone = s.zones.find((z) => z.id === input.zoneId);
  const deliveryFee = input.needsDelivery ? (zone?.fee ?? 0) : 0;
  const extraDaysFee = Math.max(0, input.extraDays) * s.extraDayRate;
  const total = subtotal + deliveryFee + extraDaysFee;
  const dp = Math.ceil((total * s.dpPercent) / 100);
  return { subtotal, deliveryFee, extraDaysFee, total, dp, remaining: total - dp };
}

/** Denda = harga barang asli × jumlah rusak/hilang (FR-40) */
export function calculatePenalty(lines: { replacementPrice: number; damagedQty: number }[]) {
  return lines.reduce((sum, l) => sum + l.replacementPrice * l.damagedQty, 0);
}

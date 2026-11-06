"use server";

import { addDays } from "@/lib/dates";
import { getAvailability } from "@/lib/data";
import type { ISODate } from "@/lib/types";

// Server Actions: pintu backend untuk form/klik di client.
// Tahap backend: isi dengan validasi (zod), transaksi Prisma + SELECT … FOR UPDATE, dan auth.

/** Sisa stok tiap barang selama rentang keluar gudang. */
export async function checkAvailability(from: ISODate, to: ISODate) {
  return getAvailability(from, to);
}

export type SubmitOrderInput = {
  lines: { kind: "item" | "package"; id: string; qty: number }[];
  eventStart: ISODate;
  eventEnd: ISODate;
  installDate?: ISODate;
  prasmanan?: { mode: "antar" | "ambil"; pickupDate?: ISODate; returnDate?: ISODate };
  address?: { text: string; note: string; zoneId: string };
  scheme: "dp" | "lunas";
  method: "transfer" | "tunai";
};

// ponytail: aksi di bawah masih mock (hanya jeda + ok). Backend: cek sesi & peran (user/admin), lalu tulis ke DB.
const mock = async () => {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true as const };
};

// User
export const respondProposal = async (orderId: string, accept: boolean) => (void [orderId, accept], mock());
export const uploadPaymentProof = async (orderId: string, form: FormData) => (void [orderId, form], mock());
export const cancelOrder = async (orderId: string) => (void orderId, mock());

// Admin
export const approveSchedule = async (orderId: string) => (void orderId, mock());
export const proposeSchedule = async (orderId: string, p: { installDate: ISODate; extraDays: number; note: string }) => (void [orderId, p], mock());
export const verifyPayment = async (paymentId: string, accept: boolean) => (void [paymentId, accept], mock());
export const recordCashPayment = async (orderId: string, amount: number) => (void [orderId, amount], mock());
export const recordReturn = async (orderId: string, damaged: { itemId: string; qty: number }[]) => (void [orderId, damaged], mock());
export const saveItem = async (form: FormData) => (void form, mock());
export const saveSettings = async (form: FormData) => (void form, mock());

export async function submitOrder(input: SubmitOrderInput) {
  // ponytail: mock. Backend nanti: hitung ulang harga di server (jangan percaya client), kunci slot pasang, simpan.
  await new Promise((r) => setTimeout(r, 600));
  const code = `PDM-${input.eventStart.slice(2, 4)}${input.eventStart.slice(5, 7)}-${String(Math.floor(Math.random() * 900) + 100)}`;
  return { ok: true as const, orderId: "o2", code, teardownDate: addDays(input.eventEnd, 1) };
}

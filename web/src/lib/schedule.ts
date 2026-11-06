import { isActive } from "./booking.ts";
import type { ISODate, Order } from "./types";

export type ScheduleType = "pasang" | "acara" | "bongkar" | "ambil" | "kembali";
export type ScheduleEvent = { date: ISODate; type: ScheduleType; orderId: string; code: string; customer: string; place: string };

export const SCHEDULE_LABEL: Record<ScheduleType, string> = { pasang: "Pasang", acara: "Acara", bongkar: "Bongkar", ambil: "Ambil", kembali: "Kembali" };
export const SCHEDULE_DOT: Record<ScheduleType, string> = { pasang: "bg-emerald-600", acara: "bg-amber-500", bongkar: "bg-sky-600", ambil: "bg-violet-500", kembali: "bg-zinc-500" };

/** Semua kegiatan lapangan dari pesanan aktif + selesai (FR-39). */
export function scheduleEvents(orders: Order[]): ScheduleEvent[] {
  return orders
    .filter((o) => isActive(o) || o.status === "selesai")
    .flatMap((o) => {
      const base = { orderId: o.id, code: o.code, customer: o.customer.name, place: o.address?.text ?? "Ambil di gudang" };
      const ev: ScheduleEvent[] = [];
      if (o.installDate) ev.push({ ...base, date: o.installDate, type: "pasang" });
      ev.push({ ...base, date: o.eventStart, type: "acara" });
      if (o.address) ev.push({ ...base, date: o.teardownDate, type: "bongkar" });
      if (o.prasmanan?.mode === "ambil") {
        ev.push({ ...base, date: o.prasmanan.pickupDate!, type: "ambil" });
        ev.push({ ...base, date: o.prasmanan.returnDate!, type: "kembali" });
      }
      return ev;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

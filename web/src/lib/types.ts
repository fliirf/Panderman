// Bentuk data ini sengaja disamakan dengan skema Prisma nanti,
// supaya lib/data/* tinggal diganti query DB tanpa ubah UI.

export type Category = "tenda" | "kursi" | "meja" | "lighting" | "dekorasi" | "prasmanan";
export type PriceUnit = "unit" | "set" | "m2";

/** Tanggal selalu string ISO "YYYY-MM-DD" (tanpa jam) */
export type ISODate = string;

export type Item = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  spec: string; // ukuran / kapasitas
  price: number; // per acara
  unit: PriceUnit;
  stock: number;
  replacementPrice: number; // dasar denda (FR-40)
  image?: string | null; // null dari DB, kosong di data contoh
};

export type Package = {
  id: string;
  slug: string;
  name: string;
  description: string;
  guestCapacity: number;
  price: number;
  contents: { itemId: string; qty: number }[];
  image?: string | null;
};

export type DeliveryZone = { id: string; name: string; maxKm: number; fee: number };

export type Settings = {
  dpPercent: number;
  dpDeadlineHours: number;
  extraDayRate: number; // per hari
  installWindow: { minDaysBefore: number; maxDaysBefore: number }; // H-1..H-5
  zones: DeliveryZone[];
  bankAccounts: { bank: string; number: string; holder: string }[];
  pickupAddress: string;
};

export type OrderStatus =
  | "menunggu_jadwal"
  | "menunggu_pembayaran"
  | "menunggu_verifikasi"
  | "dp_terverifikasi"
  | "lunas"
  | "dibatalkan"
  | "selesai";

export type PaymentScheme = "dp" | "lunas";
export type PaymentMethod = "transfer" | "tunai";
export type PrasmananMode = "antar" | "ambil";

export type OrderLine =
  | { kind: "item"; itemId: string; qty: number; price: number }
  | { kind: "package"; packageId: string; qty: number; price: number };

export type Payment = {
  id: string;
  type: "dp" | "pelunasan" | "lunas" | "denda";
  method: PaymentMethod;
  amount: number;
  status: "menunggu" | "terverifikasi" | "ditolak";
  createdAt: string;
};

export type ScheduleProposal = {
  installDate: ISODate;
  extraDays: number;
  note: string;
  status: "menunggu" | "disetujui" | "ditolak";
};

export type Order = {
  id: string;
  code: string;
  userId: string;
  customer: { name: string; phone: string; email?: string };
  status: OrderStatus;
  lines: OrderLine[];
  eventStart: ISODate;
  eventEnd: ISODate;
  installDate?: ISODate; // hanya jika ada tenda
  teardownDate: ISODate; // H+1
  prasmanan?: { mode: PrasmananMode; pickupDate?: ISODate; returnDate?: ISODate };
  address?: { text: string; note: string; zoneId: string };
  extraDays: number;
  proposal?: ScheduleProposal;
  scheme: PaymentScheme;
  method: PaymentMethod;
  payments: Payment[];
  penalty?: { amount: number; note: string };
  createdAt: string;
};

export type CartLine = { kind: "item" | "package"; id: string; qty: number };

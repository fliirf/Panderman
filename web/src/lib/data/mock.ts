import type { Item, Order, Package, Settings } from "../types";

// ponytail: data contoh sementara. Diganti Prisma + PostgreSQL di tahap backend.

export const items: Item[] = [
  { id: "i1", slug: "tenda-sarnafil-5x5", name: "Tenda Sarnafil 5 x 5 m", category: "tenda", description: "Tenda kerucut putih, rangka baja, cocok untuk teras dan halaman rumah.", spec: "5×5 m · ±40 tamu", price: 650000, unit: "unit", stock: 6, replacementPrice: 18000000 },
  { id: "i2", slug: "tenda-roder-10x15", name: "Tenda Roder 10 x 15 m", category: "tenda", description: "Tenda bentang lebar tanpa tiang tengah untuk resepsi besar.", spec: "10×15 m · ±250 tamu", price: 4500000, unit: "unit", stock: 2, replacementPrice: 95000000 },
  { id: "i3", slug: "tenda-plafon-dekor", name: "Tenda Plafon & Dekor Kain", category: "tenda", description: "Tenda biasa dengan plafon kain dan rumbai, siap pakai untuk hajatan.", spec: "per m²", price: 25000, unit: "m2", stock: 400, replacementPrice: 150000 },
  { id: "i4", slug: "kursi-futura", name: "Kursi Futura", category: "kursi", description: "Kursi plastik tebal, ringan, dan mudah ditata.", spec: "Plastik · tanpa sarung", price: 3500, unit: "unit", stock: 600, replacementPrice: 85000 },
  { id: "i5", slug: "kursi-tiffany", name: "Kursi Tiffany", category: "kursi", description: "Kursi elegan untuk akad, VIP, dan meja keluarga.", spec: "Resin · bantalan putih", price: 15000, unit: "unit", stock: 150, replacementPrice: 450000 },
  { id: "i6", slug: "kursi-sarung-pita", name: "Kursi Lipat Bersarung", category: "kursi", description: "Kursi lipat besi dengan sarung kain dan pita warna pilihan.", spec: "Besi · sarung kain", price: 8000, unit: "unit", stock: 300, replacementPrice: 175000 },
  { id: "i7", slug: "meja-bulat", name: "Meja Bulat & Taplak", category: "meja", description: "Meja bundar untuk 8–10 orang, termasuk taplak putih.", spec: "Ø 150 cm · 8–10 org", price: 45000, unit: "unit", stock: 40, replacementPrice: 1200000 },
  { id: "i8", slug: "meja-kotak", name: "Meja Kotak Panjang", category: "meja", description: "Meja lipat untuk prasmanan, registrasi, atau meja hidangan.", spec: "180×60 cm", price: 25000, unit: "unit", stock: 60, replacementPrice: 750000 },
  { id: "i9", slug: "lampu-gantung-bohlam", name: "Lampu Gantung Bohlam", category: "lighting", description: "Untaian bohlam hangat 10 m untuk suasana malam.", spec: "10 m · 20 bohlam", price: 75000, unit: "set", stock: 30, replacementPrice: 600000 },
  { id: "i10", slug: "lampu-sorot-par", name: "Lampu Sorot PAR LED", category: "lighting", description: "Lampu sorot warna untuk pelaminan dan panggung kecil.", spec: "54 LED · RGB", price: 60000, unit: "unit", stock: 24, replacementPrice: 900000 },
  { id: "i11", slug: "pelaminan-minimalis", name: "Pelaminan Minimalis", category: "dekorasi", description: "Backdrop pelaminan modern dengan bunga artifisial.", spec: "Lebar 6 m", price: 3500000, unit: "set", stock: 3, replacementPrice: 25000000 },
  { id: "i12", slug: "gerbang-janur", name: "Gerbang Janur & Bunga", category: "dekorasi", description: "Gerbang masuk tradisional dengan janur dan bunga segar.", spec: "Tinggi 3 m", price: 750000, unit: "set", stock: 5, replacementPrice: 4000000 },
  { id: "i13", slug: "chafing-dish", name: "Chafing Dish Stainless", category: "prasmanan", description: "Pemanas makanan prasmanan lengkap dengan tutup.", spec: "9 liter", price: 35000, unit: "unit", stock: 50, replacementPrice: 650000 },
  { id: "i14", slug: "piring-set", name: "Piring & Sendok (isi 50)", category: "prasmanan", description: "Piring keramik putih dan sendok-garpu stainless.", spec: "50 pasang", price: 50000, unit: "set", stock: 40, replacementPrice: 1500000 },
  { id: "i15", slug: "gelas-set", name: "Gelas Kaca (isi 50)", category: "prasmanan", description: "Gelas bening untuk minuman, lengkap dengan rak.", spec: "50 pcs · 250 ml", price: 30000, unit: "set", stock: 40, replacementPrice: 750000 },
  { id: "i16", slug: "dispenser-jus", name: "Dispenser Minuman", category: "prasmanan", description: "Dispenser kaca dengan keran untuk jus dan es teh.", spec: "8 liter", price: 25000, unit: "unit", stock: 20, replacementPrice: 350000 },
];

export const packages: Package[] = [
  { id: "p1", slug: "paket-syukuran", name: "Paket Syukuran", description: "Pas untuk aqiqah, syukuran rumah, dan arisan besar.", guestCapacity: 100, price: 2750000, contents: [{ itemId: "i1", qty: 2 }, { itemId: "i4", qty: 100 }, { itemId: "i8", qty: 4 }, { itemId: "i13", qty: 4 }] },
  { id: "p2", slug: "paket-resepsi", name: "Paket Resepsi", description: "Tenda, pelaminan, kursi tiffany, dan lighting untuk resepsi.", guestCapacity: 300, price: 12500000, contents: [{ itemId: "i2", qty: 1 }, { itemId: "i11", qty: 1 }, { itemId: "i5", qty: 20 }, { itemId: "i6", qty: 200 }, { itemId: "i9", qty: 6 }, { itemId: "i13", qty: 10 }] },
  { id: "p3", slug: "paket-garden-party", name: "Paket Garden Party", description: "Meja bulat, lampu bohlam, dan tenda kecil untuk acara outdoor.", guestCapacity: 80, price: 3900000, contents: [{ itemId: "i1", qty: 2 }, { itemId: "i7", qty: 8 }, { itemId: "i6", qty: 80 }, { itemId: "i9", qty: 4 }] },
];

// ponytail: foto contoh dari Unsplash (lisensi bebas). Ganti dengan foto asli barang mitra saat admin unggah.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
const PHOTOS: Record<string, string> = {
  i1: "1782025419777-09e493453d9f", i2: "1675376616537-c8aa9ddc9977", i3: "1786426923263-61e9699bfc39",
  i4: "1600694552566-14c3c46aafd5", i5: "1782026456568-b2aaa170487b", i6: "1737427649620-9c971b5ebcb4",
  i7: "1763553113332-800519753e40", i8: "1762765685319-fdaf8d22085d", i9: "1511461744085-90a4d1c66be3",
  i10: "1576514129883-2f1d47a65da6", i11: "1745573673583-a51f665ae48e", i12: "1769812343890-4e406a33cfbe",
  i13: "1555244162-803834f70033", i14: "1737681707230-04eebda96529", i15: "1551497406-3e4e11919f7a",
  i16: "1787661647744-d5101db1ee20",
  p1: "1610425303802-f09737e52e28", p2: "1769812343760-f01a489acabc", p3: "1772127822525-7eda37383b9f",
};
for (const x of [...items, ...packages]) x.image = photo(PHOTOS[x.id]);
export const HERO_PHOTO = photo("1775476793931-cb484f197760");
export const SIDE_PHOTO = photo("1694578345441-c8ebfb5258fc");
export const settings: Settings = {
  dpPercent: 50,
  dpDeadlineHours: 24,
  extraDayRate: 250000,
  installWindow: { minDaysBefore: 1, maxDaysBefore: 5 },
  zones: [
    { id: "z1", name: "Zona 1 (0–5 km)", maxKm: 5, fee: 150000 },
    { id: "z2", name: "Zona 2 (5–15 km)", maxKm: 15, fee: 300000 },
    { id: "z3", name: "Zona 3 (15–30 km)", maxKm: 30, fee: 500000 },
  ],
  bankAccounts: [
    { bank: "BCA", number: "1234567890", holder: "Panderman Tenda" },
    { bank: "DANA", number: "081234567890", holder: "Panderman Tenda" },
  ],
  pickupAddress: "Jl. Panderman No. 12, Batu, Jawa Timur",
};

export const currentUserId = "u1";

export const orders: Order[] = [
  {
    id: "o1", code: "PDM-2611-001", userId: "u1", customer: { name: "Rina Wulandari", phone: "081211112222", email: "rina@contoh.id" },
    status: "dp_terverifikasi", lines: [{ kind: "package", packageId: "p2", qty: 1, price: 12500000 }],
    eventStart: "2026-11-21", eventEnd: "2026-11-21", installDate: "2026-11-18", teardownDate: "2026-11-22",
    address: { text: "Jl. Diponegoro 45, Batu", note: "Halaman tanah, akses truk bisa", zoneId: "z1" },
    extraDays: 0, scheme: "dp", method: "transfer",
    payments: [{ id: "pay1", type: "dp", method: "transfer", amount: 6325000, status: "terverifikasi", createdAt: "2026-11-02T10:00:00Z" }],
    createdAt: "2026-11-01T08:00:00Z",
  },
  {
    id: "o2", code: "PDM-2611-002", userId: "u1", customer: { name: "Rina Wulandari", phone: "081211112222" },
    status: "menunggu_jadwal", lines: [{ kind: "item", itemId: "i1", qty: 2, price: 650000 }, { kind: "item", itemId: "i4", qty: 80, price: 3500 }, { kind: "item", itemId: "i13", qty: 4, price: 35000 }],
    eventStart: "2026-12-06", eventEnd: "2026-12-06", installDate: "2026-12-04", teardownDate: "2026-12-07",
    prasmanan: { mode: "ambil", pickupDate: "2026-12-05", returnDate: "2026-12-07" },
    address: { text: "Perum Griya Asri B-7, Malang", note: "Gang 3 m, mobil bak masuk", zoneId: "z2" },
    extraDays: 0, scheme: "dp", method: "transfer", payments: [], createdAt: "2026-11-05T09:30:00Z",
    proposal: { installDate: "2026-12-03", extraDays: 1, note: "Tim pasang tanggal 4 Des sudah penuh. Kami bisa pasang 3 Des dengan tambahan 1 hari sewa.", status: "menunggu" },
  },
  {
    id: "o3", code: "PDM-2611-003", userId: "u2", customer: { name: "Budi Santoso", phone: "085733334444" },
    status: "menunggu_verifikasi", lines: [{ kind: "package", packageId: "p1", qty: 1, price: 2750000 }],
    eventStart: "2026-11-15", eventEnd: "2026-11-15", installDate: "2026-11-13", teardownDate: "2026-11-16",
    address: { text: "Jl. Sultan Agung 9, Batu", note: "Lahan paving", zoneId: "z1" },
    extraDays: 0, scheme: "lunas", method: "transfer",
    payments: [{ id: "pay2", type: "lunas", method: "transfer", amount: 2900000, status: "menunggu", createdAt: "2026-11-05T14:00:00Z" }],
    createdAt: "2026-11-04T11:00:00Z",
  },
  {
    id: "o4", code: "PDM-2611-004", userId: "u3", customer: { name: "Siti Aminah", phone: "081355556666" },
    status: "menunggu_jadwal", lines: [{ kind: "item", itemId: "i2", qty: 1, price: 4500000 }, { kind: "item", itemId: "i6", qty: 200, price: 8000 }],
    eventStart: "2026-11-28", eventEnd: "2026-11-29", installDate: "2026-11-24", teardownDate: "2026-11-30",
    address: { text: "Dusun Krajan RT 02, Junrejo", note: "Sawah kering, perlu alas", zoneId: "z2" },
    extraDays: 0, scheme: "dp", method: "tunai", payments: [], createdAt: "2026-11-05T16:00:00Z",
  },
  {
    id: "o5", code: "PDM-2610-019", userId: "u1", customer: { name: "Rina Wulandari", phone: "081211112222" },
    status: "selesai", lines: [{ kind: "item", itemId: "i7", qty: 6, price: 45000 }, { kind: "item", itemId: "i14", qty: 2, price: 50000 }],
    eventStart: "2026-10-12", eventEnd: "2026-10-12", teardownDate: "2026-10-13",
    prasmanan: { mode: "ambil", pickupDate: "2026-10-11", returnDate: "2026-10-13" },
    address: { text: "Jl. Diponegoro 45, Batu", note: "", zoneId: "z1" },
    extraDays: 0, scheme: "lunas", method: "tunai",
    payments: [{ id: "pay3", type: "lunas", method: "tunai", amount: 520000, status: "terverifikasi", createdAt: "2026-10-11T07:00:00Z" }],
    penalty: { amount: 30000, note: "1 piring pecah" },
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "o6", code: "PDM-2611-005", userId: "u4", customer: { name: "Agus Prasetyo", phone: "082177778888" },
    status: "lunas", lines: [{ kind: "package", packageId: "p3", qty: 1, price: 3900000 }],
    eventStart: "2026-11-08", eventEnd: "2026-11-08", installDate: "2026-11-07", teardownDate: "2026-11-09",
    address: { text: "Villa Panderman Hills 3, Batu", note: "Rumput, akses mobil", zoneId: "z3" },
    extraDays: 0, scheme: "lunas", method: "transfer",
    payments: [{ id: "pay4", type: "lunas", method: "transfer", amount: 4400000, status: "terverifikasi", createdAt: "2026-11-03T10:00:00Z" }],
    createdAt: "2026-11-02T10:00:00Z",
  },
];

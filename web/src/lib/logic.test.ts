// Jalankan: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { availableQty, lockedInstallDates } from "./booking.ts";
import { orders, packages, items, settings } from "./data/mock.ts";
import { calculatePenalty, calculatePrice } from "./pricing.ts";

test("hitung biaya: subtotal + ongkir zona + tambahan hari, DP 50%", () => {
  const p = calculatePrice(
    { lines: [{ price: 650000, qty: 2 }, { price: 3500, qty: 80 }], needsDelivery: true, zoneId: "z2", extraDays: 1 },
    settings,
  );
  assert.deepEqual(p, { subtotal: 1580000, deliveryFee: 300000, extraDaysFee: 250000, total: 2130000, dp: 1065000, remaining: 1065000 });
});

test("ambil sendiri: tanpa ongkir; DP ganjil dibulatkan ke atas, total tetap pas", () => {
  const p = calculatePrice({ lines: [{ price: 35001, qty: 1 }], needsDelivery: false, zoneId: "z1", extraDays: 0 }, settings);
  assert.equal(p.deliveryFee, 0);
  assert.equal(p.dp + p.remaining, p.total);
});

test("denda = harga asli × jumlah rusak", () => {
  assert.equal(calculatePenalty([{ replacementPrice: 85000, damagedQty: 3 }]), 255000);
});

test("stok berkurang selama rentang pasang–bongkar, termasuk isi paket", () => {
  const roder = items.find((i) => i.id === "i2")!; // stok 2: o1 (paket resepsi) + o4
  assert.equal(availableQty(roder, "2026-11-25", "2026-11-25", orders, packages), 1); // hanya o4
  assert.equal(availableQty(roder, "2026-11-18", "2026-11-25", orders, packages), 1);
  assert.equal(availableQty(roder, "2026-11-22", "2026-11-24", orders, packages), 1); // o1 bongkar 22, o4 pasang 24: tidak pernah di hari yang sama
  assert.equal(availableQty(roder, "2026-11-23", "2026-11-23", orders, packages), 2); // jeda kosong di antaranya
  assert.equal(availableQty(roder, "2026-12-10", "2026-12-10", orders, packages), 2);
});

test("tanggal pasang terkunci tidak termasuk pesanan batal/selesai", () => {
  const locked = lockedInstallDates(orders);
  assert.ok(locked.includes("2026-11-18"));
  assert.ok(!locked.includes("2026-10-11"));
});

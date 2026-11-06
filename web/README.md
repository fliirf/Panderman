# Panderman: Sewa Tenda & Alat Pesta

Next.js 16 (App Router, Cache Components) + Tailwind 4 + shadcn/ui (Base UI).

```bash
npm install
npm run dev     # http://localhost:3000  (admin: /admin)
npm test        # tes logika biaya & stok
```

Demo OTP: `123456`.

## Struktur

| Folder | Isi |
|---|---|
| `src/app/(toko)` | Halaman pelanggan: beranda, katalog, detail, keranjang, checkout, pesanan |
| `src/app/(auth)` | Masuk, daftar, verifikasi OTP, lupa password |
| `src/app/admin` | Ringkasan, pesanan, jadwal, barang, paket, tarif & ketentuan |
| `src/app/nota/[id]` | Nota DP/lunas siap cetak/PDF |
| `src/app/actions.ts` | **Server Actions**, pintu backend untuk semua aksi (saat ini mock) |
| `src/lib/data/` | **Pintu data** untuk semua halaman (saat ini `mock.ts`) |
| `src/lib/pricing.ts`, `booking.ts` | Logika murni: biaya, DP, denda, stok per tanggal, slot pasang |

## Menyambung backend

1. Ganti isi fungsi di `src/lib/data/index.ts` dengan query Prisma (bentuk data sama dengan `src/lib/types.ts`).
2. Isi Server Actions di `src/app/actions.ts`: validasi, cek sesi/peran, transaksi DB.
3. Auth (Better Auth + 2FA OTP) menggantikan mock di `components/auth-forms.tsx`.

Komponen UI tidak perlu diubah.

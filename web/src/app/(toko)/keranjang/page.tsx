import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { PageHeader } from "@/components/shared";
import { getAllItems, getPackages } from "@/lib/data";

export const metadata: Metadata = { title: "Keranjang" };

export default async function KeranjangPage() {
  const [items, packages] = await Promise.all([getAllItems(), getPackages()]);
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader title="Keranjang" description="Barang satuan dan paket bisa digabung dalam satu pesanan." />
      <CartView items={items} packages={packages} />
    </div>
  );
}

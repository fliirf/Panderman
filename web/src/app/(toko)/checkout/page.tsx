import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout-flow";
import { getAllItems, getLockedInstallDates, getPackages, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout" };

// ponytail: belum ada cek login (FR-05). Backend: redirect ke /masuk?next=/checkout bila belum ada sesi.
export default async function CheckoutPage() {
  const [items, packages, settings, lockedDates] = await Promise.all([getAllItems(), getPackages(), getSettings(), getLockedInstallDates()]);
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl leading-[1.02]">Checkout</h1>
      <CheckoutFlow items={items} packages={packages} settings={settings} lockedDates={lockedDates} />
    </div>
  );
}

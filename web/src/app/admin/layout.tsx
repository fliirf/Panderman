import type { Metadata } from "next";
import { AdminTopbar } from "@/components/admin-nav";
import { getOrders } from "@/lib/data";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" } };

// ponytail: belum ada guard peran admin. Backend: cek sesi + role di proxy.ts / layout ini.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const orders = await getOrders();
  const badge = orders.filter((o) => o.status === "menunggu_jadwal" || o.status === "menunggu_verifikasi").length;
  return (
    <div className="min-h-[100dvh]">
      <AdminTopbar badge={badge} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 pt-10 pb-20 sm:px-6">{children}</main>
    </div>
  );
}

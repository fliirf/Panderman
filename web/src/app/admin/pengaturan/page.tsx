import { SettingsForm } from "@/components/admin-forms";
import { PageHeader } from "@/components/shared";
import { getSettings } from "@/lib/data";

export const metadata = { title: "Tarif & ketentuan" };

export default async function PengaturanPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Tarif & ketentuan" description="Semua nilai bisnis bisa diubah di sini tanpa mengubah kode." />
      <SettingsForm settings={settings} />
    </>
  );
}

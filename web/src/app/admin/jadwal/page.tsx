import { MonthSchedule } from "@/components/month-schedule";
import { PageHeader } from "@/components/shared";
import { getOrders } from "@/lib/data";
import { scheduleEvents } from "@/lib/schedule";

export const metadata = { title: "Jadwal" };

export default async function JadwalPage() {
  const orders = await getOrders();
  return (
    <>
      <PageHeader title="Jadwal lapangan" description="Pemasangan, pembongkaran, pengambilan, dan pengembalian dalam satu kalender." />
      <MonthSchedule events={scheduleEvents(orders)} />
    </>
  );
}

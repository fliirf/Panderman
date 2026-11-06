import Link from "next/link";
import { ArrowRightIcon as ArrowRight, CalendarDotsIcon as CalendarClock, ClipboardTextIcon as ClipboardList, ReceiptIcon as Receipt, WalletIcon as Wallet } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/order-parts";
import { SchedulePanel } from "@/components/schedule-panel";
import { PageHeader, StatusBadge } from "@/components/shared";
import { isActive } from "@/lib/booking";
import { getOrders } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import { scheduleEvents } from "@/lib/schedule";

export default async function AdminHome() {
  const orders = await getOrders();
  const review = orders.filter((o) => o.status === "menunggu_jadwal");
  const verify = orders.filter((o) => o.status === "menunggu_verifikasi");
  const revenue = orders.flatMap((o) => o.payments).filter((p) => p.status === "terverifikasi").reduce((s, p) => s + p.amount, 0);

  const stats = [
    { label: "Tinjau jadwal", value: review.length, icon: CalendarClock, href: "/admin/pesanan?status=menunggu_jadwal" },
    { label: "Verifikasi bayar", value: verify.length, icon: Receipt, href: "/admin/pesanan?status=menunggu_verifikasi" },
    { label: "Pesanan aktif", value: orders.filter(isActive).length, icon: ClipboardList, href: "/admin/pesanan" },
    { label: "Pembayaran masuk", value: rupiah(revenue), icon: Wallet, href: "/admin/pesanan" },
  ];
  const todo = [...review, ...verify];

  return (
    <>
      <PageHeader title={<>Halo, <em>Mitra.</em></>} description="Yang perlu ditangani hari ini dan jadwal tim lapangan." />

      {/* Angka utama: satu baris tenang, bukan empat kartu */}
      <div className="grid grid-cols-2 border-y border-foreground/10 lg:grid-cols-4 lg:divide-x lg:divide-foreground/10">
        {stats.map((s, i) => (
          <Link key={s.label} href={s.href} className={`group flex flex-col gap-3 py-6 lg:px-6 lg:first:pl-0 ${i < 2 ? "max-lg:border-b max-lg:border-foreground/10" : ""} ${i % 2 ? "max-lg:pl-5" : ""}`}>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><s.icon className="size-4" />{s.label}</span>
            <span className="truncate font-display text-4xl leading-none tabular transition-colors duration-300 group-hover:text-primary xl:text-[2.75rem]">{s.value}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card title="Perlu tindakan" action={<Link href="/admin/pesanan" className="text-sm text-muted-foreground hover:text-foreground">Semua</Link>}>
          {todo.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada yang menunggu. Semua beres.</p>
          ) : (
            <ul className="-mx-2 divide-y">
              {todo.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/pesanan/${o.id}`} className="group flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted/60">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{o.customer.name}</span><StatusBadge status={o.status} /></div>
                      <p className="text-xs text-muted-foreground">{o.code} · {o.installDate ? `Pasang ${tanggal(o.installDate)}` : `Acara ${tanggal(o.eventStart)}`}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Jadwal lapangan" action={<Link href="/admin/jadwal" className="text-sm text-muted-foreground hover:text-foreground">Kalender penuh</Link>}>
          <SchedulePanel events={scheduleEvents(orders)} />
        </Card>
      </div>
    </>
  );
}

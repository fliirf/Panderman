import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PrintButton } from "@/components/print-button";
import { Logo } from "@/components/shared";
import { getAllItems, getOrder, getPackages, getSettings } from "@/lib/data";
import { rupiah, tanggal } from "@/lib/format";
import { orderSummary } from "@/lib/order-utils";
import { SITE } from "@/lib/site";

export const metadata = { title: "Nota" };

// FR-29/30. ponytail: PDF lewat "Simpan sebagai PDF" di dialog cetak browser; @react-pdf + kirim WA/email di tahap backend.
async function Content({ params }: PageProps<"/nota/[id]">) {
  const { id } = await params;
  const [order, items, packages, settings] = await Promise.all([getOrder(id), getAllItems(), getPackages(), getSettings()]);
  if (!order) notFound();
  const s = orderSummary(order, items, packages, settings);
  const isLunas = s.outstanding === 0;

  return (
    <div className="mx-auto max-w-3xl p-6 print:p-0">
      <div className="mb-4 flex justify-end print:hidden"><PrintButton /></div>
      <article className="ticket-edge space-y-8 rounded-[2rem] bg-card p-8 shadow-[0_30px_60px_-36px_color-mix(in_oklch,var(--pine)_45%,transparent)] ring-1 ring-foreground/[0.06] [--cut:38%] sm:p-10 print:rounded-none print:shadow-none print:ring-0 print:[mask:none]">
        <header className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <Logo />
            <p className="text-xs text-muted-foreground">{settings.pickupAddress}<br />WA {SITE.phone}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl leading-none">Nota <em>{isLunas ? "lunas" : "DP"}</em></p>
            <p className="mt-2 text-sm font-medium tabular">{order.code}</p>
            <p className="text-xs text-muted-foreground">{tanggal(order.createdAt.slice(0, 10))}</p>
          </div>
        </header>

        <section className="grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-muted-foreground">Penyewa</p>
            <p className="font-medium">{order.customer.name}</p>
            <p>{order.customer.phone}</p>
            {order.address && <p className="text-muted-foreground">{order.address.text}</p>}
          </div>
          <div>
            <p className="mb-1.5 text-muted-foreground">Jadwal</p>
            <p>Acara: {tanggal(order.eventStart)}{order.eventEnd !== order.eventStart && ` – ${tanggal(order.eventEnd)}`}</p>
            {order.installDate && <p>Pemasangan: {tanggal(order.installDate)}</p>}
            <p>Pembongkaran: {tanggal(order.teardownDate)}</p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dashed border-foreground/25 text-left text-xs text-muted-foreground">
              <th className="py-2 font-medium">Item</th><th className="py-2 text-right font-medium">Jml</th><th className="py-2 text-right font-medium">Harga</th><th className="py-2 text-right font-medium">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {s.lines.map((l, i) => (
              <tr key={i}><td className="py-2.5">{l.name}</td><td className="py-2.5 text-right tabular">{l.qty}</td><td className="py-2.5 text-right tabular">{rupiah(l.price)}</td><td className="py-2.5 text-right tabular">{rupiah(l.price * l.qty)}</td></tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
          {[
            ["Subtotal", s.price.subtotal],
            ["Ongkir & pasang", s.price.deliveryFee],
            ...(s.price.extraDaysFee ? [["Tambahan hari", s.price.extraDaysFee]] : []),
            ...(s.penalty ? [["Denda", s.penalty]] : []),
          ].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="tabular">{rupiah(v as number)}</dd></div>)}
          <div className="flex items-baseline justify-between border-t border-dashed border-foreground/25 pt-3"><dt className="font-medium">Total</dt><dd className="font-display text-3xl tabular">{rupiah(s.price.total + s.penalty)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Dibayar</dt><dd className="tabular">{rupiah(s.paid)}</dd></div>
          <div className="flex justify-between font-medium"><dt>Sisa tagihan</dt><dd className="tabular">{rupiah(s.outstanding)}</dd></div>
        </dl>

        <footer className="border-t border-dashed border-foreground/25 pt-5 text-xs text-muted-foreground">
          {isLunas ? "Terima kasih, pembayaran lunas." : "Sisa tagihan dibayar paling lambat saat pemasangan/pengambilan."} Barang rusak/hilang didenda sesuai harga barang asli.
        </footer>
      </article>
    </div>
  );
}

export default function Page(props: PageProps<"/nota/[id]">) {
  return <Suspense><Content {...props} /></Suspense>;
}

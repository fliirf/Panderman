import { UsersThreeIcon as Users } from "@phosphor-icons/react/ssr";
import { PackageDialog } from "@/components/admin-forms";
import { ItemImage, PageHeader } from "@/components/shared";
import { getAllItems, getPackages } from "@/lib/data";
import { rupiah } from "@/lib/format";

export const metadata = { title: "Paket" };

export default async function PaketAdminPage() {
  const [items, packages] = await Promise.all([getAllItems(), getPackages()]);
  return (
    <>
      <PageHeader title="Paket" description="Disusun dari barang satuan. Stok paket mengikuti stok isinya.">
        <PackageDialog items={items} />
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((p) => {
          const normal = p.contents.reduce((s, c) => s + (items.find((i) => i.id === c.itemId)?.price ?? 0) * c.qty, 0);
          return (
            <div key={p.id} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06]">
              <ItemImage category="paket" image={p.image} alt={p.name} className="aspect-[16/8]" iconSize={40} />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{p.name}</h2>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3.5" />±{p.guestCapacity}</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {p.contents.map((c) => <li key={c.itemId}>{c.qty}× {items.find((i) => i.id === c.itemId)?.name}</li>)}
                </ul>
                <div className="mt-auto flex items-end justify-between border-t pt-3">
                  <div>
                    <p className="font-semibold tabular">{rupiah(p.price)}</p>
                    <p className="text-xs text-muted-foreground tabular">Satuan {rupiah(normal)}</p>
                  </div>
                  <PackageDialog items={items} pkg={p} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

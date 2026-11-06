import { ItemDialog } from "@/components/admin-forms";
import { ItemImage, PageHeader } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllItems } from "@/lib/data";
import { CATEGORY_LABEL, rupiah, UNIT_LABEL } from "@/lib/format";

export const metadata = { title: "Barang" };

export default async function BarangAdminPage() {
  const items = await getAllItems();
  return (
    <>
      <PageHeader title="Barang satuan" description={`${items.length} barang. Harga, stok, dan harga barang asli (dasar denda).`}>
        <ItemDialog />
      </PageHeader>
      <div className="overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-foreground/[0.06]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Barang</TableHead>
              <TableHead className="hidden sm:table-cell">Kategori</TableHead>
              <TableHead className="text-right">Harga sewa</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="hidden text-right md:table-cell">Harga asli</TableHead>
              <TableHead className="w-12 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <ItemImage category={i.category} image={i.image} alt="" sizes="48px" className="size-11 shrink-0 rounded-xl" iconSize={18} />
                    <div className="min-w-0"><p className="truncate font-medium">{i.name}</p><p className="truncate text-xs text-muted-foreground">{i.spec}</p></div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{CATEGORY_LABEL[i.category]}</TableCell>
                <TableCell className="text-right tabular">{rupiah(i.price)}<span className="text-xs text-muted-foreground">/{UNIT_LABEL[i.unit]}</span></TableCell>
                <TableCell className="text-right tabular">{i.stock.toLocaleString("id-ID")}</TableCell>
                <TableCell className="hidden text-right tabular md:table-cell">{rupiah(i.replacementPrice)}</TableCell>
                <TableCell className="pr-5"><ItemDialog item={i} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

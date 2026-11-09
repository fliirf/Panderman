
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { items, packages } from "../src/lib/data/mock";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai proses memasukkan data...");

  // 1. Memasukkan data barang
  for (const item of items) {
    await prisma.item.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        category: item.category,
        description: item.description,
        spec: item.spec,
        price: item.price,
        unit: item.unit,
        stock: item.stock,
        replacementPrice: item.replacementPrice,
        image: item.image,
      },
      create: {
        id: item.id,
        slug: item.slug,
        name: item.name,
        category: item.category,
        description: item.description,
        spec: item.spec,
        price: item.price,
        unit: item.unit,
        stock: item.stock,
        replacementPrice: item.replacementPrice,
        image: item.image,
      },
    });
  }

  console.log(`${items.length} barang berhasil diproses.`);

  // 2. Memasukkan data paket dan isi paket
  for (const pkg of packages) {
    const contents = pkg.contents.map((content) => ({
      qty: content.qty,
      item: {
        connect: { id: content.itemId },
      },
    }));

    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {
        name: pkg.name,
        description: pkg.description,
        guestCapacity: pkg.guestCapacity,
        price: pkg.price,
        image: pkg.image,
        contents: {
          deleteMany: {},
          create: contents,
        },
      },
      create: {
        id: pkg.id,
        slug: pkg.slug,
        name: pkg.name,
        description: pkg.description,
        guestCapacity: pkg.guestCapacity,
        price: pkg.price,
        image: pkg.image,
        contents: {
          create: contents,
        },
      },
    });
  }

  console.log(`${packages.length} paket berhasil diproses.`);

  // 3. Memeriksa jumlah data
  const totalItems = await prisma.item.count();
  const totalPackages = await prisma.package.count();
  const totalPackageItems = await prisma.packageItem.count();

  console.log("\nHasil pemasukan data:");
  console.log("Total barang:", totalItems);
  console.log("Total paket:", totalPackages);
  console.log("Total isi paket:", totalPackageItems);
}

main()
  .catch((error) => {
    console.error("Terjadi kesalahan:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

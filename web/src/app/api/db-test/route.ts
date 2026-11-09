
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalItems = await prisma.item.count();

    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Koneksi database berhasil!",
      totalItems,
      data: items,
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data dari database.",
      },
      { status: 500 }
    );
  }
}

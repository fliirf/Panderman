"use client";

import { PrinterIcon as Printer } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return <Button onClick={() => window.print()}><Printer /> Cetak / simpan PDF</Button>;
}

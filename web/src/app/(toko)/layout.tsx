import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { PageSkeleton } from "@/components/skeletons";

export default function TokoLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {/* Data dari DB dinamis (connection()), jadi halaman di-stream di balik satu batas Suspense */}
      <main className="flex-1"><Suspense fallback={<PageSkeleton />}>{children}</Suspense></main>
      <SiteFooter />
    </>
  );
}

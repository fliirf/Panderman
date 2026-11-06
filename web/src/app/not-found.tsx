import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { SIDE_PHOTO } from "@/lib/data/mock";

export default function NotFound() {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 flex-col justify-center gap-6 py-16">
          <p className="font-display text-[7rem] leading-none text-janur [-webkit-text-stroke:1.5px_var(--pine)] sm:text-[10rem]">404</p>
          <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">Halaman ini belum <em>dipasang.</em></h1>
          <p className="max-w-sm text-muted-foreground">Mungkin tautannya salah ketik, atau barangnya sudah tidak disewakan.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants({ size: "lg" })}><ArrowLeftIcon /> Ke beranda</Link>
            <Link href="/katalog" className={buttonVariants({ variant: "outline", size: "lg" })}>Lihat katalog</Link>
          </div>
        </div>
      </div>
      <div className="hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[2rem] bg-pine">
          <Image src={SIDE_PHOTO} alt="" fill sizes="50vw" className="object-cover opacity-90" />
        </div>
      </div>
    </div>
  );
}

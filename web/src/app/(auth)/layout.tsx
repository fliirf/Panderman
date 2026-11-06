import Image from "next/image";
import { Logo } from "@/components/shared";
import { SIDE_PHOTO } from "@/lib/data/mock";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="rise w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[2rem] bg-pine">
          <Image src={SIDE_PHOTO} alt="Interior tenda dengan tirai kain putih" fill sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,oklch(0.18_0.04_168/0.88))]" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <p className="max-w-md font-display text-4xl leading-[1.1]">Satu akun untuk pesanan, nota, dan <em className="text-janur">jadwal pemasangan.</em></p>
            <p className="mt-4 text-sm text-white/70">Foto KTP dan alamat hanya dilihat Anda dan admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

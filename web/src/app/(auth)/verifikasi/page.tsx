import { Suspense } from "react";
import { OtpForm } from "@/components/auth-forms";
export const metadata = { title: "Verifikasi" };

async function Content({ searchParams }: PageProps<"/verifikasi">) {
  const { ke } = await searchParams;
  return <OtpForm to={typeof ke === "string" ? ke : ""} />;
}

export default function Page(props: PageProps<"/verifikasi">) {
  return <Suspense><Content {...props} /></Suspense>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SpinnerGapIcon as Loader2, EnvelopeSimpleIcon as Mail, WhatsappLogoIcon as MessageCircle, DeviceMobileIcon as Smartphone } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ponytail: semua form auth masih mock (tanpa request). Backend: Better Auth + plugin 2FA/OTP.
const fake = () => new Promise((r) => setTimeout(r, 500));

function Field({ id, label, ...props }: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} className="h-11" {...props} />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const id = new FormData(e.currentTarget).get("identitas") as string;
        start(async () => {
          await fake();
          router.push(`/verifikasi?ke=${encodeURIComponent(id)}`);
        });
      }}
    >
      <div className="space-y-1">
        <h1 className="font-display text-4xl leading-[1.05]">Masuk</h1>
        <p className="text-sm text-muted-foreground">Gunakan nomor HP atau email yang terdaftar.</p>
      </div>
      <Field id="identitas" label="Nomor HP atau email" placeholder="08xx atau nama@email.com" autoComplete="username" required />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/lupa-password" className="text-xs text-muted-foreground hover:text-foreground">Lupa password?</Link>
        </div>
        <Input id="password" type="password" className="h-11" autoComplete="current-password" required minLength={8} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">{pending && <Loader2 className="animate-spin" />}Masuk</Button>
      <p className="text-center text-sm text-muted-foreground">Belum punya akun? <Link href="/daftar" className="font-medium text-foreground hover:underline">Daftar</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [via, setVia] = useState<"hp" | "email">("hp");
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const id = new FormData(e.currentTarget).get("identitas") as string;
        start(async () => {
          await fake();
          router.push(`/verifikasi?ke=${encodeURIComponent(id)}`);
        });
      }}
    >
      <div className="space-y-1">
        <h1 className="font-display text-4xl leading-[1.05]">Buat akun</h1>
        <p className="text-sm text-muted-foreground">Gratis. Katalog bisa dilihat tanpa akun, akun dibutuhkan saat checkout.</p>
      </div>
      <Field id="nama" label="Nama lengkap" autoComplete="name" required />
      <div className="space-y-2">
        <div className="flex rounded-lg bg-muted p-1 text-sm">
          {(["hp", "email"] as const).map((v) => (
            <button type="button" key={v} onClick={() => setVia(v)} className={cn("flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md transition", via === v ? "bg-background font-medium shadow-sm" : "text-muted-foreground")}>
              {v === "hp" ? <Smartphone className="size-4" /> : <Mail className="size-4" />} {v === "hp" ? "Nomor HP" : "Email"}
            </button>
          ))}
        </div>
        {via === "hp" ? (
          <Input id="identitas" name="identitas" type="tel" inputMode="tel" placeholder="08xxxxxxxxxx" className="h-11" autoComplete="tel" required pattern="0[0-9]{9,13}" title="Nomor HP diawali 0, 10–14 digit" />
        ) : (
          <Input id="identitas" name="identitas" type="email" placeholder="nama@email.com" className="h-11" autoComplete="email" required />
        )}
      </div>
      <Field id="password" label="Password" type="password" autoComplete="new-password" minLength={8} required placeholder="Minimal 8 karakter" />
      <Button type="submit" disabled={pending} className="w-full">{pending && <Loader2 className="animate-spin" />}Daftar</Button>
      <p className="text-center text-sm text-muted-foreground">Sudah punya akun? <Link href="/masuk" className="font-medium text-foreground hover:underline">Masuk</Link></p>
    </form>
  );
}

const RESEND = 60;

export function OtpForm({ to }: { to: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(RESEND);
  const [tries, setTries] = useState(0);
  const [pending, start] = useTransition();
  const isEmail = to.includes("@");

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const locked = tries >= 5; // NFR-02: dikunci 15 menit setelah 5x salah (ditegakkan di server nanti)

  function verify(v: string) {
    start(async () => {
      await fake();
      // ponytail: mock, kode benar = 123456
      if (v === "123456") {
        toast.success("Berhasil masuk");
        router.push("/pesanan");
      } else {
        setTries((t) => t + 1);
        setCode("");
        toast.error("Kode salah");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="grid size-11 place-items-center rounded-full bg-janur text-janur-foreground">{isEmail ? <Mail className="size-5" /> : <MessageCircle className="size-5" />}</span>
        <h1 className="font-display text-4xl leading-[1.05]">Masukkan kode verifikasi</h1>
        <p className="text-sm text-muted-foreground">
          Kode 6 digit dikirim {isEmail ? "ke email" : "lewat WhatsApp ke"} <b className="text-foreground">{to || "akun Anda"}</b>. Berlaku 5 menit.
        </p>
      </div>
      <InputOTP maxLength={6} value={code} disabled={pending || locked} onChange={(v) => { setCode(v); if (v.length === 6) verify(v); }} autoFocus>
        <InputOTPGroup className="w-full justify-between">
          {Array.from({ length: 6 }, (_, i) => <InputOTPSlot key={i} index={i} className="size-12 text-lg" />)}
        </InputOTPGroup>
      </InputOTP>
      {locked ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:text-red-400">Terlalu banyak percobaan. Coba lagi dalam 15 menit.</p>
      ) : tries > 0 ? (
        <p className="text-sm text-red-600 dark:text-red-400">Kode salah. Sisa {5 - tries} percobaan.</p>
      ) : (
        <p className="text-xs text-muted-foreground">Mode demo: gunakan kode <span className="font-mono">123456</span>.</p>
      )}
      <Button className="w-full" disabled={code.length < 6 || pending || locked} onClick={() => verify(code)}>{pending && <Loader2 className="animate-spin" />}Verifikasi</Button>
      <div className="flex justify-between text-sm">
        <Link href="/masuk" className="text-muted-foreground hover:text-foreground">← Kembali</Link>
        {left > 0 ? (
          <span className="text-muted-foreground tabular">Kirim ulang dalam {left} dtk</span>
        ) : (
          <button className="font-medium text-primary" onClick={() => { setLeft(RESEND); toast("Kode baru dikirim"); }}>Kirim ulang kode</button>
        )}
      </div>
    </div>
  );
}

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  if (sent)
    return (
      <div className="space-y-3">
        <h1 className="font-display text-4xl leading-[1.05]">Cek pesan Anda</h1>
        <p className="text-sm text-muted-foreground">Jika akun terdaftar, tautan atur ulang password sudah dikirim.</p>
        <Link href="/masuk" className="text-sm font-medium text-primary">← Kembali ke masuk</Link>
      </div>
    );
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); start(async () => { await fake(); setSent(true); }); }}>
      <div className="space-y-1">
        <h1 className="font-display text-4xl leading-[1.05]">Lupa password</h1>
        <p className="text-sm text-muted-foreground">Kami kirim tautan atur ulang ke HP atau email Anda.</p>
      </div>
      <Field id="identitas" label="Nomor HP atau email" required />
      <Button type="submit" disabled={pending} className="w-full">{pending && <Loader2 className="animate-spin" />}Kirim tautan</Button>
      <Link href="/masuk" className="block text-center text-sm text-muted-foreground hover:text-foreground">← Kembali</Link>
    </form>
  );
}

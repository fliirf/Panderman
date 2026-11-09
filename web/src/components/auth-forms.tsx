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
import { authClient } from "@/lib/auth-client";

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

        const formData = new FormData(e.currentTarget);
        const email = formData.get("identitas") as string;
        const password = formData.get("password") as string;

        start(async () => {
          const { data, error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/pesanan",
          });

          if (error) {
            toast.error(error.message || "Login gagal.");
            return;
          }

          if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
            return;
          }

          router.push("/pesanan");
          router.refresh();
        });
      }}
    >
      <div className="space-y-1">
        <h1 className="font-display text-4xl leading-[1.05]">
          Masuk
        </h1>
        <p className="text-sm text-muted-foreground">
          Gunakan email dan password yang terdaftar.
        </p>
      </div>

      <Field
        id="identitas"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        autoComplete="username"
        required
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/lupa-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Lupa password?
          </Link>
        </div>

        <Input
          id="password"
          name="password"
          type="password"
          className="h-11"
          autoComplete="current-password"
          required
          minLength={8}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full"
      >
        {pending && <Loader2 className="animate-spin" />}
        Masuk
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/daftar"
          className="font-medium text-foreground hover:underline"
        >
          Daftar
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const name = formData.get("nama") as string;
        const email = formData.get("identitas") as string;
        const password = formData.get("password") as string;

        start(async () => {
          const { error } = await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: "/masuk",
          });

          if (error) {
            console.error("REGISTRATION ERROR:", error);
            toast.error(error.message || "Registrasi gagal.");
            return;
          }

          toast.success("Akun berhasil dibuat!");

          router.replace("/masuk");
        });
      }}
    >
      <div className="space-y-1">
        <h1 className="font-display text-4xl leading-[1.05]">
          Buat akun
        </h1>

        <p className="text-sm text-muted-foreground">
          Gratis. Katalog bisa dilihat tanpa akun, akun dibutuhkan saat checkout.
        </p>
      </div>

      <Field
        id="nama"
        label="Nama lengkap"
        autoComplete="name"
        required
      />

      <Field
        id="identitas"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        autoComplete="email"
        required
      />

      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        placeholder="Minimal 8 karakter"
      />

      <Button
        type="submit"
        disabled={pending}
        className="w-full"
      >
        {pending && <Loader2 className="animate-spin" />}
        Daftar
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/masuk"
          className="font-medium text-foreground hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}

const RESEND = 60;

export function OtpForm({ to }: { to: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(RESEND);
  const [pending, start] = useTransition();
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (left <= 0) return;

    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  // Mengirim OTP ketika halaman verifikasi dibuka.
  useEffect(() => {
    let active = true;

    async function sendInitialOtp() {
      setSendingOtp(true);

      const { error } = await authClient.twoFactor.sendOtp();

      if (!active) return;

      if (error) {
        toast.error(error.message || "Gagal mengirim kode OTP.");
      } else {
        setOtpSent(true);
        toast.success("Kode OTP berhasil dikirim ke email.");
      }

      setSendingOtp(false);
    }

    void sendInitialOtp();

    return () => {
      active = false;
    };
  }, []);

  // Memverifikasi OTP.
  function verify(v: string) {
    if (v.length !== 6 || pending || !otpSent) return;

    start(async () => {
      const { error } = await authClient.twoFactor.verifyOtp({
        code: v,
        trustDevice: false,
      });

      if (error) {
        setCode("");
        toast.error(error.message || "Kode OTP tidak valid.");
        return;
      }

      toast.success("Berhasil masuk!");
      router.replace("/pesanan");
      router.refresh();
    });
  }

  // Mengirim ulang OTP.
  async function resendOtp() {
    setSendingOtp(true);

    const { error } = await authClient.twoFactor.sendOtp();

    if (error) {
      toast.error(error.message || "Gagal mengirim ulang OTP.");
    } else {
      setCode("");
      setLeft(RESEND);
      setOtpSent(true);
      toast.success("Kode OTP baru berhasil dikirim.");
    }

    setSendingOtp(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="grid size-11 place-items-center rounded-full bg-janur text-janur-foreground">
          <Mail className="size-5" />
        </span>

        <h1 className="font-display text-4xl leading-[1.05]">
          Masukkan kode verifikasi
        </h1>

        <p className="text-sm text-muted-foreground">
          Kode 6 digit dikirim ke email{" "}
          <b className="text-foreground">{to || "akun Anda"}</b>.
          Berlaku 5 menit.
        </p>
      </div>

      <InputOTP
        maxLength={6}
        value={code}
        disabled={pending || !otpSent || sendingOtp}
        onChange={(v) => {
          setCode(v);
          if (v.length === 6) verify(v);
        }}
        autoFocus
      >
        <InputOTPGroup className="w-full justify-between">
          {Array.from({ length: 6 }, (_, i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="size-12 text-lg"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {!otpSent ? (
        <p className="text-sm text-muted-foreground">
          {sendingOtp
            ? "Sedang mengirim kode OTP..."
            : "Kode OTP belum berhasil dikirim. Silakan coba kirim ulang."}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Masukkan kode OTP yang dikirim ke email kamu.
        </p>
      )}

      <Button
        className="w-full"
        disabled={code.length < 6 || pending || !otpSent}
        onClick={() => verify(code)}
      >
        {pending && <Loader2 className="animate-spin" />}
        Verifikasi
      </Button>

      <div className="flex justify-between text-sm">
        <Link
          href="/masuk"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Kembali
        </Link>

        {left > 0 ? (
          <span className="text-muted-foreground tabular">
            Kirim ulang dalam {left} dtk
          </span>
        ) : (
          <button
            type="button"
            className="font-medium text-primary"
            disabled={sendingOtp}
            onClick={resendOtp}
          >
            {sendingOtp ? "Mengirim..." : "Kirim ulang kode"}
          </button>
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

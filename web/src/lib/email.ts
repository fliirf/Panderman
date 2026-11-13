import { Resend } from "resend";

export async function sendOTPEmail(
  email: string,
  otp: string
) {
  // ==========================================
  // MODE TESTING LOKAL (EMAIL TIDAK DIKIRIM)
  // ==========================================
  console.log("====================================");
  console.log(`[SIMULASI EMAIL] Mengirim OTP ke: ${email}`);
  console.log(`KODE OTP ANDA ADALAH: ${otp}`);
  console.log("====================================");

  // Kita pura-pura sukses mengirim email
  return { success: true, message: "Simulasi email berhasil" };

  /* 
  // ==========================================
  // KODE ASLI (HAKIKATNYA UNTUK PRODUCTION)
  // ==========================================
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY belum diisi di .env");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Kode Verifikasi Panderman",
    html: `
      <div>
        <h2>Verifikasi Login Panderman</h2>
        <p>Gunakan kode OTP berikut untuk melanjutkan login:</p>
        <h1>${otp}</h1>
        <p>Jangan bagikan kode ini kepada siapa pun.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Gagal mengirim OTP:", error);
    throw new Error("Email OTP gagal dikirim.");
  }

  return data;
  */
}

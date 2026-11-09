import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(
  email: string,
  otp: string
) {
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
}

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/email";

export const auth = betterAuth({
  appName: "Panderman",

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Otomatis mengaktifkan 2FA untuk setiap akun baru.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              twoFactorEnabled: true,
            },
          };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    twoFactor({
      issuer: "Panderman",

      otpOptions: {
        period: 5,

        async sendOTP({ user, otp }) {
          console.log("Fungsi pengiriman OTP dipanggil.");
          await sendOTPEmail(user.email, otp);
        },
      },
    }),
  ],
});

import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      twoFactorEnabled: true,
    },
  });

  console.log(`${result.count} akun berhasil diaktifkan 2FA.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

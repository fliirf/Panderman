-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('tenda', 'kursi', 'meja', 'lighting', 'dekorasi', 'prasmanan');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('unit', 'set', 'm2');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('menunggu_jadwal', 'menunggu_pembayaran', 'menunggu_verifikasi', 'dp_terverifikasi', 'lunas', 'dibatalkan', 'selesai');

-- CreateEnum
CREATE TYPE "OrderLineKind" AS ENUM ('item', 'package');

-- CreateEnum
CREATE TYPE "PaymentScheme" AS ENUM ('dp', 'lunas');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('transfer', 'tunai');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('dp', 'pelunasan', 'lunas', 'denda');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('menunggu', 'terverifikasi', 'ditolak');

-- CreateEnum
CREATE TYPE "PrasmananMode" AS ENUM ('antar', 'ambil');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('menunggu', 'disetujui', 'ditolak');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "unit" "PriceUnit" NOT NULL,
    "stock" INTEGER NOT NULL,
    "replacementPrice" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "guestCapacity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "PackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'menunggu_jadwal',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "eventStart" TIMESTAMP(3) NOT NULL,
    "eventEnd" TIMESTAMP(3) NOT NULL,
    "installDate" TIMESTAMP(3),
    "teardownDate" TIMESTAMP(3) NOT NULL,
    "prasmananMode" "PrasmananMode",
    "prasmananPickupDate" TIMESTAMP(3),
    "prasmananReturnDate" TIMESTAMP(3),
    "addressText" TEXT,
    "addressNote" TEXT,
    "deliveryZoneId" TEXT,
    "extraDays" INTEGER NOT NULL DEFAULT 0,
    "scheme" "PaymentScheme" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "kind" "OrderLineKind" NOT NULL,
    "itemId" TEXT,
    "packageId" TEXT,
    "qty" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'menunggu',
    "proofUrl" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleProposal" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "installDate" TIMESTAMP(3) NOT NULL,
    "extraDays" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'menunggu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "note" TEXT,
    "totalPenalty" INTEGER NOT NULL DEFAULT 0,
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnDamage" (
    "id" TEXT NOT NULL,
    "returnRecordId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "penaltyAmount" INTEGER NOT NULL,

    CONSTRAINT "ReturnDamage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxKm" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "dpPercent" INTEGER NOT NULL DEFAULT 50,
    "dpDeadlineHours" INTEGER NOT NULL DEFAULT 24,
    "extraDayRate" INTEGER NOT NULL DEFAULT 250000,
    "minDaysBefore" INTEGER NOT NULL DEFAULT 1,
    "maxDaysBefore" INTEGER NOT NULL DEFAULT 5,
    "pickupAddress" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Item_slug_key" ON "Item"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "PackageItem_itemId_idx" ON "PackageItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageItem_packageId_itemId_key" ON "PackageItem"("packageId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_eventStart_eventEnd_idx" ON "Order"("eventStart", "eventEnd");

-- CreateIndex
CREATE INDEX "OrderLine_orderId_idx" ON "OrderLine"("orderId");

-- CreateIndex
CREATE INDEX "OrderLine_itemId_idx" ON "OrderLine"("itemId");

-- CreateIndex
CREATE INDEX "OrderLine_packageId_idx" ON "OrderLine"("packageId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "ScheduleProposal_orderId_idx" ON "ScheduleProposal"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRecord_orderId_key" ON "ReturnRecord"("orderId");

-- CreateIndex
CREATE INDEX "ReturnDamage_returnRecordId_idx" ON "ReturnDamage"("returnRecordId");

-- CreateIndex
CREATE INDEX "ReturnDamage_itemId_idx" ON "ReturnDamage"("itemId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageItem" ADD CONSTRAINT "PackageItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleProposal" ADD CONSTRAINT "ScheduleProposal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRecord" ADD CONSTRAINT "ReturnRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnDamage" ADD CONSTRAINT "ReturnDamage_returnRecordId_fkey" FOREIGN KEY ("returnRecordId") REFERENCES "ReturnRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnDamage" ADD CONSTRAINT "ReturnDamage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

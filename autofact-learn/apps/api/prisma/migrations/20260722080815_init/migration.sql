-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'EXPERT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO', 'DOC');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SALE', 'WITHDRAWAL', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionLevel" AS ENUM ('NONE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "specializations" TEXT[],
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 4.5,
    "inspectionsCount" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "payoutDetails" TEXT,
    "balanceKopecks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionLevel" "SubscriptionLevel" NOT NULL DEFAULT 'NONE',
    "subscriptionEndsAt" TIMESTAMP(3),

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarReport" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "vin" TEXT,
    "vinVisible" BOOLEAN NOT NULL DEFAULT false,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "engineScore" INTEGER NOT NULL,
    "bodyScore" INTEGER NOT NULL,
    "interiorScore" INTEGER NOT NULL,
    "tiresScore" INTEGER NOT NULL,
    "electricsScore" INTEGER NOT NULL,
    "expertOverallScore" DECIMAL(3,2) NOT NULL,
    "basePriceKopecks" INTEGER NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "platformScore" DECIMAL(3,2),
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CarReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportMedia" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrder" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "expertId" TEXT,
    "listingUrl" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "priceKopecks" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountKopecks" INTEGER NOT NULL,
    "yookassaPaymentId" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "priceKopecks" INTEGER NOT NULL,
    "platformFeeKopecks" INTEGER NOT NULL,
    "expertPayoutKopecks" INTEGER NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertReview" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpertReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");

-- CreateIndex
CREATE INDEX "ExpertProfile_region_idx" ON "ExpertProfile"("region");

-- CreateIndex
CREATE INDEX "ExpertProfile_rating_idx" ON "ExpertProfile"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "CarReport_status_createdAt_idx" ON "CarReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CarReport_region_idx" ON "CarReport"("region");

-- CreateIndex
CREATE INDEX "CarReport_make_model_idx" ON "CarReport"("make", "model");

-- CreateIndex
CREATE INDEX "CarReport_vin_idx" ON "CarReport"("vin");

-- CreateIndex
CREATE INDEX "CarReport_expertId_idx" ON "CarReport"("expertId");

-- CreateIndex
CREATE INDEX "ReportMedia_reportId_idx" ON "ReportMedia"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrder_reportId_key" ON "CustomOrder"("reportId");

-- CreateIndex
CREATE INDEX "CustomOrder_status_idx" ON "CustomOrder"("status");

-- CreateIndex
CREATE INDEX "CustomOrder_clientId_idx" ON "CustomOrder"("clientId");

-- CreateIndex
CREATE INDEX "CustomOrder_expertId_idx" ON "CustomOrder"("expertId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_transactionId_key" ON "Purchase"("transactionId");

-- CreateIndex
CREATE INDEX "Purchase_clientId_idx" ON "Purchase"("clientId");

-- CreateIndex
CREATE INDEX "Purchase_reportId_idx" ON "Purchase"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_clientId_reportId_key" ON "Purchase"("clientId", "reportId");

-- CreateIndex
CREATE INDEX "ExpertReview_expertId_idx" ON "ExpertReview"("expertId");

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarReport" ADD CONSTRAINT "CarReport_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportMedia" ADD CONSTRAINT "ReportMedia_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CarReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrder" ADD CONSTRAINT "CustomOrder_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CarReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CarReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertReview" ADD CONSTRAINT "ExpertReview_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertReview" ADD CONSTRAINT "ExpertReview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

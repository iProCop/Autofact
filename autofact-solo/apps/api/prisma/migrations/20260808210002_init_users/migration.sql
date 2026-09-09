-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'EXPERT', 'ADMIN');

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

-- AddForeignKey
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

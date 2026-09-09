-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DISPUTED');

-- CreateTable
CREATE TABLE "CarReport" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "vin" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "engineScore" INTEGER NOT NULL,
    "bodyScore" INTEGER NOT NULL,
    "paintScore" INTEGER NOT NULL DEFAULT 7,
    "interiorScore" INTEGER NOT NULL,
    "tiresScore" INTEGER NOT NULL DEFAULT 7,
    "electricsScore" INTEGER NOT NULL DEFAULT 7,
    "expertOverallScore" DECIMAL(4,2) NOT NULL,
    "basePriceKopecks" INTEGER NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "platformScore" DECIMAL(4,2),
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "expertNotes" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CarReport_pkey" PRIMARY KEY ("id")
);

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

-- AddForeignKey
ALTER TABLE "CarReport" ADD CONSTRAINT "CarReport_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ExpertProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

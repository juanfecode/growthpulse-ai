-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Founder', 'VPMarketing', 'CMO', 'Otro');

-- CreateEnum
CREATE TYPE "AbVariant" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ab_variant" "AbVariant" NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_assignments" (
    "id" UUID NOT NULL,
    "variant" "AbVariant" NOT NULL,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_ab_variant_idx" ON "leads"("ab_variant");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at" DESC);

-- CreateIndex
CREATE INDEX "ab_assignments_variant_idx" ON "ab_assignments"("variant");

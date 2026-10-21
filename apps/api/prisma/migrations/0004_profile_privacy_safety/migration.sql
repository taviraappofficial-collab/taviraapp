-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('spam', 'harassment', 'impersonation', 'unsafe_content', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('submitted', 'reviewing', 'resolved', 'dismissed');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "discoverable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'public';

-- CreateTable
CREATE TABLE "AccountBlock" (
    "blockerId" UUID NOT NULL,
    "blockedId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountBlock_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "SafetyReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "targetAccountId" UUID NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "details" VARCHAR(1000),
    "status" "ReportStatus" NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "actorAccountId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "targetAccountId" UUID,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountBlock_blockedId_idx" ON "AccountBlock"("blockedId");

-- CreateIndex
CREATE INDEX "SafetyReport_reporterId_createdAt_idx" ON "SafetyReport"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyReport_targetAccountId_status_idx" ON "SafetyReport"("targetAccountId", "status");

-- CreateIndex
CREATE INDEX "AuditEvent_actorAccountId_createdAt_idx" ON "AuditEvent"("actorAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_targetAccountId_createdAt_idx" ON "AuditEvent"("targetAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_action_createdAt_idx" ON "AuditEvent"("action", "createdAt");

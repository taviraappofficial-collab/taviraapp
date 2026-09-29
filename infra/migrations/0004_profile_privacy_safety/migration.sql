CREATE TYPE "ProfileVisibility" AS ENUM ('public', 'private');
CREATE TYPE "ReportCategory" AS ENUM (
  'spam',
  'harassment',
  'impersonation',
  'unsafe_content',
  'other'
);
CREATE TYPE "ReportStatus" AS ENUM (
  'submitted',
  'reviewing',
  'resolved',
  'dismissed'
);

ALTER TABLE "Profile"
ADD COLUMN "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'public',
ADD COLUMN "discoverable" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE "AccountBlock" (
  "blockerId" UUID NOT NULL,
  "blockedId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountBlock_pkey" PRIMARY KEY ("blockerId", "blockedId"),
  CONSTRAINT "AccountBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "Account"("id") ON DELETE CASCADE,
  CONSTRAINT "AccountBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "Account"("id") ON DELETE CASCADE,
  CONSTRAINT "AccountBlock_no_self_block" CHECK ("blockerId" <> "blockedId")
);

CREATE TABLE "SafetyReport" (
  "id" UUID NOT NULL,
  "reporterId" UUID NOT NULL,
  "targetAccountId" UUID NOT NULL,
  "category" "ReportCategory" NOT NULL,
  "details" VARCHAR(1000),
  "status" "ReportStatus" NOT NULL DEFAULT 'submitted',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SafetyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Account"("id") ON DELETE CASCADE,
  CONSTRAINT "SafetyReport_targetAccountId_fkey" FOREIGN KEY ("targetAccountId") REFERENCES "Account"("id") ON DELETE CASCADE,
  CONSTRAINT "SafetyReport_no_self_report" CHECK ("reporterId" <> "targetAccountId")
);

CREATE TABLE "AuditEvent" (
  "id" UUID NOT NULL,
  "actorAccountId" UUID,
  "action" VARCHAR(100) NOT NULL,
  "targetAccountId" UUID,
  "metadata" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditEvent_actorAccountId_fkey" FOREIGN KEY ("actorAccountId") REFERENCES "Account"("id") ON DELETE SET NULL,
  CONSTRAINT "AuditEvent_targetAccountId_fkey" FOREIGN KEY ("targetAccountId") REFERENCES "Account"("id") ON DELETE SET NULL
);

CREATE INDEX "AccountBlock_blockedId_idx" ON "AccountBlock"("blockedId");
CREATE INDEX "SafetyReport_reporterId_createdAt_idx" ON "SafetyReport"("reporterId", "createdAt");
CREATE INDEX "SafetyReport_targetAccountId_status_idx" ON "SafetyReport"("targetAccountId", "status");
CREATE INDEX "AuditEvent_actorAccountId_createdAt_idx" ON "AuditEvent"("actorAccountId", "createdAt");
CREATE INDEX "AuditEvent_targetAccountId_createdAt_idx" ON "AuditEvent"("targetAccountId", "createdAt");
CREATE INDEX "AuditEvent_action_createdAt_idx" ON "AuditEvent"("action", "createdAt");

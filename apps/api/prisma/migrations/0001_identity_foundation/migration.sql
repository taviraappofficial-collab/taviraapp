-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('email', 'phone');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending_verification', 'active', 'suspended', 'closed');

-- CreateEnum
CREATE TYPE "CreatorStatus" AS ENUM ('not_applied', 'pending', 'approved', 'rejected', 'suspended', 'revoked');

-- CreateEnum
CREATE TYPE "VerificationBadgeStatus" AS ENUM ('not_applied', 'pending', 'approved', 'rejected', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('not_applied', 'pending', 'approved', 'rejected', 'suspended');

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "contactType" "ContactType" NOT NULL,
    "contact" VARCHAR(254) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'pending_verification',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "accountId" UUID NOT NULL,
    "passwordHash" VARCHAR(512) NOT NULL,
    "passwordUpdatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ(3),

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Profile" (
    "accountId" UUID NOT NULL,
    "handle" VARCHAR(30) NOT NULL,
    "displayName" VARCHAR(80) NOT NULL,
    "bio" VARCHAR(160) NOT NULL DEFAULT '',
    "avatarUrl" VARCHAR(2048),
    "creatorStatus" "CreatorStatus" NOT NULL DEFAULT 'not_applied',
    "verificationBadgeStatus" "VerificationBadgeStatus" NOT NULL DEFAULT 'not_applied',
    "sellerStatus" "SellerStatus" NOT NULL DEFAULT 'not_applied',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "VerificationChallenge" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "codeHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "deviceName" VARCHAR(100) NOT NULL,
    "refreshTokenHash" CHAR(64) NOT NULL,
    "refreshExpiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_contact_key" ON "Account"("contact");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "Account"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_handle_key" ON "Profile"("handle");

-- CreateIndex
CREATE INDEX "VerificationChallenge_accountId_createdAt_idx" ON "VerificationChallenge"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "VerificationChallenge_expiresAt_idx" ON "VerificationChallenge"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Session_accountId_revokedAt_idx" ON "Session"("accountId", "revokedAt");

-- CreateIndex
CREATE INDEX "Session_refreshExpiresAt_idx" ON "Session"("refreshExpiresAt");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationChallenge" ADD CONSTRAINT "VerificationChallenge_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

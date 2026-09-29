CREATE TYPE "ChallengePurpose" AS ENUM (
  'contact_verification',
  'password_reset'
);

ALTER TABLE "VerificationChallenge"
ADD COLUMN "purpose" "ChallengePurpose" NOT NULL DEFAULT 'contact_verification';

CREATE INDEX "VerificationChallenge_accountId_purpose_createdAt_idx"
ON "VerificationChallenge"("accountId", "purpose", "createdAt");

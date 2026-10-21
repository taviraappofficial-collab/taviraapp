-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "accessExpiresAt" TIMESTAMPTZ(3),
ADD COLUMN     "accessTokenHash" CHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessTokenHash_key" ON "Session"("accessTokenHash");

-- CreateIndex
CREATE INDEX "Session_accessExpiresAt_idx" ON "Session"("accessExpiresAt");

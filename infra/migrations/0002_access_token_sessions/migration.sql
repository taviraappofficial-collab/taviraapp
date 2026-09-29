ALTER TABLE "Session"
ADD COLUMN "accessTokenHash" CHAR(64),
ADD COLUMN "accessExpiresAt" TIMESTAMPTZ(3);

CREATE UNIQUE INDEX "Session_accessTokenHash_key"
ON "Session"("accessTokenHash");

CREATE INDEX "Session_accessExpiresAt_idx"
ON "Session"("accessExpiresAt");

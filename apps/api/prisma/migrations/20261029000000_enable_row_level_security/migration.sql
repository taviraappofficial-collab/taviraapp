-- The application accesses these tables only through the server-side Prisma
-- connection. Enabling RLS without public policies denies direct Data API
-- access from Supabase anon and authenticated clients while the database owner
-- used by the API and migrations retains access.
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Credential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AccountBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SafetyReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationChallenge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

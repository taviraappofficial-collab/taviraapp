# Production deployment

TAVIRA's API and workforce admin console are defined as separate Render web
services in the repository-root `render.yaml`. Supabase remains the database and
authentication provider. Both services deploy from `master` after GitHub checks
pass and run in Render's Frankfurt region, close to the Supabase project.

## Provision the Blueprint

1. In Render, create a **Blueprint** from the GitHub repository
   `taviraappofficial-collab/taviraapp` and select `render.yaml`.
2. Use a paid API service plan because Render pre-deploy commands are required
   for database migrations.
3. Supply every environment variable marked `sync: false` before the first
   deploy. Never commit their values.
4. Deploy the API first. Confirm `GET /v1/health` returns HTTP 200.
5. Set `TAVIRA_API_URL` on the admin service to the API's public HTTPS URL.
6. Set `CORS_ORIGINS` on the API to the comma-separated public web origins that
   may call it directly. Include the admin origin if browser-side API requests
   are added later.
7. Deploy the admin service and confirm `/auth/sign-in` returns HTTP 200.

## Environment variables

### API

- `DATABASE_URL`: Supabase transaction-pooler connection string on port 6543.
- `SUPABASE_URL`: Supabase project URL, with no trailing slash.
- `CORS_ORIGINS`: comma-separated HTTPS origins; do not use `*` in production.

### Admin

- `TAVIRA_API_URL`: public HTTPS origin of the deployed API.
- `SUPABASE_URL`: the same Supabase project URL used by the API.
- `SUPABASE_ANON_KEY`: Supabase publishable key. Do not use the secret/service
  role key in this service.

## Release verification

After each first-time or schema-changing deployment:

1. Check the API health endpoint.
2. Sign in as a neutral moderator test user.
3. Confirm the moderation queue loads.
4. Confirm the audit-export role cannot update a moderation report.
5. Sign out and confirm protected data is no longer displayed.

Rotate test-user passwords before using the environment for demonstrations, and
never use a founder, employee, or unrelated company identity as a test account.

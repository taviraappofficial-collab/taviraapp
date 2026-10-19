import { afterEach, describe, expect, it } from 'vitest';
import { SupabaseWorkforceAuthenticator } from './workforce-auth.js';

describe('SupabaseWorkforceAuthenticator', () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL;
  });

  it('fails closed before token processing when Supabase is not configured', async () => {
    const authenticator = new SupabaseWorkforceAuthenticator();
    await expect(
      authenticator.authorize('Bearer untrusted', 'Tavira.Moderator'),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: 'WORKFORCE_AUTH_UNAVAILABLE' },
    });
  });

  it('requires a bearer token when configuration is present', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    const authenticator = new SupabaseWorkforceAuthenticator();
    await expect(
      authenticator.authorize(undefined, 'Tavira.Moderator'),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: 'WORKFORCE_AUTH_REQUIRED' },
    });
  });
});

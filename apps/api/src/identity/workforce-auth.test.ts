import { afterEach, describe, expect, it } from 'vitest';
import { EntraWorkforceAuthenticator } from './workforce-auth.js';

describe('EntraWorkforceAuthenticator', () => {
  afterEach(() => {
    delete process.env.ENTRA_TENANT_ID;
    delete process.env.ENTRA_API_CLIENT_ID;
    delete process.env.ENTRA_ADMIN_CLIENT_ID;
  });

  it('fails closed before token processing when Entra is not configured', async () => {
    const authenticator = new EntraWorkforceAuthenticator();
    await expect(
      authenticator.authorize('Bearer untrusted', 'Tavira.Moderator'),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: 'WORKFORCE_AUTH_UNAVAILABLE' },
    });
  });

  it('requires a bearer token when configuration is present', async () => {
    process.env.ENTRA_TENANT_ID = '05c16d30-e55d-4f36-80b8-216b515b7c14';
    process.env.ENTRA_API_CLIENT_ID = '41660573-77ef-49bf-a0e6-fef8818c1a04';
    process.env.ENTRA_ADMIN_CLIENT_ID = 'f8b4e742-b4c9-4295-af61-9264a4b0aa99';
    const authenticator = new EntraWorkforceAuthenticator();
    await expect(
      authenticator.authorize(undefined, 'Tavira.Moderator'),
    ).rejects.toMatchObject({
      status: 401,
      response: { code: 'WORKFORCE_AUTH_REQUIRED' },
    });
  });
});

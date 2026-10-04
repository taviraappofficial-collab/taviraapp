import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GET } from './route';

describe('workforce login route', () => {
  beforeEach(() => {
    process.env.ENTRA_TENANT_ID = '05c16d30-e55d-4f36-80b8-216b515b7c14';
    process.env.ENTRA_ADMIN_CLIENT_ID = 'f8b4e742-b4c9-4295-af61-9264a4b0aa99';
    process.env.ENTRA_ADMIN_CLIENT_SECRET = 'test-secret-never-sent-to-browser';
    process.env.ENTRA_ADMIN_REDIRECT_URI =
      'http://localhost:3002/auth/callback';
    process.env.ENTRA_API_SCOPE = 'api://api-client-id/.default';
  });

  afterEach(() => {
    delete process.env.ENTRA_TENANT_ID;
    delete process.env.ENTRA_ADMIN_CLIENT_ID;
    delete process.env.ENTRA_ADMIN_CLIENT_SECRET;
    delete process.env.ENTRA_ADMIN_REDIRECT_URI;
    delete process.env.ENTRA_API_SCOPE;
  });

  it('redirects with PKCE and sets protected transient cookies', () => {
    const response = GET();
    const location = new URL(response.headers.get('location') ?? '');
    const cookies = response.headers.getSetCookie().join(';');
    expect(location.hostname).toBe('login.microsoftonline.com');
    expect(location.searchParams.get('code_challenge_method')).toBe('S256');
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(location.toString()).not.toContain(
      process.env.ENTRA_ADMIN_CLIENT_SECRET!,
    );
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('SameSite=lax');
  });
});

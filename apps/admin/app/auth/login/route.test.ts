import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';

describe('workforce login route', () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    vi.unstubAllGlobals();
  });

  it('redirects GET requests to the local sign-in form', () => {
    const request = new NextRequest('http://localhost:3002/auth/login');
    const response = GET(request);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3002/auth/sign-in',
    );
  });

  it('sets protected session cookies after Supabase authentication', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'public-anon-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          access_token: 'signed-access-token',
          refresh_token: 'opaque-refresh-token',
          expires_in: 3600,
        }),
      ),
    );
    const request = new NextRequest('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: 'admin@example.com',
        password: 'not-a-real-password',
      }),
    });
    const response = await POST(request);
    const cookies = response.headers.getSetCookie().join(';');
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('http://localhost:3002/');
    expect(cookies).toContain('tavira_admin_access=signed-access-token');
    expect(cookies).toContain('tavira_admin_refresh=opaque-refresh-token');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('SameSite=lax');
  });
});

import { describe, expect, it, vi } from 'vitest';
import {
  createIdentityApi,
  IdentityApiError,
  identityErrorMessage,
  type IdentityFetch,
} from './identity-api';

describe('mobile identity API', () => {
  it('maps login to the versioned API contract', async () => {
    const fetcher = vi.fn<IdentityFetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'a'.repeat(32),
          accessTokenExpiresAt: '2026-09-29T12:00:00.000Z',
          refreshToken: 'r'.repeat(48),
          refreshTokenExpiresAt: '2026-10-29T12:00:00.000Z',
          sessionId: '01990b8a-2c18-7000-8000-000000000001',
        }),
        { status: 200 },
      ),
    );
    const api = createIdentityApi('https://api.example.test', fetcher);
    await api.login({
      contact: 'ada@example.com',
      password: 'correct horse battery staple',
      deviceName: 'ios device',
    });
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example.test/v1/identity/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('adds bearer authentication to session requests', async () => {
    const fetcher = vi
      .fn<IdentityFetch>()
      .mockResolvedValue(new Response(JSON.stringify({ sessions: [] })));
    const api = createIdentityApi('https://api.example.test', fetcher);
    await api.listSessions('access-token');
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.example.test/v1/identity/sessions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }) as Record<string, string>,
      }),
    );
  });

  it('turns API error codes into safe user messages', async () => {
    const fetcher = vi.fn<IdentityFetch>().mockResolvedValue(
      new Response(JSON.stringify({ code: 'INVALID_CREDENTIALS' }), {
        status: 401,
      }),
    );
    const api = createIdentityApi('https://api.example.test', fetcher);
    const error = await api
      .login({ contact: 'a@b.co', password: 'wrong', deviceName: 'web' })
      .catch((failure: unknown) => failure);
    expect(error).toBeInstanceOf(IdentityApiError);
    expect(identityErrorMessage(error)).toBe(
      'The contact or password is incorrect.',
    );
  });
});

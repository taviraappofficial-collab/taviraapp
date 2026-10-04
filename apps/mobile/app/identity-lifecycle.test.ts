import { describe, expect, it, vi } from 'vitest';
import type { SessionTokens } from '@tavira/contracts';
import { createIdentityApi, type IdentityFetch } from './identity-api';
import {
  createSessionVault,
  type SessionStorage,
} from './identity-session-vault';

const initialSession: SessionTokens = {
  accessToken: 'initial-access-token',
  accessTokenExpiresAt: '2026-10-03T12:15:00.000Z',
  refreshToken: 'initial-refresh-token',
  refreshTokenExpiresAt: '2026-11-02T12:00:00.000Z',
  sessionId: '0199a50e-1000-7000-8000-000000000001',
};

const rotatedSession: SessionTokens = {
  ...initialSession,
  accessToken: 'rotated-access-token',
  refreshToken: 'rotated-refresh-token',
  sessionId: '0199a50e-2000-7000-8000-000000000002',
};

describe('mobile identity lifecycle', () => {
  it('persists login, replaces rotated tokens, and clears logout', async () => {
    let stored: string | null = null;
    const storage: SessionStorage = {
      get: () => Promise.resolve(stored),
      set: (value) => {
        stored = value;
        return Promise.resolve();
      },
      remove: () => {
        stored = null;
        return Promise.resolve();
      },
    };
    const fetcher = vi.fn<IdentityFetch>((input, init) => {
      if (input.endsWith('/login'))
        return Promise.resolve(new Response(JSON.stringify(initialSession)));
      if (input.endsWith('/refresh')) {
        expect(init?.body).toBe(
          JSON.stringify({ refreshToken: initialSession.refreshToken }),
        );
        return Promise.resolve(new Response(JSON.stringify(rotatedSession)));
      }
      expect(input).toMatch(/\/logout-all$/);
      expect(init?.headers).toMatchObject({
        Authorization: `Bearer ${rotatedSession.accessToken}`,
      });
      return Promise.resolve(
        new Response(JSON.stringify({ revokedSessions: 1 })),
      );
    });
    const api = createIdentityApi('https://api.example.test', fetcher);
    const vault = createSessionVault(storage);

    const loggedIn = await api.login({
      contact: 'member@example.com',
      password: 'correct horse battery staple',
      deviceName: 'android device',
    });
    await vault.save(loggedIn);
    await expect(vault.load()).resolves.toEqual(initialSession);

    const rotated = await api.refresh(loggedIn.refreshToken);
    await vault.save(rotated);
    await expect(vault.load()).resolves.toEqual(rotatedSession);

    await api.logoutAll(rotated.accessToken);
    await vault.clear();
    await expect(vault.load()).resolves.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});

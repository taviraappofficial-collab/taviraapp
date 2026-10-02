import { describe, expect, it } from 'vitest';
import type { SessionTokens } from '@tavira/contracts';
import {
  createSessionVault,
  type SessionStorage,
} from './identity-session-vault';

const session: SessionTokens = {
  accessToken: 'a'.repeat(32),
  accessTokenExpiresAt: '2026-09-29T12:00:00.000Z',
  refreshToken: 'r'.repeat(48),
  refreshTokenExpiresAt: '2026-10-29T12:00:00.000Z',
  sessionId: '01990b8a-2c18-7000-8000-000000000001',
};

function memoryStorage(): SessionStorage {
  let value: string | null = null;
  return {
    get: () => Promise.resolve(value),
    set: (next) => {
      value = next;
      return Promise.resolve();
    },
    remove: () => {
      value = null;
      return Promise.resolve();
    },
  };
}

describe('mobile identity session vault', () => {
  it('round-trips and clears session tokens', async () => {
    const vault = createSessionVault(memoryStorage());
    await vault.save(session);
    await expect(vault.load()).resolves.toEqual(session);
    await vault.clear();
    await expect(vault.load()).resolves.toBeNull();
  });

  it('removes corrupted session payloads', async () => {
    const storage = memoryStorage();
    await storage.set('{invalid');
    const vault = createSessionVault(storage);
    await expect(vault.load()).resolves.toBeNull();
    await expect(storage.get()).resolves.toBeNull();
  });
});

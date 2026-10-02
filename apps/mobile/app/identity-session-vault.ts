import type { SessionTokens } from '@tavira/contracts';

export interface SessionStorage {
  get(): Promise<string | null>;
  set(value: string): Promise<void>;
  remove(): Promise<void>;
}

export function createSessionVault(storage: SessionStorage) {
  return {
    async load(): Promise<SessionTokens | null> {
      const value = await storage.get();
      if (!value) return null;
      try {
        return JSON.parse(value) as SessionTokens;
      } catch {
        await storage.remove();
        return null;
      }
    },
    save(session: SessionTokens): Promise<void> {
      return storage.set(JSON.stringify(session));
    },
    clear(): Promise<void> {
      return storage.remove();
    },
  };
}

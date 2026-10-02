import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SessionTokens } from '@tavira/contracts';
import { sessionVault } from './identity-session';

type IdentitySessionContextValue = {
  ready: boolean;
  session: SessionTokens | null;
  saveSession(session: SessionTokens): Promise<void>;
  clearSession(): Promise<void>;
};

const IdentitySessionContext =
  createContext<IdentitySessionContextValue | null>(null);

export function IdentitySessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<SessionTokens | null>(null);
  useEffect(() => {
    void sessionVault
      .load()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setReady(true));
  }, []);
  const saveSession = useCallback(async (next: SessionTokens) => {
    await sessionVault.save(next);
    setSession(next);
  }, []);
  const clearSession = useCallback(async () => {
    await sessionVault.clear();
    setSession(null);
  }, []);
  const value = useMemo(
    () => ({ ready, session, saveSession, clearSession }),
    [ready, session, saveSession, clearSession],
  );
  return (
    <IdentitySessionContext.Provider value={value}>
      {children}
    </IdentitySessionContext.Provider>
  );
}

export function useIdentitySession(): IdentitySessionContextValue {
  const value = useContext(IdentitySessionContext);
  if (!value) throw new Error('IDENTITY_SESSION_PROVIDER_MISSING');
  return value;
}

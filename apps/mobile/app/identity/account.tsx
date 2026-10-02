import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Toast } from '@tavira/ui';
import {
  IdentityScaffold,
  InlineLink,
  SessionRow,
  identityStyles,
} from './components';
import { removeSession, type DeviceSessionView } from '../identity-model';
import { identityApi, identityErrorMessage } from '../identity-api';
import { useIdentitySession } from '../identity-context';

export default function AccountScreen() {
  const [sessions, setSessions] = useState<DeviceSessionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState<string>();
  const identitySession = useIdentitySession();
  const { ready, session } = identitySession;
  const loadSessions = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const result = await identityApi.listSessions(session.accessToken);
      setSessions(
        result.sessions.map((item) => ({
          sessionId: item.sessionId,
          deviceName: item.deviceName,
          createdAtLabel: item.current
            ? 'Active now'
            : new Date(item.createdAt).toLocaleDateString(),
          current: item.current,
        })),
      );
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace('/identity/login' as never);
      return;
    }
    void loadSessions();
  }, [ready, session, loadSessions]);

  const revoke = async (sessionId: string) => {
    if (!session) return;
    try {
      await identityApi.revokeSession(session.accessToken, sessionId);
      setSessions((current) => removeSession(current, sessionId));
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    }
  };

  const logoutAll = async () => {
    if (!session) return;
    try {
      await identityApi.logoutAll(session.accessToken);
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    }
    try {
      await identitySession.clearSession();
      router.replace('/identity/login' as never);
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    }
  };
  return (
    <IdentityScaffold
      eyebrow="ACCOUNT & SECURITY"
      title="Your account"
      description="Review privacy and devices with access to your TAVIRA account."
    >
      <View style={identityStyles.fieldStack}>
        <Text style={identityStyles.sectionTitle}>Privacy</Text>
        <Text style={identityStyles.helper}>
          Your profile is public and discoverable.
        </Text>
        <InlineLink href="/identity/privacy" label="Manage privacy settings" />
      </View>
      <View style={identityStyles.fieldStack}>
        <Text style={identityStyles.sectionTitle}>Signed-in devices</Text>
        {loading ? (
          <Text style={identityStyles.helper}>Loading devices…</Text>
        ) : null}
        {sessions.map((session) => (
          <SessionRow
            key={session.sessionId}
            session={session}
            onRemove={() => void revoke(session.sessionId)}
          />
        ))}
      </View>
      {requestError ? <Toast tone="error" message={requestError} /> : null}
      <Button label="Sign out all devices" onPress={() => void logoutAll()} />
    </IdentityScaffold>
  );
}

import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@tavira/ui';
import {
  IdentityScaffold,
  InlineLink,
  SessionRow,
  identityStyles,
} from './components';
import { removeSession, type DeviceSessionView } from '../identity-model';

const initialSessions: DeviceSessionView[] = [
  {
    sessionId: 'current-phone',
    deviceName: 'Android phone',
    createdAtLabel: 'Active now',
    current: true,
  },
  {
    sessionId: 'tablet',
    deviceName: 'Chrome on Windows',
    createdAtLabel: 'Signed in yesterday',
    current: false,
  },
];

export default function AccountScreen() {
  const [sessions, setSessions] = useState(initialSessions);
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
        {sessions.map((session) => (
          <SessionRow
            key={session.sessionId}
            session={session}
            onRemove={() =>
              setSessions((current) =>
                removeSession(current, session.sessionId),
              )
            }
          />
        ))}
      </View>
      <Button
        label="Sign out all other devices"
        onPress={() =>
          setSessions((current) => current.filter((session) => session.current))
        }
      />
      <InlineLink href="/identity/login" label="Sign out of this device" />
    </IdentityScaffold>
  );
}

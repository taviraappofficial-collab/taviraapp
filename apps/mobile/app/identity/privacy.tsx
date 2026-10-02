import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Button, Chip, Toast, tokens } from '@tavira/ui';
import {
  IdentityScaffold,
  InlineLink,
  SettingRow,
  identityStyles,
} from './components';
import { identityApi, identityErrorMessage } from '../identity-api';
import { useIdentitySession } from '../identity-context';

export default function PrivacyScreen() {
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [discoverable, setDiscoverable] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState<string>();
  const { session } = useIdentitySession();
  const save = async () => {
    if (!session) {
      setRequestError('Sign in to update privacy settings.');
      return;
    }
    setSaving(true);
    setRequestError(undefined);
    try {
      await identityApi.updatePrivacy(session.accessToken, {
        profileVisibility: visibility,
        discoverable,
      });
      setSaved(true);
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  return (
    <IdentityScaffold
      eyebrow="PRIVACY"
      title="Control how people find you"
      description="These choices do not affect creator, badge, or seller verification status."
    >
      <View style={identityStyles.fieldStack}>
        <Text style={identityStyles.sectionTitle}>Profile visibility</Text>
        <View style={identityStyles.splitRow}>
          <Chip
            label="Public"
            selected={visibility === 'public'}
            onPress={() => setVisibility('public')}
          />
          <Chip
            label="Private"
            selected={visibility === 'private'}
            onPress={() => setVisibility('private')}
          />
        </View>
        <SettingRow
          title="Discoverable profile"
          description="Allow people to find your profile by username."
          control={
            <Switch
              accessibilityLabel="Discoverable profile"
              value={discoverable}
              onValueChange={setDiscoverable}
              trackColor={{ true: tokens.color.accent }}
            />
          }
        />
      </View>
      {requestError ? <Toast tone="error" message={requestError} /> : null}
      <Button
        label={saved ? 'Preferences saved' : 'Save privacy settings'}
        loading={saving}
        onPress={() => void save()}
      />
      <InlineLink href="/identity/account" label="Back to account" />
    </IdentityScaffold>
  );
}

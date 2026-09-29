import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Button, Chip, tokens } from '@tavira/ui';
import {
  IdentityScaffold,
  InlineLink,
  SettingRow,
  identityStyles,
} from './components';

export default function PrivacyScreen() {
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [discoverable, setDiscoverable] = useState(true);
  const [saved, setSaved] = useState(false);
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
      <Button
        label={saved ? 'Preferences saved' : 'Save privacy settings'}
        onPress={() => setSaved(true)}
      />
      <InlineLink href="/identity/account" label="Back to account" />
    </IdentityScaffold>
  );
}

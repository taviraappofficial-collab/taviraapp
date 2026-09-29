import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from '@tavira/ui';
import { IdentityScaffold, InlineLink, identityStyles } from './components';

export default function LoginScreen() {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const disabled = !contact.trim() || !password;
  return (
    <IdentityScaffold
      eyebrow="WELCOME BACK"
      title="Sign in securely"
      description="Continue to your TAVIRA profile, conversations, and communities."
    >
      <View style={identityStyles.fieldStack}>
        <TextInput
          label="Email or phone"
          autoCapitalize="none"
          autoComplete="email"
          value={contact}
          onChangeText={setContact}
        />
        <TextInput
          label="Password"
          secureTextEntry
          autoComplete="current-password"
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <Button
        label="Sign in"
        disabled={disabled}
        onPress={() => router.replace('/identity/account' as never)}
      />
      <InlineLink href="/identity/register" label="Create a new account" />
    </IdentityScaffold>
  );
}

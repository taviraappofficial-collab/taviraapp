import { useState } from 'react';
import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput, Toast } from '@tavira/ui';
import { IdentityScaffold, InlineLink, identityStyles } from './components';
import { identityApi, identityErrorMessage } from '../identity-api';
import { useIdentitySession } from '../identity-context';

export default function LoginScreen() {
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string>();
  const identitySession = useIdentitySession();
  const disabled = !contact.trim() || !password;
  const submit = async () => {
    setSubmitting(true);
    setRequestError(undefined);
    try {
      const session = await identityApi.login({
        contact,
        password,
        deviceName: `${Platform.OS} device`,
      });
      await identitySession.saveSession(session);
      router.replace('/identity/account' as never);
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };
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
        loading={submitting}
        onPress={() => void submit()}
      />
      {requestError ? <Toast tone="error" message={requestError} /> : null}
      <InlineLink href="/identity/register" label="Create a new account" />
    </IdentityScaffold>
  );
}

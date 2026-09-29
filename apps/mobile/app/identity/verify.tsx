import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from '@tavira/ui';
import { IdentityScaffold, InlineLink, identityStyles } from './components';
import { validateVerificationCode } from '../identity-model';

export default function VerifyScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const submit = () => {
    const nextError = validateVerificationCode(code);
    setError(nextError);
    if (!nextError) router.replace('/identity/account' as never);
  };

  return (
    <IdentityScaffold
      eyebrow="VERIFY YOUR CONTACT"
      title="Check your inbox"
      description="Enter the one-time code sent to your contact. It expires in 10 minutes."
    >
      <View style={identityStyles.center}>
        <Text style={identityStyles.codeHint}>Six-digit verification code</Text>
      </View>
      <TextInput
        label="Verification code"
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        value={code}
        error={error}
        onChangeText={(value) => {
          setCode(value.replace(/\D/g, ''));
          setError(undefined);
        }}
      />
      <Button label="Verify and continue" onPress={submit} />
      <Text style={identityStyles.helper}>
        For your safety, TAVIRA support will never ask you to share this code.
      </Text>
      <InlineLink href="/identity/register" label="Use a different contact" />
    </IdentityScaffold>
  );
}

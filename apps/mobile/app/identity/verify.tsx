import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, TextInput, Toast } from '@tavira/ui';
import { IdentityScaffold, InlineLink, identityStyles } from './components';
import { validateVerificationCode } from '../identity-model';
import { identityApi, identityErrorMessage } from '../identity-api';

export default function VerifyScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [requestError, setRequestError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const params = useLocalSearchParams<{
    challengeId?: string;
    contact?: string;
  }>();
  const submit = async () => {
    const nextError = validateVerificationCode(code);
    setError(nextError);
    if (nextError) return;
    if (!params.challengeId) {
      setRequestError('Start registration again to request a new code.');
      return;
    }
    setSubmitting(true);
    setRequestError(undefined);
    try {
      await identityApi.verifyContact({
        challengeId: params.challengeId,
        code,
      });
      router.replace('/identity/login' as never);
    } catch (requestFailure: unknown) {
      setRequestError(identityErrorMessage(requestFailure));
    } finally {
      setSubmitting(false);
    }
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
      {requestError ? <Toast tone="error" message={requestError} /> : null}
      <Button
        label="Verify and continue"
        loading={submitting}
        onPress={() => void submit()}
      />
      <Text style={identityStyles.helper}>
        For your safety, TAVIRA support will never ask you to share this code.
      </Text>
      <InlineLink href="/identity/register" label="Use a different contact" />
    </IdentityScaffold>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput, Toast } from '@tavira/ui';
import { IdentityScaffold, InlineLink, identityStyles } from './components';
import {
  validateRegistration,
  type RegistrationDraft,
} from '../identity-model';
import { identityApi, identityErrorMessage } from '../identity-api';

const initialDraft: RegistrationDraft = {
  contact: '',
  displayName: '',
  handle: '',
  password: '',
};

export default function RegisterScreen() {
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState(validateRegistration(initialDraft));
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string>();
  const update = (field: keyof RegistrationDraft, value: string) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async () => {
    const nextErrors = validateRegistration(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    setRequestError(undefined);
    try {
      const result = await identityApi.register({
        contactType: 'email',
        contact: draft.contact,
        password: draft.password,
        displayName: draft.displayName,
        handle: draft.handle,
      });
      router.push({
        pathname: '/identity/verify',
        params: {
          challengeId: result.verificationChallengeId,
          contact: draft.contact,
        },
      } as never);
    } catch (error: unknown) {
      setRequestError(identityErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IdentityScaffold
      eyebrow="CREATE YOUR ACCOUNT"
      title="Welcome to TAVIRA"
      description="Join conversations, creators, communities, and trusted commerce in one place."
    >
      <View style={identityStyles.fieldStack}>
        <TextInput
          label="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={draft.contact}
          error={errors.contact}
          onChangeText={(value) => update('contact', value)}
        />
        <TextInput
          label="Display name"
          autoComplete="name"
          value={draft.displayName}
          error={errors.displayName}
          onChangeText={(value) => update('displayName', value)}
        />
        <TextInput
          label="Username"
          autoCapitalize="none"
          value={draft.handle}
          error={errors.handle}
          onChangeText={(value) => update('handle', value)}
        />
        <TextInput
          label="Password"
          secureTextEntry
          autoComplete="new-password"
          value={draft.password}
          error={errors.password}
          onChangeText={(value) => update('password', value)}
        />
      </View>
      {requestError ? <Toast tone="error" message={requestError} /> : null}
      <Button
        label="Create account"
        loading={submitting}
        onPress={() => void submit()}
      />
      <InlineLink href="/identity/login" label="Already registered? Sign in" />
    </IdentityScaffold>
  );
}

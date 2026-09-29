export type RegistrationDraft = {
  contact: string;
  displayName: string;
  handle: string;
  password: string;
};

export type IdentityFieldErrors = Partial<
  Record<keyof RegistrationDraft | 'code', string>
>;

export type DeviceSessionView = {
  sessionId: string;
  deviceName: string;
  createdAtLabel: string;
  current: boolean;
};

export function validateRegistration(
  draft: RegistrationDraft,
): IdentityFieldErrors {
  const errors: IdentityFieldErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(draft.contact.trim()))
    errors.contact = 'Enter a valid email address.';
  if (draft.displayName.trim().length < 2)
    errors.displayName = 'Use at least 2 characters.';
  if (!/^[a-z0-9_]{3,30}$/.test(draft.handle.trim().toLowerCase()))
    errors.handle = 'Use 3–30 letters, numbers, or underscores.';
  if (draft.password.length < 12)
    errors.password = 'Use at least 12 characters.';
  return errors;
}

export function validateVerificationCode(code: string): string | undefined {
  return /^\d{6}$/.test(code) ? undefined : 'Enter the 6-digit code.';
}

export function removeSession(
  sessions: readonly DeviceSessionView[],
  sessionId: string,
): DeviceSessionView[] {
  return sessions.filter((session) => session.sessionId !== sessionId);
}

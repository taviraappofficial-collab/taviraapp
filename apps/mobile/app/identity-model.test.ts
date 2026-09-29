import { describe, expect, it } from 'vitest';
import {
  removeSession,
  validateRegistration,
  validateVerificationCode,
} from './identity-model';

describe('mobile identity model', () => {
  it('validates registration fields without accepting weak credentials', () => {
    expect(
      validateRegistration({
        contact: 'invalid',
        displayName: 'A',
        handle: 'No spaces',
        password: 'short',
      }),
    ).toEqual({
      contact: 'Enter a valid email address.',
      displayName: 'Use at least 2 characters.',
      handle: 'Use 3–30 letters, numbers, or underscores.',
      password: 'Use at least 12 characters.',
    });
  });

  it('accepts the registration shape used by the API', () => {
    expect(
      validateRegistration({
        contact: 'ada@example.com',
        displayName: 'Ada Okafor',
        handle: 'ada_okafor',
        password: 'correct horse battery staple',
      }),
    ).toEqual({});
  });

  it('requires exactly six verification digits', () => {
    expect(validateVerificationCode('123456')).toBeUndefined();
    expect(validateVerificationCode('12345a')).toBe('Enter the 6-digit code.');
  });

  it('removes only the selected device session', () => {
    const sessions = [
      {
        sessionId: 'one',
        deviceName: 'Phone',
        createdAtLabel: 'Now',
        current: true,
      },
      {
        sessionId: 'two',
        deviceName: 'Tablet',
        createdAtLabel: 'Yesterday',
        current: false,
      },
    ];
    expect(removeSession(sessions, 'two')).toEqual([sessions[0]]);
  });
});

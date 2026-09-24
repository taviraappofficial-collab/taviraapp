import { describe, expect, it } from 'vitest';
import { IdentityError, IdentityService } from './identity.service.js';

class CapturingDelivery {
  latestCode = '';
  send(_contact: string, code: string): void {
    this.latestCode = code;
  }
}

const registration = {
  contactType: 'email' as const,
  contact: 'Ada@example.com',
  password: 'correct horse battery staple',
  displayName: 'Ada Okafor',
  handle: 'ada_okafor',
};

function setup(): { service: IdentityService; delivery: CapturingDelivery } {
  const delivery = new CapturingDelivery();
  return { service: new IdentityService(delivery), delivery };
}

describe('IdentityService', () => {
  it('keeps contact, creator, badge, and seller verification states separate', () => {
    const { service, delivery } = setup();
    const result = service.register(registration);
    expect(() =>
      service.login({
        contact: registration.contact,
        password: registration.password,
        deviceName: 'Test phone',
      }),
    ).toThrowError(new IdentityError('ACCOUNT_NOT_ACTIVE'));

    const profile = service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    expect(profile).toMatchObject({
      creatorStatus: 'not_applied',
      verificationBadgeStatus: 'not_applied',
      sellerStatus: 'not_applied',
    });
  });

  it('normalizes contacts and rejects duplicate registrations', () => {
    const { service } = setup();
    service.register(registration);
    expect(() =>
      service.register({
        ...registration,
        contact: ' ada@EXAMPLE.com ',
        handle: 'another_handle',
      }),
    ).toThrowError(new IdentityError('CONTACT_ALREADY_REGISTERED'));
  });

  it('rejects an incorrect verification code', () => {
    const { service } = setup();
    const result = service.register(registration);
    expect(() =>
      service.verifyContact({
        challengeId: result.verificationChallengeId,
        code: '000000',
      }),
    ).toThrowError(new IdentityError('VERIFICATION_CODE_INVALID'));
  });

  it('rotates refresh tokens and rejects reuse', () => {
    const { service, delivery } = setup();
    const result = service.register(registration);
    service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const first = service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Test phone',
    });
    const rotated = service.refresh(first.refreshToken);
    expect(rotated.refreshToken).not.toBe(first.refreshToken);
    expect(() => service.refresh(first.refreshToken)).toThrowError(
      new IdentityError('REFRESH_TOKEN_INVALID'),
    );
  });

  it('revokes every active device session', () => {
    const { service, delivery } = setup();
    const result = service.register(registration);
    service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const first = service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Phone',
    });
    service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Tablet',
    });
    expect(service.logoutAll(result.accountId)).toBe(2);
    expect(() => service.refresh(first.refreshToken)).toThrowError(
      new IdentityError('REFRESH_TOKEN_INVALID'),
    );
  });
});

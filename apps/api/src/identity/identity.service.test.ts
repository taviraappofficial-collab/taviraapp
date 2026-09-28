import { describe, expect, it } from 'vitest';
import { MemoryIdentityRepository } from './identity.repository.js';
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
  return {
    service: new IdentityService(delivery, new MemoryIdentityRepository()),
    delivery,
  };
}

describe('IdentityService', () => {
  it('keeps contact, creator, badge, and seller verification states separate', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await expect(
      service.login({
        contact: registration.contact,
        password: registration.password,
        deviceName: 'Test phone',
      }),
    ).rejects.toThrowError(new IdentityError('ACCOUNT_NOT_ACTIVE'));
    const profile = await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    expect(profile).toMatchObject({
      creatorStatus: 'not_applied',
      verificationBadgeStatus: 'not_applied',
      sellerStatus: 'not_applied',
    });
  });

  it('normalizes contacts and rejects duplicate registrations', async () => {
    const { service } = setup();
    await service.register(registration);
    await expect(
      service.register({
        ...registration,
        contact: ' ada@EXAMPLE.com ',
        handle: 'another_handle',
      }),
    ).rejects.toThrowError(new IdentityError('CONTACT_ALREADY_REGISTERED'));
  });

  it('rejects an incorrect verification code', async () => {
    const { service } = setup();
    const result = await service.register(registration);
    await expect(
      service.verifyContact({
        challengeId: result.verificationChallengeId,
        code: '000000',
      }),
    ).rejects.toThrowError(new IdentityError('VERIFICATION_CODE_INVALID'));
  });

  it('rotates refresh tokens and rejects reuse', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const first = await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Test phone',
    });
    const rotated = await service.refresh(first.refreshToken);
    expect(rotated.refreshToken).not.toBe(first.refreshToken);
    await expect(service.refresh(first.refreshToken)).rejects.toThrowError(
      new IdentityError('REFRESH_TOKEN_INVALID'),
    );
  });

  it('revokes every active device session', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const first = await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Phone',
    });
    await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Tablet',
    });
    await expect(service.logoutAll(result.accountId)).resolves.toBe(2);
    await expect(service.refresh(first.refreshToken)).rejects.toThrowError(
      new IdentityError('REFRESH_TOKEN_INVALID'),
    );
  });
});

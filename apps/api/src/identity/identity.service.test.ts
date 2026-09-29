import { describe, expect, it } from 'vitest';
import { MemoryIdentityRepository } from './identity.repository.js';
import { IdentityError, IdentityService } from './identity.service.js';

class CapturingDelivery {
  latestCode = '';
  deliveries = 0;
  send(_contact: string, code: string): void {
    this.latestCode = code;
    this.deliveries += 1;
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

  it('authenticates access tokens and lists device sessions', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const phone = await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Phone',
    });
    await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Tablet',
    });

    const listed = await service.listSessions(phone.accessToken);
    expect(listed.sessions).toHaveLength(2);
    expect(listed.sessions).toContainEqual({
      sessionId: phone.sessionId,
      deviceName: 'Phone',
      createdAt: expect.any(String) as string,
      current: true,
    });
    expect(
      listed.sessions.find((session) => session.deviceName === 'Tablet'),
    ).toMatchObject({ current: false });
    await expect(service.listSessions('invalid-token')).rejects.toThrowError(
      new IdentityError('ACCESS_TOKEN_INVALID'),
    );
  });

  it('revokes one owned session without revoking another device', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const phone = await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Phone',
    });
    const tablet = await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Tablet',
    });

    await service.logoutSession(phone.accessToken, tablet.sessionId);
    await expect(service.refresh(tablet.refreshToken)).rejects.toThrowError(
      new IdentityError('REFRESH_TOKEN_INVALID'),
    );
    const listed = await service.listSessions(phone.accessToken);
    expect(listed.sessions).toHaveLength(1);
    expect(listed.sessions[0]?.sessionId).toBe(phone.sessionId);
  });

  it('resets a password and revokes every existing session', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const session = await service.login({
      contact: registration.contact,
      password: registration.password,
      deviceName: 'Phone',
    });

    await expect(
      service.requestPasswordReset(registration.contact),
    ).resolves.toEqual({ accepted: true });
    await service.resetPassword({
      contact: registration.contact,
      code: delivery.latestCode,
      newPassword: 'a new correct horse battery staple',
    });

    await expect(service.refresh(session.refreshToken)).rejects.toThrowError(
      new IdentityError('REFRESH_TOKEN_INVALID'),
    );
    await expect(
      service.login({
        contact: registration.contact,
        password: registration.password,
        deviceName: 'Old password',
      }),
    ).rejects.toThrowError(new IdentityError('INVALID_CREDENTIALS'));
    await expect(
      service.login({
        contact: registration.contact,
        password: 'a new correct horse battery staple',
        deviceName: 'New password',
      }),
    ).resolves.toBeDefined();
  });

  it('keeps password-reset requests enumeration-safe and throttles delivery', async () => {
    const { service, delivery } = setup();
    const result = await service.register(registration);
    await service.verifyContact({
      challengeId: result.verificationChallengeId,
      code: delivery.latestCode,
    });
    const initialDeliveries = delivery.deliveries;

    await expect(
      service.requestPasswordReset('unknown@example.com'),
    ).resolves.toEqual({ accepted: true });
    for (let attempt = 0; attempt < 4; attempt += 1)
      await service.requestPasswordReset(registration.contact);

    expect(delivery.deliveries).toBe(initialDeliveries + 3);
  });
});

import type { Server } from 'node:http';
import { Module, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import type {
  DeviceSessionList,
  RegisterAccountResponse,
  SessionTokens,
} from '@tavira/contracts';
import { IdentityController } from './identity.controller.js';
import { MemoryIdentityRepository } from './identity.repository.js';
import { IdentityService } from './identity.service.js';
import type { VerificationDeliveryRequest } from './verification-delivery.js';

class CapturingDelivery {
  latestCode = '';

  send(request: VerificationDeliveryRequest): void {
    this.latestCode = request.code;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T;
  expect(response.ok, JSON.stringify(payload)).toBe(true);
  return payload;
}

describe('identity HTTP lifecycle', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('registers, verifies, rotates, manages devices, and logs out', async () => {
    const delivery = new CapturingDelivery();
    const identity = new IdentityService(
      delivery,
      new MemoryIdentityRepository(),
    );

    @Module({
      controllers: [IdentityController],
      providers: [{ provide: IdentityService, useValue: identity }],
    })
    class LifecycleTestModule {}

    app = await NestFactory.create(LifecycleTestModule, { logger: false });
    await app.listen(0, '127.0.0.1');
    const server = app.getHttpServer() as Server;
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('IDENTITY_TEST_SERVER_ADDRESS_INVALID');
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const request = (path: string, init?: RequestInit): Promise<Response> =>
      fetch(`${baseUrl}${path}`, init);
    const jsonRequest = (method: string, body: unknown): RequestInit => ({
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const authenticated = (
      method: string,
      accessToken: string,
      body?: unknown,
    ): RequestInit => ({
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const registration = await readJson<RegisterAccountResponse>(
      await request(
        '/v1/identity/register',
        jsonRequest('POST', {
          contactType: 'email',
          contact: 'lifecycle@example.com',
          password: 'correct horse battery staple',
          displayName: 'Lifecycle Member',
          handle: 'lifecycle_member',
        }),
      ),
    );
    expect(registration.accountStatus).toBe('pending_verification');

    const pendingLogin = await request(
      '/v1/identity/login',
      jsonRequest('POST', {
        contact: 'lifecycle@example.com',
        password: 'correct horse battery staple',
        deviceName: 'Phone',
      }),
    );
    expect(pendingLogin.status).toBe(400);
    await expect(pendingLogin.json()).resolves.toMatchObject({
      code: 'ACCOUNT_NOT_ACTIVE',
    });

    await readJson(
      await request(
        '/v1/identity/verify-contact',
        jsonRequest('POST', {
          challengeId: registration.verificationChallengeId,
          code: delivery.latestCode,
        }),
      ),
    );

    const phone = await readJson<SessionTokens>(
      await request(
        '/v1/identity/login',
        jsonRequest('POST', {
          contact: 'lifecycle@example.com',
          password: 'correct horse battery staple',
          deviceName: 'Phone',
        }),
      ),
    );
    const tablet = await readJson<SessionTokens>(
      await request(
        '/v1/identity/login',
        jsonRequest('POST', {
          contact: 'lifecycle@example.com',
          password: 'correct horse battery staple',
          deviceName: 'Tablet',
        }),
      ),
    );

    const sessions = await readJson<DeviceSessionList>(
      await request(
        '/v1/identity/sessions',
        authenticated('GET', phone.accessToken),
      ),
    );
    expect(sessions.sessions).toHaveLength(2);

    const rotated = await readJson<SessionTokens>(
      await request(
        '/v1/identity/refresh',
        jsonRequest('POST', { refreshToken: phone.refreshToken }),
      ),
    );
    expect(rotated.refreshToken).not.toBe(phone.refreshToken);

    await readJson(
      await request(
        `/v1/identity/sessions/${tablet.sessionId}`,
        authenticated('DELETE', rotated.accessToken),
      ),
    );
    const remaining = await readJson<DeviceSessionList>(
      await request(
        '/v1/identity/sessions',
        authenticated('GET', rotated.accessToken),
      ),
    );
    expect(remaining.sessions).toHaveLength(1);
    expect(remaining.sessions[0]?.sessionId).toBe(rotated.sessionId);

    await readJson(
      await request(
        '/v1/identity/privacy',
        authenticated('PUT', rotated.accessToken, {
          profileVisibility: 'private',
          discoverable: false,
        }),
      ),
    );
    await expect(
      readJson<{ revokedSessions: number }>(
        await request(
          '/v1/identity/logout-all',
          authenticated('POST', rotated.accessToken),
        ),
      ),
    ).resolves.toEqual({ revokedSessions: 1 });

    const revokedAccess = await request(
      '/v1/identity/sessions',
      authenticated('GET', rotated.accessToken),
    );
    expect(revokedAccess.status).toBe(401);
    await expect(revokedAccess.json()).resolves.toMatchObject({
      code: 'ACCESS_TOKEN_INVALID',
    });
  }, 60_000);
});

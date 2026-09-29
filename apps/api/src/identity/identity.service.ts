import { Injectable } from '@nestjs/common';
import type {
  DeviceSessionList,
  LoginRequest,
  PublicProfile,
  RegisterAccountRequest,
  RegisterAccountResponse,
  SessionTokens,
  VerifyContactRequest,
} from '@tavira/contracts';
import {
  createHash,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import {
  IdentityRepository,
  IdentityRepositoryConflictError,
  type AccountRecord,
  type SessionRecord,
} from './identity.repository.js';

export class IdentityError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

export interface VerificationDelivery {
  send(contact: string, code: string): void;
}

@Injectable()
export class DevelopmentVerificationDelivery implements VerificationDelivery {
  send(contact: string, code: string): void {
    // Provider integration is deliberately deferred; never log the one-time code.
    void code;
    console.info('identity.verification.requested', {
      contact: maskContact(contact),
    });
  }
}

@Injectable()
export class IdentityService {
  constructor(
    private readonly delivery: DevelopmentVerificationDelivery,
    private readonly repository: IdentityRepository,
  ) {}

  async register(
    input: RegisterAccountRequest,
  ): Promise<RegisterAccountResponse> {
    const contact = normalizeContact(input.contact);
    const handle = input.handle.toLowerCase();
    if (await this.repository.findAccountByContact(contact))
      throw new IdentityError('CONTACT_ALREADY_REGISTERED');
    if (await this.repository.findAccountByHandle(handle))
      throw new IdentityError('HANDLE_UNAVAILABLE');

    const accountId = uuidV7();
    const challengeId = uuidV7();
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const account: AccountRecord = {
      id: accountId,
      contactType: input.contactType,
      contact,
      passwordHash: hashPassword(input.password),
      status: 'pending_verification',
      profile: {
        accountId,
        handle,
        displayName: input.displayName.trim(),
        bio: '',
        avatarUrl: null,
        creatorStatus: 'not_applied',
        verificationBadgeStatus: 'not_applied',
        sellerStatus: 'not_applied',
      },
    };
    try {
      await this.repository.createRegistration(account, {
        id: challengeId,
        accountId,
        codeHash: hashToken(code),
        expiresAt: new Date(Date.now() + 10 * 60_000),
        attempts: 0,
        consumedAt: null,
      });
    } catch (error: unknown) {
      if (error instanceof IdentityRepositoryConflictError)
        throw new IdentityError('CONTACT_OR_HANDLE_UNAVAILABLE');
      throw error;
    }
    this.delivery.send(contact, code);
    return {
      accountId,
      verificationChallengeId: challengeId,
      accountStatus: 'pending_verification',
      contactVerificationStatus: 'pending',
    };
  }

  async verifyContact(input: VerifyContactRequest): Promise<PublicProfile> {
    const challenge = await this.repository.findChallenge(input.challengeId);
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() <= Date.now()
    )
      throw new IdentityError('CHALLENGE_INVALID_OR_EXPIRED');
    const attempts = await this.repository.incrementChallengeAttempts(
      challenge.id,
    );
    if (attempts > 5) throw new IdentityError('CHALLENGE_ATTEMPTS_EXCEEDED');
    if (!safeEqual(challenge.codeHash, hashToken(input.code)))
      throw new IdentityError('VERIFICATION_CODE_INVALID');
    const account = await this.repository.findAccountById(challenge.accountId);
    if (!account) throw new IdentityError('ACCOUNT_NOT_FOUND');
    await this.repository.activateAccountAndConsumeChallenge(
      account.id,
      challenge.id,
      new Date(),
    );
    return account.profile;
  }

  async login(input: LoginRequest): Promise<SessionTokens> {
    const account = await this.repository.findAccountByContact(
      normalizeContact(input.contact),
    );
    if (!account || !verifyPassword(input.password, account.passwordHash))
      throw new IdentityError('INVALID_CREDENTIALS');
    if (account.status !== 'active')
      throw new IdentityError('ACCOUNT_NOT_ACTIVE');
    return this.issueSession(account.id, input.deviceName);
  }

  async refresh(refreshToken: string): Promise<SessionTokens> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.repository.findSessionByRefreshHash(tokenHash);
    if (
      !session ||
      session.revokedAt ||
      session.refreshExpiresAt.getTime() <= Date.now()
    )
      throw new IdentityError('REFRESH_TOKEN_INVALID');
    const replacement = createSession(session.accountId, session.deviceName);
    const rotated = await this.repository.rotateSession(
      session.id,
      replacement.record,
      new Date(),
    );
    if (!rotated) throw new IdentityError('REFRESH_TOKEN_INVALID');
    return replacement.tokens;
  }

  async listSessions(accessToken: string): Promise<DeviceSessionList> {
    const current = await this.authenticate(accessToken);
    const sessions = await this.repository.listSessions(current.accountId);
    return {
      sessions: sessions.map((session) => ({
        sessionId: session.id,
        deviceName: session.deviceName,
        createdAt: session.createdAt.toISOString(),
        current: session.id === current.id,
      })),
    };
  }

  async logoutSession(accessToken: string, sessionId: string): Promise<void> {
    const current = await this.authenticate(accessToken);
    const revoked = await this.repository.revokeSession(
      current.accountId,
      sessionId,
      new Date(),
    );
    if (!revoked) throw new IdentityError('SESSION_NOT_FOUND');
  }

  async logoutAllAuthenticated(accessToken: string): Promise<number> {
    const current = await this.authenticate(accessToken);
    return this.logoutAll(current.accountId);
  }

  logoutAll(accountId: string): Promise<number> {
    return this.repository.revokeAllSessions(accountId, new Date());
  }

  async getProfile(handle: string): Promise<PublicProfile> {
    const account = await this.repository.findAccountByHandle(
      handle.toLowerCase(),
    );
    if (!account) throw new IdentityError('PROFILE_NOT_FOUND');
    return account.profile;
  }

  private async issueSession(
    accountId: string,
    deviceName: string,
  ): Promise<SessionTokens> {
    const session = createSession(accountId, deviceName);
    await this.repository.createSession(session.record);
    return session.tokens;
  }

  private async authenticate(accessToken: string): Promise<SessionRecord> {
    const session = await this.repository.findSessionByAccessHash(
      hashToken(accessToken),
    );
    if (
      !session ||
      session.revokedAt ||
      !session.accessExpiresAt ||
      session.accessExpiresAt.getTime() <= Date.now()
    )
      throw new IdentityError('ACCESS_TOKEN_INVALID');
    const account = await this.repository.findAccountById(session.accountId);
    if (!account || account.status !== 'active')
      throw new IdentityError('ACCESS_TOKEN_INVALID');
    return session;
  }
}

function createSession(
  accountId: string,
  deviceName: string,
): { record: SessionRecord; tokens: SessionTokens } {
  const now = Date.now();
  const accessToken = randomBytes(32).toString('base64url');
  const refreshToken = randomBytes(48).toString('base64url');
  const sessionId = uuidV7();
  const accessTokenExpiresAt = new Date(now + 15 * 60_000);
  const refreshTokenExpiresAt = new Date(now + 30 * 24 * 60 * 60_000);
  return {
    record: {
      id: sessionId,
      accountId,
      deviceName,
      accessTokenHash: hashToken(accessToken),
      accessExpiresAt: accessTokenExpiresAt,
      refreshTokenHash: hashToken(refreshToken),
      refreshExpiresAt: refreshTokenExpiresAt,
      revokedAt: null,
      createdAt: new Date(now),
    },
    tokens: {
      accessToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      sessionId,
    },
  };
}

function normalizeContact(contact: string): string {
  return contact.trim().toLowerCase();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, 64);
  return `${salt.toString('base64url')}.${digest.toString('base64url')}`;
}

function verifyPassword(password: string, encoded: string): boolean {
  const [saltText, digestText] = encoded.split('.');
  if (!saltText || !digestText) return false;
  const expected = Buffer.from(digestText, 'base64url');
  const actual = scryptSync(
    password,
    Buffer.from(saltText, 'base64url'),
    expected.length,
  );
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function maskContact(contact: string): string {
  const visible = contact.slice(-3);
  return `${'*'.repeat(Math.max(3, contact.length - 3))}${visible}`;
}

function uuidV7(): string {
  const bytes = randomBytes(16);
  const timestamp = BigInt(Date.now());
  for (let index = 0; index < 6; index += 1) {
    bytes[5 - index] = Number((timestamp >> BigInt(index * 8)) & 0xffn);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

import { Inject, Injectable } from '@nestjs/common';
import type {
  DeviceSessionList,
  LoginRequest,
  PublicProfile,
  ReportAccountRequest,
  RegisterAccountRequest,
  RegisterAccountResponse,
  ResetPassword,
  SafetyReportResponse,
  SessionTokens,
  UpdatePrivacyRequest,
  UpdateProfileRequest,
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
import {
  canDeliverVerification,
  VerificationDelivery,
} from './verification-delivery.js';

export class IdentityError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

@Injectable()
export class IdentityService {
  constructor(
    @Inject(VerificationDelivery)
    private readonly delivery: VerificationDelivery,
    @Inject(IdentityRepository)
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
        profileVisibility: 'public',
        discoverable: true,
        creatorStatus: 'not_applied',
        verificationBadgeStatus: 'not_applied',
        sellerStatus: 'not_applied',
      },
    };
    const createdAt = new Date();
    try {
      await this.repository.createRegistration(account, {
        id: challengeId,
        accountId,
        purpose: 'contact_verification',
        codeHash: hashToken(code),
        expiresAt: new Date(createdAt.getTime() + 10 * 60_000),
        attempts: 0,
        consumedAt: null,
        createdAt,
      });
    } catch (error: unknown) {
      if (error instanceof IdentityRepositoryConflictError)
        throw new IdentityError('CONTACT_OR_HANDLE_UNAVAILABLE');
      throw error;
    }
    await this.delivery.send({
      accountId,
      contactType: input.contactType,
      contact,
      purpose: 'contact_verification',
      code,
      expiresAt: new Date(createdAt.getTime() + 10 * 60_000),
    });
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

  async requestPasswordReset(
    contactInput: string,
  ): Promise<{ accepted: true }> {
    const contact = normalizeContact(contactInput);
    const account = await this.repository.findAccountByContact(contact);
    if (!account || account.status !== 'active') return { accepted: true };

    const now = new Date();
    if (
      !(await canDeliverVerification(
        this.repository,
        account.id,
        'password_reset',
        now,
      ))
    )
      return { accepted: true };

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.repository.createChallenge({
      id: uuidV7(),
      accountId: account.id,
      purpose: 'password_reset',
      codeHash: hashToken(code),
      expiresAt: new Date(now.getTime() + 10 * 60_000),
      attempts: 0,
      consumedAt: null,
      createdAt: now,
    });
    await this.delivery.send({
      accountId: account.id,
      contactType: account.contactType,
      contact,
      purpose: 'password_reset',
      code,
      expiresAt: new Date(now.getTime() + 10 * 60_000),
    });
    return { accepted: true };
  }

  async resetPassword(input: ResetPassword): Promise<void> {
    const account = await this.repository.findAccountByContact(
      normalizeContact(input.contact),
    );
    if (!account || account.status !== 'active')
      throw new IdentityError('PASSWORD_RESET_INVALID');
    const challenge = await this.repository.findLatestChallenge(
      account.id,
      'password_reset',
    );
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() <= Date.now()
    )
      throw new IdentityError('PASSWORD_RESET_INVALID');
    const attempts = await this.repository.incrementChallengeAttempts(
      challenge.id,
    );
    if (attempts > 5) throw new IdentityError('PASSWORD_RESET_INVALID');
    if (!safeEqual(challenge.codeHash, hashToken(input.code)))
      throw new IdentityError('PASSWORD_RESET_INVALID');
    const reset = await this.repository.resetPassword(
      account.id,
      challenge.id,
      hashPassword(input.newPassword),
      new Date(),
    );
    if (!reset) throw new IdentityError('PASSWORD_RESET_INVALID');
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

  async updateProfile(
    accessToken: string,
    update: UpdateProfileRequest,
  ): Promise<PublicProfile> {
    const session = await this.authenticate(accessToken);
    return this.repository.updateProfile(session.accountId, update, uuidV7());
  }

  async updatePrivacy(
    accessToken: string,
    update: UpdatePrivacyRequest,
  ): Promise<PublicProfile> {
    const session = await this.authenticate(accessToken);
    return this.repository.updatePrivacy(session.accountId, update, uuidV7());
  }

  async blockAccount(accessToken: string, blockedId: string): Promise<void> {
    const session = await this.authenticate(accessToken);
    if (session.accountId === blockedId)
      throw new IdentityError('ACCOUNT_RELATION_INVALID');
    if (!(await this.repository.findAccountById(blockedId)))
      throw new IdentityError('ACCOUNT_NOT_FOUND');
    await this.repository.blockAccount(session.accountId, blockedId, uuidV7());
  }

  async unblockAccount(accessToken: string, blockedId: string): Promise<void> {
    const session = await this.authenticate(accessToken);
    const removed = await this.repository.unblockAccount(
      session.accountId,
      blockedId,
      uuidV7(),
    );
    if (!removed) throw new IdentityError('BLOCK_NOT_FOUND');
  }

  async reportAccount(
    accessToken: string,
    input: ReportAccountRequest,
  ): Promise<SafetyReportResponse> {
    const session = await this.authenticate(accessToken);
    if (session.accountId === input.targetAccountId)
      throw new IdentityError('ACCOUNT_RELATION_INVALID');
    if (!(await this.repository.findAccountById(input.targetAccountId)))
      throw new IdentityError('ACCOUNT_NOT_FOUND');
    const reportId = uuidV7();
    await this.repository.createSafetyReport(
      {
        id: reportId,
        reporterId: session.accountId,
        targetAccountId: input.targetAccountId,
        category: input.category,
        details: input.details ?? null,
      },
      uuidV7(),
    );
    return { reportId, status: 'submitted' };
  }

  async getProfile(
    handle: string,
    accessToken?: string,
  ): Promise<PublicProfile> {
    const account = await this.repository.findAccountByHandle(
      handle.toLowerCase(),
    );
    if (!account) throw new IdentityError('PROFILE_NOT_FOUND');
    if (!accessToken) {
      if (
        account.profile.profileVisibility !== 'public' ||
        !account.profile.discoverable
      )
        throw new IdentityError('PROFILE_NOT_FOUND');
      return account.profile;
    }
    const viewer = await this.authenticate(accessToken);
    if (viewer.accountId === account.id) return account.profile;
    if (
      account.profile.profileVisibility !== 'public' ||
      !account.profile.discoverable ||
      (await this.repository.isBlockedEitherDirection(
        viewer.accountId,
        account.id,
      ))
    )
      throw new IdentityError('PROFILE_NOT_FOUND');
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

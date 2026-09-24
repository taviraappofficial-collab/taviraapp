import { Injectable } from '@nestjs/common';
import type {
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

type Account = {
  id: string;
  contact: string;
  passwordHash: string;
  status: 'pending_verification' | 'active' | 'suspended' | 'closed';
  profile: PublicProfile;
};

type Challenge = {
  id: string;
  accountId: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
};
type Session = {
  id: string;
  accountId: string;
  deviceName: string;
  refreshTokenHash: string;
  refreshExpiresAt: number;
  revokedAt?: number;
};

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
  private readonly accounts = new Map<string, Account>();
  private readonly accountIdsByContact = new Map<string, string>();
  private readonly accountIdsByHandle = new Map<string, string>();
  private readonly challenges = new Map<string, Challenge>();
  private readonly sessions = new Map<string, Session>();

  constructor(private readonly delivery: DevelopmentVerificationDelivery) {}

  register(input: RegisterAccountRequest): RegisterAccountResponse {
    const contact = normalizeContact(input.contact);
    const handle = input.handle.toLowerCase();
    if (this.accountIdsByContact.has(contact))
      throw new IdentityError('CONTACT_ALREADY_REGISTERED');
    if (this.accountIdsByHandle.has(handle))
      throw new IdentityError('HANDLE_UNAVAILABLE');

    const accountId = uuidV7();
    const challengeId = uuidV7();
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const account: Account = {
      id: accountId,
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
    this.accounts.set(accountId, account);
    this.accountIdsByContact.set(contact, accountId);
    this.accountIdsByHandle.set(handle, accountId);
    this.challenges.set(challengeId, {
      id: challengeId,
      accountId,
      codeHash: hashToken(code),
      expiresAt: Date.now() + 10 * 60_000,
      attempts: 0,
    });
    this.delivery.send(contact, code);
    return {
      accountId,
      verificationChallengeId: challengeId,
      accountStatus: 'pending_verification',
      contactVerificationStatus: 'pending',
    };
  }

  verifyContact(input: VerifyContactRequest): PublicProfile {
    const challenge = this.challenges.get(input.challengeId);
    if (!challenge || challenge.expiresAt <= Date.now())
      throw new IdentityError('CHALLENGE_INVALID_OR_EXPIRED');
    challenge.attempts += 1;
    if (challenge.attempts > 5)
      throw new IdentityError('CHALLENGE_ATTEMPTS_EXCEEDED');
    if (!safeEqual(challenge.codeHash, hashToken(input.code)))
      throw new IdentityError('VERIFICATION_CODE_INVALID');
    const account = this.requireAccount(challenge.accountId);
    account.status = 'active';
    this.challenges.delete(challenge.id);
    return account.profile;
  }

  login(input: LoginRequest): SessionTokens {
    const accountId = this.accountIdsByContact.get(
      normalizeContact(input.contact),
    );
    const account = accountId ? this.accounts.get(accountId) : undefined;
    if (!account || !verifyPassword(input.password, account.passwordHash))
      throw new IdentityError('INVALID_CREDENTIALS');
    if (account.status !== 'active')
      throw new IdentityError('ACCOUNT_NOT_ACTIVE');
    return this.issueSession(account.id, input.deviceName);
  }

  refresh(refreshToken: string): SessionTokens {
    const tokenHash = hashToken(refreshToken);
    const session = [...this.sessions.values()].find((candidate) =>
      safeEqual(candidate.refreshTokenHash, tokenHash),
    );
    if (!session || session.revokedAt || session.refreshExpiresAt <= Date.now())
      throw new IdentityError('REFRESH_TOKEN_INVALID');
    session.revokedAt = Date.now();
    return this.issueSession(session.accountId, session.deviceName);
  }

  logoutAll(accountId: string): number {
    let revoked = 0;
    for (const session of this.sessions.values()) {
      if (session.accountId === accountId && !session.revokedAt) {
        session.revokedAt = Date.now();
        revoked += 1;
      }
    }
    return revoked;
  }

  getProfile(handle: string): PublicProfile {
    const accountId = this.accountIdsByHandle.get(handle.toLowerCase());
    if (!accountId) throw new IdentityError('PROFILE_NOT_FOUND');
    return this.requireAccount(accountId).profile;
  }

  private issueSession(accountId: string, deviceName: string): SessionTokens {
    const now = Date.now();
    const accessToken = randomBytes(32).toString('base64url');
    const refreshToken = randomBytes(48).toString('base64url');
    const sessionId = uuidV7();
    const accessTokenExpiresAt = now + 15 * 60_000;
    const refreshTokenExpiresAt = now + 30 * 24 * 60 * 60_000;
    this.sessions.set(sessionId, {
      id: sessionId,
      accountId,
      deviceName,
      refreshTokenHash: hashToken(refreshToken),
      refreshExpiresAt: refreshTokenExpiresAt,
    });
    return {
      accessToken,
      accessTokenExpiresAt: new Date(accessTokenExpiresAt).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: new Date(refreshTokenExpiresAt).toISOString(),
      sessionId,
    };
  }

  private requireAccount(accountId: string): Account {
    const account = this.accounts.get(accountId);
    if (!account) throw new IdentityError('ACCOUNT_NOT_FOUND');
    return account;
  }
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

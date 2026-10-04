import { Injectable } from '@nestjs/common';
import type { PublicProfile } from '@tavira/contracts';

export type ProfileUpdate = Partial<
  Pick<PublicProfile, 'displayName' | 'bio' | 'avatarUrl'>
>;

export type PrivacyUpdate = Pick<
  PublicProfile,
  'profileVisibility' | 'discoverable'
>;

export type SafetyReportRecord = {
  id: string;
  reporterId: string;
  targetAccountId: string;
  category:
    | 'spam'
    | 'harassment'
    | 'impersonation'
    | 'unsafe_content'
    | 'other';
  details: string | null;
};

export type AccountRecord = {
  id: string;
  contactType: 'email' | 'phone';
  contact: string;
  passwordHash: string;
  status: 'pending_verification' | 'active' | 'suspended' | 'closed';
  profile: PublicProfile;
};

export type ChallengeRecord = {
  id: string;
  accountId: string;
  purpose: 'contact_verification' | 'password_reset';
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
};

export type SessionRecord = {
  id: string;
  accountId: string;
  deviceName: string;
  accessTokenHash: string | null;
  accessExpiresAt: Date | null;
  refreshTokenHash: string;
  refreshExpiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export class IdentityRepositoryConflictError extends Error {}

export abstract class IdentityRepository {
  abstract findAccountById(id: string): Promise<AccountRecord | null>;
  abstract findAccountByContact(contact: string): Promise<AccountRecord | null>;
  abstract findAccountByHandle(handle: string): Promise<AccountRecord | null>;
  abstract createRegistration(
    account: AccountRecord,
    challenge: ChallengeRecord,
  ): Promise<void>;
  abstract findChallenge(id: string): Promise<ChallengeRecord | null>;
  abstract createChallenge(challenge: ChallengeRecord): Promise<void>;
  abstract findLatestChallenge(
    accountId: string,
    purpose: ChallengeRecord['purpose'],
  ): Promise<ChallengeRecord | null>;
  abstract countChallengesSince(
    accountId: string,
    purpose: ChallengeRecord['purpose'] | undefined,
    since: Date,
  ): Promise<number>;
  abstract incrementChallengeAttempts(id: string): Promise<number>;
  abstract activateAccountAndConsumeChallenge(
    accountId: string,
    challengeId: string,
    now: Date,
  ): Promise<void>;
  abstract createSession(session: SessionRecord): Promise<void>;
  abstract findSessionByRefreshHash(
    refreshTokenHash: string,
  ): Promise<SessionRecord | null>;
  abstract findSessionByAccessHash(
    accessTokenHash: string,
  ): Promise<SessionRecord | null>;
  abstract listSessions(accountId: string): Promise<SessionRecord[]>;
  abstract revokeSession(
    accountId: string,
    sessionId: string,
    now: Date,
  ): Promise<boolean>;
  abstract rotateSession(
    currentSessionId: string,
    replacement: SessionRecord,
    now: Date,
  ): Promise<boolean>;
  abstract revokeAllSessions(accountId: string, now: Date): Promise<number>;
  abstract resetPassword(
    accountId: string,
    challengeId: string,
    passwordHash: string,
    now: Date,
  ): Promise<boolean>;
  abstract updateProfile(
    accountId: string,
    update: ProfileUpdate,
    auditEventId: string,
  ): Promise<PublicProfile>;
  abstract updatePrivacy(
    accountId: string,
    update: PrivacyUpdate,
    auditEventId: string,
  ): Promise<PublicProfile>;
  abstract isBlockedEitherDirection(
    firstAccountId: string,
    secondAccountId: string,
  ): Promise<boolean>;
  abstract blockAccount(
    blockerId: string,
    blockedId: string,
    auditEventId: string,
  ): Promise<void>;
  abstract unblockAccount(
    blockerId: string,
    blockedId: string,
    auditEventId: string,
  ): Promise<boolean>;
  abstract createSafetyReport(
    report: SafetyReportRecord,
    auditEventId: string,
  ): Promise<void>;
}

@Injectable()
export class MemoryIdentityRepository extends IdentityRepository {
  private readonly accounts = new Map<string, AccountRecord>();
  private readonly challenges = new Map<string, ChallengeRecord>();
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly blocks = new Set<string>();
  private readonly reports = new Map<string, SafetyReportRecord>();

  findAccountById(id: string): Promise<AccountRecord | null> {
    return Promise.resolve(this.accounts.get(id) ?? null);
  }

  findAccountByContact(contact: string): Promise<AccountRecord | null> {
    return Promise.resolve(
      [...this.accounts.values()].find(
        (account) => account.contact === contact,
      ) ?? null,
    );
  }

  findAccountByHandle(handle: string): Promise<AccountRecord | null> {
    return Promise.resolve(
      [...this.accounts.values()].find(
        (account) => account.profile.handle === handle,
      ) ?? null,
    );
  }

  createRegistration(
    account: AccountRecord,
    challenge: ChallengeRecord,
  ): Promise<void> {
    this.accounts.set(account.id, account);
    this.challenges.set(challenge.id, challenge);
    return Promise.resolve();
  }

  findChallenge(id: string): Promise<ChallengeRecord | null> {
    return Promise.resolve(this.challenges.get(id) ?? null);
  }

  createChallenge(challenge: ChallengeRecord): Promise<void> {
    this.challenges.set(challenge.id, challenge);
    return Promise.resolve();
  }

  findLatestChallenge(
    accountId: string,
    purpose: ChallengeRecord['purpose'],
  ): Promise<ChallengeRecord | null> {
    return Promise.resolve(
      [...this.challenges.values()]
        .filter(
          (challenge) =>
            challenge.accountId === accountId && challenge.purpose === purpose,
        )
        .at(-1) ?? null,
    );
  }

  countChallengesSince(
    accountId: string,
    purpose: ChallengeRecord['purpose'] | undefined,
    since: Date,
  ): Promise<number> {
    return Promise.resolve(
      [...this.challenges.values()].filter(
        (challenge) =>
          challenge.accountId === accountId &&
          (purpose === undefined || challenge.purpose === purpose) &&
          challenge.createdAt.getTime() >= since.getTime(),
      ).length,
    );
  }

  incrementChallengeAttempts(id: string): Promise<number> {
    const challenge = this.challenges.get(id);
    if (!challenge) return Promise.resolve(0);
    challenge.attempts += 1;
    return Promise.resolve(challenge.attempts);
  }

  activateAccountAndConsumeChallenge(
    accountId: string,
    challengeId: string,
    now: Date,
  ): Promise<void> {
    const account = this.accounts.get(accountId);
    const challenge = this.challenges.get(challengeId);
    if (account) account.status = 'active';
    if (challenge) challenge.consumedAt = now;
    return Promise.resolve();
  }

  createSession(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
    return Promise.resolve();
  }

  findSessionByRefreshHash(
    refreshTokenHash: string,
  ): Promise<SessionRecord | null> {
    return Promise.resolve(
      [...this.sessions.values()].find(
        (session) => session.refreshTokenHash === refreshTokenHash,
      ) ?? null,
    );
  }

  findSessionByAccessHash(
    accessTokenHash: string,
  ): Promise<SessionRecord | null> {
    return Promise.resolve(
      [...this.sessions.values()].find(
        (session) => session.accessTokenHash === accessTokenHash,
      ) ?? null,
    );
  }

  listSessions(accountId: string): Promise<SessionRecord[]> {
    return Promise.resolve(
      [...this.sessions.values()].filter(
        (session) => session.accountId === accountId && !session.revokedAt,
      ),
    );
  }

  revokeSession(
    accountId: string,
    sessionId: string,
    now: Date,
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.accountId !== accountId || session.revokedAt)
      return Promise.resolve(false);
    session.revokedAt = now;
    return Promise.resolve(true);
  }

  rotateSession(
    currentSessionId: string,
    replacement: SessionRecord,
    now: Date,
  ): Promise<boolean> {
    const current = this.sessions.get(currentSessionId);
    if (!current || current.revokedAt) return Promise.resolve(false);
    current.revokedAt = now;
    this.sessions.set(replacement.id, replacement);
    return Promise.resolve(true);
  }

  revokeAllSessions(accountId: string, now: Date): Promise<number> {
    let revoked = 0;
    for (const session of this.sessions.values()) {
      if (session.accountId === accountId && !session.revokedAt) {
        session.revokedAt = now;
        revoked += 1;
      }
    }
    return Promise.resolve(revoked);
  }

  resetPassword(
    accountId: string,
    challengeId: string,
    passwordHash: string,
    now: Date,
  ): Promise<boolean> {
    const account = this.accounts.get(accountId);
    const challenge = this.challenges.get(challengeId);
    if (!account || !challenge || challenge.consumedAt)
      return Promise.resolve(false);
    if (account) account.passwordHash = passwordHash;
    if (challenge) challenge.consumedAt = now;
    return this.revokeAllSessions(accountId, now).then(() => true);
  }

  updateProfile(
    accountId: string,
    update: ProfileUpdate,
    _auditEventId: string,
  ): Promise<PublicProfile> {
    void _auditEventId;
    const account = this.accounts.get(accountId);
    if (!account) return Promise.reject(new Error('ACCOUNT_NOT_FOUND'));
    account.profile = { ...account.profile, ...update };
    return Promise.resolve(account.profile);
  }

  updatePrivacy(
    accountId: string,
    update: PrivacyUpdate,
    _auditEventId: string,
  ): Promise<PublicProfile> {
    void _auditEventId;
    const account = this.accounts.get(accountId);
    if (!account) return Promise.reject(new Error('ACCOUNT_NOT_FOUND'));
    account.profile = { ...account.profile, ...update };
    return Promise.resolve(account.profile);
  }

  isBlockedEitherDirection(
    firstAccountId: string,
    secondAccountId: string,
  ): Promise<boolean> {
    return Promise.resolve(
      this.blocks.has(`${firstAccountId}:${secondAccountId}`) ||
        this.blocks.has(`${secondAccountId}:${firstAccountId}`),
    );
  }

  blockAccount(
    blockerId: string,
    blockedId: string,
    _auditEventId: string,
  ): Promise<void> {
    void _auditEventId;
    this.blocks.add(`${blockerId}:${blockedId}`);
    return Promise.resolve();
  }

  unblockAccount(
    blockerId: string,
    blockedId: string,
    _auditEventId: string,
  ): Promise<boolean> {
    void _auditEventId;
    return Promise.resolve(this.blocks.delete(`${blockerId}:${blockedId}`));
  }

  createSafetyReport(
    report: SafetyReportRecord,
    _auditEventId: string,
  ): Promise<void> {
    void _auditEventId;
    this.reports.set(report.id, report);
    return Promise.resolve();
  }
}

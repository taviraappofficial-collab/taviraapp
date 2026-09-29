import { Injectable } from '@nestjs/common';
import type { PublicProfile } from '@tavira/contracts';

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
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
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
}

@Injectable()
export class MemoryIdentityRepository extends IdentityRepository {
  private readonly accounts = new Map<string, AccountRecord>();
  private readonly challenges = new Map<string, ChallengeRecord>();
  private readonly sessions = new Map<string, SessionRecord>();

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
}

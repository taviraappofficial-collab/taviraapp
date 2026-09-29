import { Injectable } from '@nestjs/common';
import type { PublicProfile } from '@tavira/contracts';
import { PrismaService } from '../database/prisma.service.js';
import {
  IdentityRepository,
  IdentityRepositoryConflictError,
  type AccountRecord,
  type ChallengeRecord,
  type SessionRecord,
} from './identity.repository.js';

@Injectable()
export class PrismaIdentityRepository extends IdentityRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAccountById(id: string): Promise<AccountRecord | null> {
    return this.toAccount(
      await this.prisma.account.findUnique({
        where: { id },
        include: { credential: true, profile: true },
      }),
    );
  }

  async findAccountByContact(contact: string): Promise<AccountRecord | null> {
    return this.toAccount(
      await this.prisma.account.findUnique({
        where: { contact },
        include: { credential: true, profile: true },
      }),
    );
  }

  async findAccountByHandle(handle: string): Promise<AccountRecord | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { handle },
      include: { account: { include: { credential: true, profile: true } } },
    });
    return this.toAccount(profile?.account ?? null);
  }

  async createRegistration(
    account: AccountRecord,
    challenge: ChallengeRecord,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.account.create({
          data: {
            id: account.id,
            contactType: account.contactType,
            contact: account.contact,
            status: account.status,
            credential: { create: { passwordHash: account.passwordHash } },
            profile: {
              create: {
                handle: account.profile.handle,
                displayName: account.profile.displayName,
                bio: account.profile.bio,
                avatarUrl: account.profile.avatarUrl,
                creatorStatus: account.profile.creatorStatus,
                verificationBadgeStatus:
                  account.profile.verificationBadgeStatus,
                sellerStatus: account.profile.sellerStatus,
              },
            },
          },
        });
        await tx.verificationChallenge.create({
          data: {
            id: challenge.id,
            accountId: challenge.accountId,
            codeHash: challenge.codeHash,
            expiresAt: challenge.expiresAt,
          },
        });
      });
    } catch (error: unknown) {
      if (hasPrismaCode(error, 'P2002'))
        throw new IdentityRepositoryConflictError();
      throw error;
    }
  }

  async findChallenge(id: string): Promise<ChallengeRecord | null> {
    return this.prisma.verificationChallenge.findUnique({ where: { id } });
  }

  async incrementChallengeAttempts(id: string): Promise<number> {
    const challenge = await this.prisma.verificationChallenge.update({
      where: { id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    return challenge.attempts;
  }

  async activateAccountAndConsumeChallenge(
    accountId: string,
    challengeId: string,
    now: Date,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: accountId },
        data: { status: 'active' },
      }),
      this.prisma.verificationChallenge.update({
        where: { id: challengeId },
        data: { consumedAt: now },
      }),
    ]);
  }

  async createSession(session: SessionRecord): Promise<void> {
    await this.prisma.session.create({ data: session });
  }

  async findSessionByRefreshHash(
    refreshTokenHash: string,
  ): Promise<SessionRecord | null> {
    return this.prisma.session.findUnique({ where: { refreshTokenHash } });
  }

  async findSessionByAccessHash(
    accessTokenHash: string,
  ): Promise<SessionRecord | null> {
    return this.prisma.session.findUnique({ where: { accessTokenHash } });
  }

  async listSessions(accountId: string): Promise<SessionRecord[]> {
    return this.prisma.session.findMany({
      where: { accountId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(
    accountId: string,
    sessionId: string,
    now: Date,
  ): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, accountId, revokedAt: null },
      data: { revokedAt: now },
    });
    return result.count === 1;
  }

  async rotateSession(
    currentSessionId: string,
    replacement: SessionRecord,
    now: Date,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const update = await tx.session.updateMany({
        where: {
          id: currentSessionId,
          revokedAt: null,
          refreshExpiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });
      if (update.count !== 1) return false;
      await tx.session.create({ data: replacement });
      return true;
    });
  }

  async revokeAllSessions(accountId: string, now: Date): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { accountId, revokedAt: null },
      data: { revokedAt: now },
    });
    return result.count;
  }

  private toAccount(
    record: {
      id: string;
      contactType: 'email' | 'phone';
      contact: string;
      status: 'pending_verification' | 'active' | 'suspended' | 'closed';
      credential: { passwordHash: string } | null;
      profile: PublicProfile | null;
    } | null,
  ): AccountRecord | null {
    if (!record?.credential || !record.profile) return null;
    return {
      ...record,
      passwordHash: record.credential.passwordHash,
      profile: record.profile,
    };
  }
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

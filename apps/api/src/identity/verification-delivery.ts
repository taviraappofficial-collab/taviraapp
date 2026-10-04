import { Injectable } from '@nestjs/common';
import type {
  ChallengeRecord,
  IdentityRepository,
} from './identity.repository.js';

export type VerificationDeliveryRequest = {
  accountId: string;
  contactType: 'email' | 'phone';
  contact: string;
  purpose: ChallengeRecord['purpose'];
  code: string;
  expiresAt: Date;
};

export abstract class VerificationDelivery {
  abstract send(request: VerificationDeliveryRequest): void | Promise<void>;
}

@Injectable()
export class DevelopmentVerificationDelivery extends VerificationDelivery {
  send(request: VerificationDeliveryRequest): void {
    // Provider integration is deliberately deferred; never log the one-time code.
    console.info('identity.verification.requested', {
      accountId: request.accountId,
      channel: request.contactType,
      contact: maskContact(request.contact),
      purpose: request.purpose,
      expiresAt: request.expiresAt.toISOString(),
    });
  }
}

const purposeHourlyLimit = 3;
const accountDailyLimit = 10;

export async function canDeliverVerification(
  repository: IdentityRepository,
  accountId: string,
  purpose: ChallengeRecord['purpose'],
  now: Date,
): Promise<boolean> {
  const hourAgo = new Date(now.getTime() - 60 * 60_000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60_000);
  const [purposeDeliveries, accountDeliveries] = await Promise.all([
    repository.countChallengesSince(accountId, purpose, hourAgo),
    repository.countChallengesSince(accountId, undefined, dayAgo),
  ]);
  return (
    purposeDeliveries < purposeHourlyLimit &&
    accountDeliveries < accountDailyLimit
  );
}

function maskContact(contact: string): string {
  const visible = contact.slice(-3);
  return `${'*'.repeat(Math.max(3, contact.length - 3))}${visible}`;
}

import { describe, expect, it } from 'vitest';
import {
  creatorStatusSchema,
  giftTransactionSchema,
  withdrawalStatusSchema,
} from './index';

describe('financial and creator contracts', () => {
  it('accepts every approved creator lifecycle state', () => {
    expect(creatorStatusSchema.parse('suspended')).toBe('suspended');
  });
  it('rejects unknown withdrawal states', () => {
    expect(withdrawalStatusSchema.safeParse('instant').success).toBe(false);
  });
  it('rejects an unbalanced gift allocation', () => {
    const result = giftTransactionSchema.safeParse({
      id: '01990b8a-2c18-7000-8000-000000000001',
      idempotencyKey: 'gift-send-00000001',
      giftId: '01990b8a-2c18-7000-8000-000000000002',
      senderId: '01990b8a-2c18-7000-8000-000000000003',
      recipientId: '01990b8a-2c18-7000-8000-000000000004',
      grossAmountMinor: 1000,
      platformFeeMinor: 100,
      providerFeeMinor: 50,
      taxMinor: 0,
      chargebackReserveMinor: 50,
      recipientEarningsMinor: 700,
      currency: 'NGN',
      status: 'confirmed',
      createdAt: '2026-09-14T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

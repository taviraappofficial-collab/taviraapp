import { z } from 'zod';

export const creatorStatusSchema = z.enum([
  'not_applied',
  'pending',
  'approved',
  'rejected',
  'suspended',
  'revoked',
]);
export type CreatorStatus = z.infer<typeof creatorStatusSchema>;

export const giftTransactionStatusSchema = z.enum([
  'pending',
  'confirmed',
  'failed',
  'held',
  'reversed',
]);

export const giftTransactionSchema = z
  .object({
    id: z.uuid(),
    idempotencyKey: z.string().min(16).max(128),
    giftId: z.uuid(),
    senderId: z.uuid(),
    recipientId: z.uuid(),
    grossAmountMinor: z.int().nonnegative(),
    platformFeeMinor: z.int().nonnegative(),
    providerFeeMinor: z.int().nonnegative(),
    taxMinor: z.int().nonnegative(),
    chargebackReserveMinor: z.int().nonnegative(),
    recipientEarningsMinor: z.int().nonnegative(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    status: giftTransactionStatusSchema,
    createdAt: z.iso.datetime(),
  })
  .superRefine((gift, context) => {
    const deductions =
      gift.platformFeeMinor +
      gift.providerFeeMinor +
      gift.taxMinor +
      gift.chargebackReserveMinor +
      gift.recipientEarningsMinor;
    if (deductions !== gift.grossAmountMinor) {
      context.addIssue({
        code: 'custom',
        message: 'Gift allocation must equal gross amount',
      });
    }
  });
export type GiftTransaction = z.infer<typeof giftTransactionSchema>;

export const withdrawalStatusSchema = z.enum([
  'requested',
  'identity_review',
  'risk_review',
  'approved',
  'processing',
  'paid',
  'rejected',
  'frozen',
  'reversed',
  'cancelled',
]);
export type WithdrawalStatus = z.infer<typeof withdrawalStatusSchema>;

export const withdrawalRequestSchema = z.object({
  id: z.uuid(),
  idempotencyKey: z.string().min(16).max(128),
  accountId: z.uuid(),
  amountMinor: z.int().positive(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  status: withdrawalStatusSchema,
  requestedAt: z.iso.datetime(),
});

import { z } from 'zod';

export const contactTypeSchema = z.enum(['email', 'phone']);
export const accountStatusSchema = z.enum([
  'pending_verification',
  'active',
  'suspended',
  'closed',
]);

const normalizedContactSchema = z.string().trim().min(5).max(254);
const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,30}$/);

export const registerAccountRequestSchema = z.object({
  contactType: contactTypeSchema,
  contact: normalizedContactSchema,
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(2).max(80),
  handle: handleSchema,
});

export const registerAccountResponseSchema = z.object({
  accountId: z.uuid(),
  verificationChallengeId: z.uuid(),
  accountStatus: accountStatusSchema,
  contactVerificationStatus: z.literal('pending'),
});

export const verifyContactRequestSchema = z.object({
  challengeId: z.uuid(),
  code: z.string().regex(/^\d{6}$/),
});

export const loginRequestSchema = z.object({
  contact: normalizedContactSchema,
  password: z.string().min(1).max(128),
  deviceName: z.string().trim().min(1).max(100),
});

export const refreshSessionRequestSchema = z.object({
  refreshToken: z.string().min(32).max(512),
});

export const sessionTokensSchema = z.object({
  accessToken: z.string().min(32),
  accessTokenExpiresAt: z.iso.datetime(),
  refreshToken: z.string().min(32),
  refreshTokenExpiresAt: z.iso.datetime(),
  sessionId: z.uuid(),
});

export const deviceSessionSchema = z.object({
  sessionId: z.uuid(),
  deviceName: z.string().min(1).max(100),
  createdAt: z.iso.datetime(),
  current: z.boolean(),
});

export const deviceSessionListSchema = z.object({
  sessions: z.array(deviceSessionSchema),
});

export const revokeSessionRequestSchema = z.object({
  sessionId: z.uuid(),
});

export const requestPasswordResetSchema = z.object({
  contact: normalizedContactSchema,
});

export const requestPasswordResetResponseSchema = z.object({
  accepted: z.literal(true),
});

export const resetPasswordSchema = z.object({
  contact: normalizedContactSchema,
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(12).max(128),
});

export const publicProfileSchema = z.object({
  accountId: z.uuid(),
  handle: handleSchema,
  displayName: z.string().min(2).max(80),
  bio: z.string().max(160),
  avatarUrl: z.url().nullable(),
  creatorStatus: z.enum([
    'not_applied',
    'pending',
    'approved',
    'rejected',
    'suspended',
    'revoked',
  ]),
  verificationBadgeStatus: z.enum([
    'not_applied',
    'pending',
    'approved',
    'rejected',
    'expired',
    'revoked',
  ]),
  sellerStatus: z.enum([
    'not_applied',
    'pending',
    'approved',
    'rejected',
    'suspended',
  ]),
});

export type RegisterAccountRequest = z.infer<
  typeof registerAccountRequestSchema
>;
export type RegisterAccountResponse = z.infer<
  typeof registerAccountResponseSchema
>;
export type VerifyContactRequest = z.infer<typeof verifyContactRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>;
export type SessionTokens = z.infer<typeof sessionTokensSchema>;
export type DeviceSession = z.infer<typeof deviceSessionSchema>;
export type DeviceSessionList = z.infer<typeof deviceSessionListSchema>;
export type RevokeSessionRequest = z.infer<typeof revokeSessionRequestSchema>;
export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type PublicProfile = z.infer<typeof publicProfileSchema>;

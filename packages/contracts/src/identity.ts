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
  profileVisibility: z.enum(['public', 'private']),
  discoverable: z.boolean(),
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

export const updateProfileRequestSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80).optional(),
    bio: z.string().trim().max(160).optional(),
    avatarUrl: z.url().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one profile field is required',
  });

export const updatePrivacyRequestSchema = z.object({
  profileVisibility: z.enum(['public', 'private']),
  discoverable: z.boolean(),
});

export const accountIdParameterSchema = z.object({ accountId: z.uuid() });

export const reportAccountRequestSchema = z.object({
  targetAccountId: z.uuid(),
  category: z.enum([
    'spam',
    'harassment',
    'impersonation',
    'unsafe_content',
    'other',
  ]),
  details: z.string().trim().max(1000).nullable().optional(),
});

export const safetyReportResponseSchema = z.object({
  reportId: z.uuid(),
  status: z.literal('submitted'),
});

export const reportStatusSchema = z.enum([
  'submitted',
  'reviewing',
  'resolved',
  'dismissed',
]);

export const moderationReportQuerySchema = z.object({
  status: reportStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const updateModerationReportSchema = z.object({
  status: z.enum(['reviewing', 'resolved', 'dismissed']),
  note: z.string().trim().min(1).max(1000),
});

export const moderationReportParameterSchema = z.object({
  reportId: z.uuid(),
});

export const auditExportQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    limit: z.coerce.number().int().min(1).max(1000).default(250),
  })
  .refine(({ from, to }) => from <= to, {
    message: 'from must be before or equal to to',
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
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
export type UpdatePrivacyRequest = z.infer<typeof updatePrivacyRequestSchema>;
export type ReportAccountRequest = z.infer<typeof reportAccountRequestSchema>;
export type SafetyReportResponse = z.infer<typeof safetyReportResponseSchema>;
export type ReportStatus = z.infer<typeof reportStatusSchema>;
export type ModerationReportQuery = z.infer<typeof moderationReportQuerySchema>;
export type UpdateModerationReport = z.infer<
  typeof updateModerationReportSchema
>;
export type AuditExportQuery = z.infer<typeof auditExportQuerySchema>;

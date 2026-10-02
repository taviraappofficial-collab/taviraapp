import type {
  DeviceSessionList,
  LoginRequest,
  PublicProfile,
  RegisterAccountRequest,
  RegisterAccountResponse,
  SessionTokens,
  UpdatePrivacyRequest,
  VerifyContactRequest,
} from '@tavira/contracts';

export class IdentityApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
  }
}

export function identityErrorMessage(error: unknown): string {
  if (!(error instanceof IdentityApiError))
    return 'We could not connect to TAVIRA. Check your connection and try again.';
  const messages: Record<string, string> = {
    CONTACT_ALREADY_REGISTERED: 'That contact is already registered.',
    CONTACT_OR_HANDLE_UNAVAILABLE: 'That contact or username is unavailable.',
    HANDLE_UNAVAILABLE: 'That username is unavailable.',
    INVALID_CREDENTIALS: 'The contact or password is incorrect.',
    ACCOUNT_NOT_ACTIVE: 'Verify your contact before signing in.',
    CHALLENGE_INVALID_OR_EXPIRED: 'That code has expired. Request a new one.',
    VERIFICATION_CODE_INVALID: 'That verification code is incorrect.',
    ACCESS_TOKEN_INVALID: 'Your session has expired. Sign in again.',
  };
  return messages[error.code] ?? 'We could not complete that request.';
}

export type IdentityApi = ReturnType<typeof createIdentityApi>;
export type IdentityFetch = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export function createIdentityApi(
  baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001',
  fetcher: IdentityFetch = fetch,
) {
  const request = async <T>(
    path: string,
    options: RequestInit & { accessToken?: string } = {},
  ): Promise<T> => {
    const { accessToken, ...init } = options;
    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    });
    const payload = (await response.json().catch(() => ({}))) as {
      code?: string;
    };
    if (!response.ok)
      throw new IdentityApiError(
        payload.code ?? 'REQUEST_FAILED',
        response.status,
      );
    return payload as T;
  };

  return {
    register: (input: RegisterAccountRequest) =>
      request<RegisterAccountResponse>('/v1/identity/register', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    verifyContact: (input: VerifyContactRequest) =>
      request<PublicProfile>('/v1/identity/verify-contact', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    login: (input: LoginRequest) =>
      request<SessionTokens>('/v1/identity/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    refresh: (refreshToken: string) =>
      request<SessionTokens>('/v1/identity/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    listSessions: (accessToken: string) =>
      request<DeviceSessionList>('/v1/identity/sessions', { accessToken }),
    revokeSession: (accessToken: string, sessionId: string) =>
      request<{ revoked: true }>(`/v1/identity/sessions/${sessionId}`, {
        method: 'DELETE',
        accessToken,
      }),
    logoutAll: (accessToken: string) =>
      request<{ revokedSessions: number }>('/v1/identity/logout-all', {
        method: 'POST',
        accessToken,
      }),
    updatePrivacy: (accessToken: string, input: UpdatePrivacyRequest) =>
      request<PublicProfile>('/v1/identity/privacy', {
        method: 'PUT',
        accessToken,
        body: JSON.stringify(input),
      }),
  };
}

export const identityApi = createIdentityApi();

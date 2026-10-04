export type EntraConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiScope: string;
};

export function readEntraConfig(): EntraConfig | null {
  const tenantId = process.env.ENTRA_TENANT_ID;
  const clientId = process.env.ENTRA_ADMIN_CLIENT_ID;
  const clientSecret = process.env.ENTRA_ADMIN_CLIENT_SECRET;
  const redirectUri = process.env.ENTRA_ADMIN_REDIRECT_URI;
  const apiScope = process.env.ENTRA_API_SCOPE;
  if (!tenantId || !clientId || !clientSecret || !redirectUri || !apiScope)
    return null;
  return { tenantId, clientId, clientSecret, redirectUri, apiScope };
}

export const accessTokenCookie = 'tavira_admin_access';
export const oauthStateCookie = 'tavira_oauth_state';
export const pkceVerifierCookie = 'tavira_pkce_verifier';

export const secureCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

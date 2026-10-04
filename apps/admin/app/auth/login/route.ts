import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  oauthStateCookie,
  pkceVerifierCookie,
  readEntraConfig,
  secureCookie,
} from '../config';

export function GET(): NextResponse {
  const config = readEntraConfig();
  if (!config)
    return NextResponse.json(
      { code: 'WORKFORCE_AUTH_UNAVAILABLE' },
      { status: 503 },
    );
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const authorize = new URL(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize`,
  );
  authorize.searchParams.set('client_id', config.clientId);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('redirect_uri', config.redirectUri);
  authorize.searchParams.set('response_mode', 'query');
  authorize.searchParams.set('scope', `openid profile ${config.apiScope}`);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', challenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  const response = NextResponse.redirect(authorize);
  response.cookies.set(oauthStateCookie, state, {
    ...secureCookie,
    maxAge: 600,
  });
  response.cookies.set(pkceVerifierCookie, verifier, {
    ...secureCookie,
    maxAge: 600,
  });
  return response;
}

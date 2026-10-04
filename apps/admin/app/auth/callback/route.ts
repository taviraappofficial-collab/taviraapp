import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  accessTokenCookie,
  oauthStateCookie,
  pkceVerifierCookie,
  readEntraConfig,
  secureCookie,
} from '../config';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const config = readEntraConfig();
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(oauthStateCookie)?.value;
  const verifier = request.cookies.get(pkceVerifierCookie)?.value;
  if (!config || !code || !verifier || !safeEqual(state, expectedState))
    return failure('WORKFORCE_CALLBACK_INVALID');
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    scope: `openid profile ${config.apiScope}`,
    code_verifier: verifier,
  });
  try {
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
        cache: 'no-store',
      },
    );
    const token = (await tokenResponse.json()) as {
      access_token?: unknown;
      expires_in?: unknown;
    };
    if (
      !tokenResponse.ok ||
      typeof token.access_token !== 'string' ||
      typeof token.expires_in !== 'number'
    )
      return failure('WORKFORCE_TOKEN_EXCHANGE_FAILED');
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set(accessTokenCookie, token.access_token, {
      ...secureCookie,
      maxAge: Math.max(60, Math.min(token.expires_in - 60, 3600)),
    });
    clearTransientCookies(response);
    return response;
  } catch {
    return failure('WORKFORCE_TOKEN_EXCHANGE_FAILED');
  }
}

function failure(code: string): NextResponse {
  const response = NextResponse.json({ code }, { status: 401 });
  clearTransientCookies(response);
  return response;
}

function clearTransientCookies(response: NextResponse): void {
  response.cookies.set(oauthStateCookie, '', { ...secureCookie, maxAge: 0 });
  response.cookies.set(pkceVerifierCookie, '', { ...secureCookie, maxAge: 0 });
}

function safeEqual(
  received: string | null,
  expected: string | undefined,
): boolean {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

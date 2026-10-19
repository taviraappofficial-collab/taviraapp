import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  accessTokenCookie,
  readSupabaseConfig,
  refreshTokenCookie,
  secureCookie,
} from './app/auth/config';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.cookies.has(accessTokenCookie)) return NextResponse.next();
  const refreshToken = request.cookies.get(refreshTokenCookie)?.value;
  const config = readSupabaseConfig();
  if (!refreshToken || !config) return NextResponse.next();
  try {
    const tokenResponse = await fetch(
      `${config.url}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      },
    );
    const session = (await tokenResponse.json()) as {
      access_token?: unknown;
      refresh_token?: unknown;
      expires_in?: unknown;
    };
    if (
      !tokenResponse.ok ||
      typeof session.access_token !== 'string' ||
      typeof session.refresh_token !== 'string' ||
      typeof session.expires_in !== 'number'
    )
      return clearSession();
    const response = NextResponse.redirect(request.nextUrl);
    response.cookies.set(accessTokenCookie, session.access_token, {
      ...secureCookie,
      maxAge: Math.max(60, session.expires_in - 60),
    });
    response.cookies.set(refreshTokenCookie, session.refresh_token, {
      ...secureCookie,
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return clearSession();
  }
}

function clearSession(): NextResponse {
  const response = NextResponse.next();
  response.cookies.set(accessTokenCookie, '', { ...secureCookie, maxAge: 0 });
  response.cookies.set(refreshTokenCookie, '', { ...secureCookie, maxAge: 0 });
  return response;
}

export const config = { matcher: ['/'] };

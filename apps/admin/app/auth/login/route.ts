import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  accessTokenCookie,
  readSupabaseConfig,
  refreshTokenCookie,
  secureCookie,
} from '../config';

export function GET(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/auth/sign-in', request.url));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const config = readSupabaseConfig();
  const form = await request.formData();
  const emailValue = form.get('email');
  const passwordValue = form.get('password');
  const email = typeof emailValue === 'string' ? emailValue.trim() : '';
  const password = typeof passwordValue === 'string' ? passwordValue : '';
  if (!config || !email || !password) return failure(request);
  try {
    const tokenResponse = await fetch(
      `${config.url}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
      return failure(request);
    const response = NextResponse.redirect(new URL('/', request.url), 303);
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
    return failure(request);
  }
}

function failure(request: NextRequest): NextResponse {
  const url = new URL('/auth/sign-in', request.url);
  url.searchParams.set('error', 'invalid_credentials');
  return NextResponse.redirect(url, 303);
}

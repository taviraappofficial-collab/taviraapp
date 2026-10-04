import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { accessTokenCookie, secureCookie } from '../config';

export function GET(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(accessTokenCookie, '', { ...secureCookie, maxAge: 0 });
  return response;
}

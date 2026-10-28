import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  accessTokenCookie,
  publicUrl,
  refreshTokenCookie,
  secureCookie,
} from '../config';

export function GET(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(publicUrl(request, '/'));
  response.cookies.set(accessTokenCookie, '', { ...secureCookie, maxAge: 0 });
  response.cookies.set(refreshTokenCookie, '', { ...secureCookie, maxAge: 0 });
  return response;
}

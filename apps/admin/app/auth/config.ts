import type { NextRequest } from 'next/server';

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey || !url.startsWith('https://')) return null;
  return { url, anonKey };
}

export const accessTokenCookie = 'tavira_admin_access';
export const refreshTokenCookie = 'tavira_admin_refresh';

export const secureCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function publicUrl(request: NextRequest, pathname: string): URL {
  const forwardedHost = request.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim();
  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();
  if (
    forwardedHost &&
    (forwardedProto === 'https' || forwardedProto === 'http')
  ) {
    return new URL(pathname, `${forwardedProto}://${forwardedHost}`);
  }
  return new URL(pathname, request.url);
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type WorkforceRole = 'Tavira.Moderator' | 'Tavira.AuditExporter';

export type WorkforcePrincipal = {
  id: string;
  displayName: string;
  roles: WorkforceRole[];
};

export abstract class WorkforceAuthenticator {
  abstract authorize(
    authorization: string | undefined,
    requiredRole: WorkforceRole,
  ): Promise<WorkforcePrincipal>;
}

@Injectable()
export class SupabaseWorkforceAuthenticator extends WorkforceAuthenticator {
  private verifier?: ReturnType<typeof createRemoteJWKSet>;

  async authorize(
    authorization: string | undefined,
    requiredRole: WorkforceRole,
  ): Promise<WorkforcePrincipal> {
    const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
    if (!supabaseUrl) throw authError('WORKFORCE_AUTH_UNAVAILABLE');
    const token = readBearerToken(authorization);
    const issuer = `${supabaseUrl}/auth/v1`;
    this.verifier ??= createRemoteJWKSet(
      new URL(`${issuer}/.well-known/jwks.json`),
      { timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 3600000 },
    );
    try {
      const { payload } = await jwtVerify(token, this.verifier, {
        algorithms: ['ES256', 'RS256'],
        issuer,
        audience: 'authenticated',
        requiredClaims: ['sub', 'app_metadata'],
        clockTolerance: 30,
      });
      if (typeof payload.sub !== 'string' || !isUuid(payload.sub))
        throw authError('WORKFORCE_TOKEN_INVALID');
      const metadata = isRecord(payload.app_metadata)
        ? payload.app_metadata
        : {};
      const roles = Array.isArray(metadata.roles)
        ? metadata.roles.filter(isWorkforceRole)
        : [];
      if (!roles.includes(requiredRole))
        throw authError('WORKFORCE_ROLE_REQUIRED');
      const name =
        typeof payload.email === 'string' ? payload.email : payload.sub;
      return { id: `supabase:${payload.sub}`, displayName: name, roles };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      throw authError('WORKFORCE_TOKEN_INVALID');
    }
  }
}

function normalizeSupabaseUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readBearerToken(authorization: string | undefined): string {
  const [scheme, token] = authorization?.split(' ') ?? [];
  if (scheme?.toLowerCase() !== 'bearer' || !token)
    throw authError('WORKFORCE_AUTH_REQUIRED');
  return token;
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isWorkforceRole(value: unknown): value is WorkforceRole {
  return value === 'Tavira.Moderator' || value === 'Tavira.AuditExporter';
}

function authError(code: string): UnauthorizedException {
  return new UnauthorizedException({ code });
}

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
export class EntraWorkforceAuthenticator extends WorkforceAuthenticator {
  private verifier?: ReturnType<typeof createRemoteJWKSet>;

  async authorize(
    authorization: string | undefined,
    requiredRole: WorkforceRole,
  ): Promise<WorkforcePrincipal> {
    const tenantId = process.env.ENTRA_TENANT_ID;
    const audience = process.env.ENTRA_API_CLIENT_ID;
    const authorizedClientId = process.env.ENTRA_ADMIN_CLIENT_ID;
    if (!isUuid(tenantId) || !isUuid(audience) || !isUuid(authorizedClientId))
      throw authError('WORKFORCE_AUTH_UNAVAILABLE');
    const token = readBearerToken(authorization);
    const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
    this.verifier ??= createRemoteJWKSet(
      new URL(
        `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      ),
      { timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 3600000 },
    );
    try {
      const { payload } = await jwtVerify(token, this.verifier, {
        algorithms: ['RS256'],
        issuer,
        audience,
        requiredClaims: ['tid', 'oid', 'roles', 'azp'],
        clockTolerance: 30,
      });
      if (
        payload.tid !== tenantId ||
        payload.azp !== authorizedClientId ||
        typeof payload.oid !== 'string' ||
        !isUuid(payload.oid)
      )
        throw authError('WORKFORCE_TOKEN_INVALID');
      const roles = Array.isArray(payload.roles)
        ? payload.roles.filter(isWorkforceRole)
        : [];
      if (!roles.includes(requiredRole))
        throw authError('WORKFORCE_ROLE_REQUIRED');
      const name =
        typeof payload.preferred_username === 'string'
          ? payload.preferred_username
          : typeof payload.name === 'string'
            ? payload.name
            : payload.oid;
      return { id: `${tenantId}:${payload.oid}`, displayName: name, roles };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      throw authError('WORKFORCE_TOKEN_INVALID');
    }
  }
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

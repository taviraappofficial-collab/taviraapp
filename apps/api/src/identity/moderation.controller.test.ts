import { describe, expect, it } from 'vitest';
import { MemoryIdentityRepository } from './identity.repository.js';
import { ModerationController } from './moderation.controller.js';
import {
  type WorkforcePrincipal,
  type WorkforceRole,
  WorkforceAuthenticator,
} from './workforce-auth.js';

const token = 'Bearer verified-workforce-token';

class TestWorkforceAuthenticator extends WorkforceAuthenticator {
  constructor(private readonly roles: WorkforceRole[]) {
    super();
  }

  authorize(
    _authorization: string | undefined,
    requiredRole: WorkforceRole,
  ): Promise<WorkforcePrincipal> {
    if (!this.roles.includes(requiredRole))
      return Promise.reject(
        Object.assign(new Error('role required'), { status: 401 }),
      );
    return Promise.resolve({
      id: 'tenant-id:moderator-object-id',
      displayName: 'moderator@example.test',
      roles: this.roles,
    });
  }
}

describe('ModerationController', () => {
  it('prevents moderators without the export role from exporting audit data', async () => {
    const controller = new ModerationController(
      new MemoryIdentityRepository(),
      new TestWorkforceAuthenticator(['Tavira.Moderator']),
    );
    await expect(
      controller.exportAuditEvents(token, {
        from: '2020-01-01T00:00:00.000Z',
        to: '2030-01-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject({
      status: 401,
    });
  });

  it('rejects malformed input before querying persistence', async () => {
    const controller = new ModerationController(
      new MemoryIdentityRepository(),
      new TestWorkforceAuthenticator(['Tavira.Moderator']),
    );
    await expect(
      controller.reports(token, { limit: '101' }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('reviews reports and exposes the resulting audit event', async () => {
    const repository = new MemoryIdentityRepository();
    const controller = new ModerationController(
      repository,
      new TestWorkforceAuthenticator([
        'Tavira.Moderator',
        'Tavira.AuditExporter',
      ]),
    );
    await repository.createSafetyReport(
      {
        id: '3d21d72f-4a16-4395-ac79-c2e333e31f16',
        reporterId: 'ff13ab20-e8df-43a9-895d-608f70852f79',
        targetAccountId: 'b96dc994-5201-452e-aa8c-682405dff0cc',
        category: 'harassment',
        details: 'Repeated unwanted contact',
        status: 'submitted',
        createdAt: new Date(),
      },
      crypto.randomUUID(),
    );

    const listing = (await controller.reports(token, {})) as {
      reports: unknown[];
    };
    expect(listing.reports).toHaveLength(1);
    await controller.updateReport(
      token,
      '3d21d72f-4a16-4395-ac79-c2e333e31f16',
      { status: 'reviewing', note: 'Triage started' },
    );
    const exported = (await controller.exportAuditEvents(token, {
      from: '2020-01-01T00:00:00.000Z',
      to: '2030-01-01T00:00:00.000Z',
    })) as { events: unknown[] };
    expect(exported.events).toHaveLength(1);
  });
});

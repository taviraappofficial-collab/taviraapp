import { afterEach, describe, expect, it } from 'vitest';
import { MemoryIdentityRepository } from './identity.repository.js';
import { ModerationController } from './moderation.controller.js';

const key = 'a-secure-development-admin-key-123456';

describe('ModerationController', () => {
  afterEach(() => delete process.env.TAVIRA_ADMIN_API_KEY);

  it('fails closed when the admin key is not configured', async () => {
    const controller = new ModerationController(new MemoryIdentityRepository());
    await expect(controller.reports(key, {})).rejects.toMatchObject({
      status: 401,
    });
  });

  it('rejects malformed input before querying persistence', async () => {
    process.env.TAVIRA_ADMIN_API_KEY = key;
    const controller = new ModerationController(new MemoryIdentityRepository());
    await expect(
      controller.reports(key, { limit: '101' }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('reviews reports and exposes the resulting audit event', async () => {
    process.env.TAVIRA_ADMIN_API_KEY = key;
    const repository = new MemoryIdentityRepository();
    const controller = new ModerationController(repository);
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

    const listing = (await controller.reports(key, {})) as {
      reports: unknown[];
    };
    expect(listing.reports).toHaveLength(1);
    await controller.updateReport(
      key,
      'moderator@example.test',
      '3d21d72f-4a16-4395-ac79-c2e333e31f16',
      { status: 'reviewing', note: 'Triage started' },
    );
    const exported = (await controller.exportAuditEvents(key, {
      from: '2020-01-01T00:00:00.000Z',
      to: '2030-01-01T00:00:00.000Z',
    })) as { events: unknown[] };
    expect(exported.events).toHaveLength(1);
  });
});

import { describe, expect, it } from 'vitest';
import { hasWorkforceRole } from './workforce-auth.js';

describe('workforce role hierarchy', () => {
  it('allows a super administrator to perform every workforce action', () => {
    const roles = ['Tavira.SuperAdministrator'] as const;

    expect(hasWorkforceRole(roles, 'Tavira.Moderator')).toBe(true);
    expect(hasWorkforceRole(roles, 'Tavira.AuditExporter')).toBe(true);
    expect(hasWorkforceRole(roles, 'Tavira.SuperAdministrator')).toBe(true);
  });

  it('does not let scoped roles inherit other workforce permissions', () => {
    expect(hasWorkforceRole(['Tavira.Moderator'], 'Tavira.AuditExporter')).toBe(
      false,
    );
    expect(hasWorkforceRole(['Tavira.AuditExporter'], 'Tavira.Moderator')).toBe(
      false,
    );
  });
});

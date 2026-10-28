import { describe, expect, it } from 'vitest';
import { canPerformCreatorAction, creatorActions } from './index';

const statuses = [
  'not_applied',
  'pending',
  'approved',
  'rejected',
  'suspended',
  'revoked',
] as const;

describe('creator-only permissions', () => {
  for (const status of statuses) {
    it(`${status} creator access is enforced for every protected action`, () => {
      for (const action of creatorActions) {
        expect(
          canPerformCreatorAction(
            {
              accountId: 'account',
              creatorStatus: status,
              accountActive: true,
            },
            action,
          ),
        ).toBe(status === 'approved');
      }
    });
  }
  it('blocks an approved creator whose account is inactive', () => {
    expect(
      canPerformCreatorAction(
        {
          accountId: 'account',
          creatorStatus: 'approved',
          accountActive: false,
        },
        'live:start',
      ),
    ).toBe(false);
  });
});

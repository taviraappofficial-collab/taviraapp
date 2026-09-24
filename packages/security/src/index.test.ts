import { describe, expect, it } from 'vitest';
import type { CreatorStatus } from '@tavira/contracts';
import { canPerformCreatorAction, creatorActions } from './index';

const statuses: CreatorStatus[] = [
  'not_applied',
  'pending',
  'approved',
  'rejected',
  'suspended',
  'revoked',
];

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

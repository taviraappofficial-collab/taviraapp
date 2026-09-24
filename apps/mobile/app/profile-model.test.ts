import { describe, expect, it } from 'vitest';
import { getProfileMenu } from './profile-model';

describe('permission-aware profile menu', () => {
  it('shows the creator application entry to an ordinary account', () => {
    const keys = getProfileMenu('ordinary').map(({ key }) => key);
    expect(keys[0]).toBe('become-creator');
    expect(keys).not.toContain('studio');
    expect(keys).not.toContain('create-room');
  });

  it('shows Studio and Create Room only to an approved creator', () => {
    const keys = getProfileMenu('creator_approved').map(({ key }) => key);
    expect(keys.slice(0, 2)).toEqual(['studio', 'create-room']);
    expect(keys).not.toContain('become-creator');
  });

  it('shows accurate restriction and appeal copy to a suspended creator', () => {
    const creatorEntry = getProfileMenu('creator_suspended')[0];
    expect(creatorEntry?.key).toBe('become-creator');
    expect(creatorEntry?.status).toContain('Suspended');
    expect(
      getProfileMenu('creator_suspended').some(({ key }) => key === 'studio'),
    ).toBe(false);
  });

  it('keeps Verification separate from creator capability', () => {
    for (const state of ['ordinary', 'creator_approved'] as const) {
      expect(
        getProfileMenu(state).some(({ key }) => key === 'verification'),
      ).toBe(true);
    }
  });
});

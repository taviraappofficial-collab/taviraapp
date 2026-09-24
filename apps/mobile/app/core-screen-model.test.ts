import { describe, expect, it } from 'vitest';
import {
  conversationActions,
  coreReviewScreens,
  storeCategories,
} from './core-screen-model';

describe('core visual review coverage', () => {
  it('contains every approved first-batch screen', () => {
    expect(coreReviewScreens).toEqual([
      'splash',
      'onboarding',
      'sign-up',
      'home',
      'chats',
      'conversation',
      'discover',
      'store',
    ]);
  });

  it('keeps attachment, emoji, and Gift Shop controls distinct', () => {
    expect(new Set(conversationActions.map(({ key }) => key)).size).toBe(3);
  });

  it('starts Store browsing with a general category', () => {
    expect(storeCategories[0]).toBe('For you');
  });
});

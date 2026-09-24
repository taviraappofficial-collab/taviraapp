import type { CreatorStatus } from '@tavira/contracts';

export const creatorActions = [
  'channel:create',
  'room:create',
  'live:start',
  'studio:access',
  'studio:publish',
  'monetisation:enable',
  'analytics:view',
] as const;
export type CreatorAction = (typeof creatorActions)[number];

export interface CreatorPrincipal {
  accountId: string;
  creatorStatus: CreatorStatus;
  accountActive: boolean;
}

export function canPerformCreatorAction(
  principal: CreatorPrincipal,
  action: CreatorAction,
): boolean {
  void action;
  return principal.accountActive && principal.creatorStatus === 'approved';
}

export function assertCreatorAction(
  principal: CreatorPrincipal,
  action: CreatorAction,
): void {
  if (!canPerformCreatorAction(principal, action))
    throw new Error('CREATOR_PERMISSION_DENIED');
}

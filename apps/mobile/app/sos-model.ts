export const sosReviewStates = [
  'safety-centre',
  'trusted-contacts',
  'confirmation',
  'active',
  'recipient',
  'safe-confirmation',
] as const;

export type SosReviewState = (typeof sosReviewStates)[number];

export const sosReviewLabels: Readonly<Record<SosReviewState, string>> = {
  'safety-centre': 'Safety Centre',
  'trusted-contacts': 'Trusted contacts',
  confirmation: 'Confirmation',
  active: 'SOS active',
  recipient: 'Recipient view',
  'safe-confirmation': 'End SOS',
};

export const sosDeliveryStates = [
  { recipient: 'Mum', channel: 'TAVIRA push', status: 'Delivered' },
  { recipient: 'Kunle', channel: 'Secure link', status: 'Opened' },
  { recipient: 'Amara', channel: 'SMS fallback', status: 'Queued' },
] as const;

export function canEndSos(reauthenticated: boolean): boolean {
  return reauthenticated;
}

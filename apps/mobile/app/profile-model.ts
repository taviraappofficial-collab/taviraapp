export type ProfileCapabilityState =
  | 'ordinary'
  | 'creator_pending'
  | 'creator_approved'
  | 'creator_suspended';

export interface ProfileMenuItem {
  key: string;
  label: string;
  description: string;
  status?: string;
}

const commonItems: readonly ProfileMenuItem[] = [
  {
    key: 'verification',
    label: 'Verification',
    description: 'Apply, review badge status, and manage renewal',
    status: 'Not verified',
  },
  {
    key: 'ads',
    label: 'Ads Manager',
    description: 'Create and review transparent sponsored campaigns',
    status: 'Feature preview',
  },
  {
    key: 'subscription',
    label: 'Subscription',
    description: 'Plan, benefits, billing, and renewal',
  },
  {
    key: 'privacy',
    label: 'Privacy',
    description: 'Visibility, messaging, gifts, blocks, and location consent',
  },
  {
    key: 'activity',
    label: 'Activity Center',
    description: 'Social, commerce, gifting, creator, and security activity',
  },
  {
    key: 'saved',
    label: 'Saved',
    description: 'Your private saved collections',
  },
  {
    key: 'profile-share',
    label: 'Profile QR and Share',
    description: 'Share a safe, revocable profile link',
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'Account, notifications, appearance, devices, and support',
  },
];

export function getProfileMenu(
  state: ProfileCapabilityState,
): readonly ProfileMenuItem[] {
  const creatorItems: readonly ProfileMenuItem[] =
    state === 'creator_approved'
      ? [
          {
            key: 'studio',
            label: 'TAVIRA Studio',
            description:
              'Create, schedule, publish, and understand your audience',
          },
          {
            key: 'create-room',
            label: 'Create Room',
            description: 'Start a creator-owned room with moderation controls',
          },
        ]
      : [
          {
            key: 'become-creator',
            label: 'Create / Become a Creator',
            description:
              state === 'ordinary'
                ? 'See benefits, eligibility, and application requirements'
                : 'Review your creator status and available support options',
            status:
              state === 'creator_pending'
                ? 'Application pending'
                : state === 'creator_suspended'
                  ? 'Suspended — appeal available'
                  : undefined,
          },
        ];

  return [...creatorItems, ...commonItems];
}

export const coreReviewScreens = [
  'splash',
  'onboarding',
  'sign-up',
  'home',
  'chats',
  'conversation',
  'discover',
  'store',
] as const;

export type CoreReviewScreen = (typeof coreReviewScreens)[number];

export const coreReviewLabels: Readonly<Record<CoreReviewScreen, string>> = {
  splash: 'Splash',
  onboarding: 'Onboarding',
  'sign-up': 'Sign Up',
  home: 'Home',
  chats: 'Chats',
  conversation: 'Conversation',
  discover: 'Discover',
  store: 'Store',
};

export const storeCategories = [
  'For you',
  'Fashion',
  'Beauty',
  'Home',
  'Tech',
] as const;

export const conversationActions = [
  { key: 'attachment', label: 'Add attachment' },
  { key: 'emoji', label: 'Choose emoji' },
  { key: 'gift', label: 'Open Gift Shop' },
] as const;

import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Avatar,
  BottomNavigation,
  Button,
  ChatRow,
  ProductCard,
  TextInput,
  tokens,
} from '@tavira/ui';
import {
  conversationActions,
  coreReviewLabels,
  coreReviewScreens,
  storeCategories,
} from './core-screen-model';
import type { CoreReviewScreen } from './core-screen-model';
import taviraLogo from '../assets/tavira-logo.png';

const bottomItems = ['Home', 'Chats', 'Discover', 'Store', 'Profile'].map(
  (label) => ({
    key: label.toLowerCase(),
    label,
    icon: <Text>●</Text>,
  }),
);

export default function CoreReview() {
  const [screen, setScreen] = useState<CoreReviewScreen>('splash');

  return (
    <View style={styles.reviewCanvas}>
      <ScrollView
        horizontal
        accessibilityRole="tablist"
        contentContainerStyle={styles.screenPicker}
        showsHorizontalScrollIndicator={false}
      >
        {coreReviewScreens.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: screen === item }}
            onPress={() => setScreen(item)}
            style={[
              styles.screenTab,
              screen === item && styles.screenTabActive,
            ]}
          >
            <Text
              style={[
                styles.screenTabText,
                screen === item && styles.screenTabTextActive,
              ]}
            >
              {coreReviewLabels[item]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.device}>
        <Screen name={screen} />
      </View>
    </View>
  );
}

function Screen({ name }: { name: CoreReviewScreen }) {
  switch (name) {
    case 'splash':
      return <Splash />;
    case 'onboarding':
      return <Onboarding />;
    case 'sign-up':
      return <SignUp />;
    case 'home':
      return <Home />;
    case 'chats':
      return <Chats />;
    case 'conversation':
      return <Conversation />;
    case 'discover':
      return <Discover />;
    case 'store':
      return <Store />;
  }
}

function Splash() {
  return (
    <View style={styles.splash}>
      <Image
        accessibilityLabel="TAVIRA"
        resizeMode="contain"
        source={taviraLogo}
        style={styles.splashLogo}
      />
      <Text style={styles.splashTagline}>Chat. Discover. Shop.</Text>
    </View>
  );
}

function Onboarding() {
  return (
    <ScreenScroll>
      <Image
        accessibilityLabel="TAVIRA"
        resizeMode="contain"
        source={taviraLogo}
        style={styles.onboardingLogo}
      />
      <Text style={styles.step}>1 OF 3</Text>
      <View style={styles.heroArt}>
        <Text style={styles.heroEmoji}>✦</Text>
        <View style={styles.heroBubble}>
          <Text style={styles.heroBubbleText}>Your people are here</Text>
        </View>
      </View>
      <Text style={styles.display}>Everything you care about, together.</Text>
      <Text style={styles.body}>
        Talk with friends, find communities, and discover Nigerian creators and
        products.
      </Text>
      <Button label="Get started" onPress={() => undefined} />
      <Pressable accessibilityRole="button" style={styles.textAction}>
        <Text style={styles.textActionLabel}>I already have an account</Text>
      </Pressable>
    </ScreenScroll>
  );
}

function SignUp() {
  return (
    <ScreenScroll>
      <TopBar title="Create account" />
      <Text style={styles.display}>Join TAVIRA</Text>
      <Text style={styles.body}>
        Use a phone number or email you can verify.
      </Text>
      <TextInput
        label="Phone or email"
        placeholder="you@example.com"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        placeholder="At least 10 characters"
        secureTextEntry
      />
      <Text style={styles.legal}>
        By continuing, you agree to the Terms and acknowledge the Privacy
        Notice.
      </Text>
      <Button label="Continue" onPress={() => undefined} />
    </ScreenScroll>
  );
}

function Home() {
  return (
    <AppScreen active="home">
      <ScreenScroll>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>GOOD MORNING</Text>
            <Text style={styles.headerTitle}>Amina</Text>
          </View>
          <View style={styles.headerActions}>
            <ActionButton label="Start call" symbol="☎" />
            <ActionButton label="Open TAVIRA SOS" symbol="SOS" danger />
          </View>
        </View>
        <View style={styles.heroCard}>
          <Text style={styles.heroCardEyebrow}>TODAY ON TAVIRA</Text>
          <Text style={styles.heroCardTitle}>New voices. Fresh finds.</Text>
          <Text style={styles.heroCardBody}>
            See what your communities and favourite creators are sharing.
          </Text>
        </View>
        <SectionTitle title="Recent chats" action="See all" />
        <ChatRow
          name="Tavira Creators"
          preview="Ada: The new collection is live"
          time="09:42"
          unreadCount={3}
          onPress={() => undefined}
        />
        <ChatRow
          name="Chidi Okafor"
          preview="See you at Balogun Market"
          time="Yesterday"
          onPress={() => undefined}
        />
        <SectionTitle title="Communities for you" action="Explore" />
        <View style={styles.communityCard}>
          <View style={styles.communityArt}>
            <Text style={styles.heroEmoji}>◎</Text>
          </View>
          <Text style={styles.cardTitle}>Made in Nigeria</Text>
          <Text style={styles.meta}>
            18.4K members · Fashion, design and craft
          </Text>
        </View>
      </ScreenScroll>
    </AppScreen>
  );
}

function Chats() {
  return (
    <AppScreen active="chats">
      <ScreenScroll>
        <TopBar title="Chats" action="＋" />
        <TextInput
          label="Search chats"
          placeholder="People, groups, or messages"
        />
        <View style={styles.filterRow}>
          <Pill label="All" active />
          <Pill label="Unread" />
          <Pill label="Groups" />
        </View>
        <ChatRow
          name="Tavira Creators"
          preview="Ada: The new collection is live"
          time="09:42"
          unreadCount={3}
          onPress={() => undefined}
        />
        <ChatRow
          name="Chidi Okafor"
          preview="See you at Balogun Market"
          time="Yesterday"
          onPress={() => undefined}
        />
        <ChatRow
          name="Design Friends"
          preview="You: I saved that room"
          time="Mon"
          onPress={() => undefined}
        />
      </ScreenScroll>
    </AppScreen>
  );
}

function Conversation() {
  return (
    <View style={styles.flex}>
      <View style={styles.conversationHeader}>
        <Text style={styles.back}>‹</Text>
        <Avatar name="Chidi Okafor" size="sm" />
        <View style={styles.flex}>
          <Text style={styles.menuLabel}>Chidi Okafor</Text>
          <Text style={styles.online}>Online</Text>
        </View>
        <ActionButton label="Start audio call" symbol="☎" />
        <ActionButton label="Start video call" symbol="▣" />
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.messages}>
        <Message side="received">Are you still coming to the market?</Message>
        <Message side="sent">Yes — I should be there around noon.</Message>
        <Message side="received">
          Perfect. I found the indigo fabric you wanted.
        </Message>
      </ScrollView>
      <View style={styles.composerTools}>
        {conversationActions.map((action) => (
          <ActionButton
            key={action.key}
            label={action.label}
            symbol={
              action.key === 'attachment'
                ? '＋'
                : action.key === 'emoji'
                  ? '☺'
                  : '✦'
            }
            accent={action.key === 'gift'}
          />
        ))}
      </View>
      <View style={styles.composer}>
        <View style={styles.composerInput}>
          <Text style={styles.meta}>Message Chidi…</Text>
        </View>
        <ActionButton label="Send message" symbol="➤" accent />
      </View>
    </View>
  );
}

function Discover() {
  return (
    <AppScreen active="discover">
      <ScreenScroll>
        <TopBar title="Discover" />
        <TextInput
          label="Search TAVIRA"
          placeholder="People, rooms, communities, products"
        />
        <View style={styles.filterRow}>
          <Pill label="For you" active />
          <Pill label="People" />
          <Pill label="Rooms" />
          <Pill label="Products" />
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.kickerLight}>LIVE ROOM</Text>
          <Text style={styles.featureTitle}>The future of African fashion</Text>
          <Text style={styles.featureBody}>
            Hosted by Nneka Studio · 2.1K listening
          </Text>
          <Button label="Join room" onPress={() => undefined} />
        </View>
        <SectionTitle title="Creators to know" action="See all" />
        <View style={styles.creatorRow}>
          <Creator name="Nneka" topic="Fashion" />
          <Creator name="Tobi" topic="Tech" />
          <Creator name="Zainab" topic="Food" />
        </View>
        <SectionTitle title="Trending now" />
        <View style={styles.trend}>
          <Text style={styles.rank}>01</Text>
          <View>
            <Text style={styles.cardTitle}>#MadeInNigeria</Text>
            <Text style={styles.meta}>24.8K conversations</Text>
          </View>
        </View>
      </ScreenScroll>
    </AppScreen>
  );
}

function Store() {
  const [category, setCategory] =
    useState<(typeof storeCategories)[number]>('For you');
  return (
    <AppScreen active="store">
      <ScreenScroll>
        <TopBar title="Store" action="Bag · 2" />
        <TextInput
          label="Search Store"
          placeholder="Products, sellers, and categories"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {storeCategories.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: category === item }}
              onPress={() => setCategory(item)}
            >
              <Pill label={item} active={category === item} />
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.storeBanner}>
          <Text style={styles.kickerLight}>CATEGORY SPOTLIGHT</Text>
          <Text style={styles.featureTitle}>
            {category === 'For you'
              ? 'Beautiful things, thoughtfully chosen.'
              : `${category}, curated for you.`}
          </Text>
          <Text style={styles.featureBody}>
            Prices and availability are revalidated at checkout.
          </Text>
        </View>
        <SectionTitle title="Popular today" action="Filter" />
        <View style={styles.productGrid}>
          <ProductCard
            name="Handwoven Indigo Tote"
            priceMinor={4250000}
            seller="Adire House Lagos"
            onPress={() => undefined}
          />
          <ProductCard
            name="Coral Beaded Bracelet"
            priceMinor={1250000}
            seller="Ife Craft"
            onPress={() => undefined}
          />
        </View>
      </ScreenScroll>
    </AppScreen>
  );
}

function AppScreen({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.flex}>{children}</View>
      <BottomNavigation
        items={bottomItems}
        activeKey={active}
        onChange={() => undefined}
      />
    </View>
  );
}
function ScreenScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.screenContent}
    >
      {children}
    </ScrollView>
  );
}
function TopBar({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.headerRow}>
      <Text accessibilityRole="header" style={styles.headerTitle}>
        {title}
      </Text>
      {action ? (
        <Pressable accessibilityRole="button" style={styles.topAction}>
          <Text style={styles.topActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function ActionButton({
  label,
  symbol,
  danger = false,
  accent = false,
}: {
  label: string;
  symbol: string;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.iconButton,
        danger && styles.iconButtonDanger,
        accent && styles.iconButtonAccent,
      ]}
    >
      <Text
        style={[
          styles.iconButtonText,
          (danger || accent) && styles.iconButtonTextLight,
        ]}
      >
        {symbol}
      </Text>
    </Pressable>
  );
}
function Pill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </View>
  );
}
function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.inlineBetween}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {action ? <Text style={styles.link}>{action}</Text> : null}
    </View>
  );
}
function Message({
  side,
  children,
}: {
  side: 'received' | 'sent';
  children: ReactNode;
}) {
  return (
    <View style={[styles.message, side === 'sent' && styles.messageSent]}>
      <Text
        style={[styles.messageText, side === 'sent' && styles.messageTextSent]}
      >
        {children}
      </Text>
      <Text
        style={[styles.messageTime, side === 'sent' && styles.messageTextSent]}
      >
        10:24
      </Text>
    </View>
  );
}
function Creator({ name, topic }: { name: string; topic: string }) {
  return (
    <View style={styles.creator}>
      <Avatar name={name} size="lg" />
      <Text style={styles.menuLabel}>{name}</Text>
      <Text style={styles.meta}>{topic}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  reviewCanvas: {
    backgroundColor: '#EDEAF2',
    flex: 1,
    paddingTop: tokens.space.x3,
  },
  screenPicker: { gap: tokens.space.x2, padding: tokens.space.x3 },
  screenTab: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.full,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x4,
  },
  screenTabActive: { backgroundColor: tokens.color.primary },
  screenTabText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
  },
  screenTabTextActive: { color: tokens.color.surface },
  device: {
    alignSelf: 'center',
    backgroundColor: tokens.color.canvas,
    borderRadius: tokens.radius.xl,
    flex: 1,
    maxWidth: 430,
    overflow: 'hidden',
    width: '100%',
    ...tokens.shadow.card,
  },
  screenContent: {
    gap: tokens.space.x5,
    padding: tokens.space.x5,
    paddingBottom: tokens.space.x12,
    paddingTop: tokens.space.x8,
  },
  splash: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    flex: 1,
    justifyContent: 'center',
    padding: tokens.space.x6,
  },
  splashLogo: { height: 112, width: '92%' },
  onboardingLogo: { alignSelf: 'flex-start', height: 40, width: 148 },
  splashTagline: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.strong,
    marginTop: tokens.space.x3,
  },
  step: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    letterSpacing: 2,
  },
  heroArt: {
    alignItems: 'center',
    backgroundColor: tokens.color.gold,
    borderRadius: tokens.radius.xl,
    height: 260,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroEmoji: { color: tokens.color.primary, fontSize: 64 },
  heroBubble: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.full,
    bottom: tokens.space.x5,
    paddingHorizontal: tokens.space.x4,
    paddingVertical: tokens.space.x3,
    position: 'absolute',
  },
  heroBubbleText: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.strong,
  },
  display: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
    lineHeight: 24,
  },
  textAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.size.touch,
  },
  textActionLabel: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
  },
  legal: {
    color: tokens.color.inkMuted,
    fontSize: tokens.typography.size.caption,
    lineHeight: 18,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.space.x3,
    justifyContent: 'space-between',
  },
  headerActions: { flexDirection: 'row', gap: tokens.space.x2 },
  kicker: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
    letterSpacing: 1.5,
  },
  kickerLight: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 28,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    height: tokens.size.touch,
    justifyContent: 'center',
    minWidth: tokens.size.touch,
    paddingHorizontal: tokens.space.x2,
  },
  iconButtonDanger: {
    backgroundColor: tokens.color.danger,
    borderColor: tokens.color.danger,
  },
  iconButtonAccent: {
    backgroundColor: tokens.color.accent,
    borderColor: tokens.color.accent,
  },
  iconButtonText: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.strong,
  },
  iconButtonTextLight: { color: tokens.color.surface },
  heroCard: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x2,
    minHeight: 180,
    padding: tokens.space.x5,
  },
  heroCardEyebrow: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.strong,
    letterSpacing: 1.5,
  },
  heroCardTitle: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.display,
    fontSize: 28,
  },
  heroCardBody: { color: '#D9D5EA', lineHeight: 22 },
  inlineBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.space.x2,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  link: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
  },
  communityCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    gap: tokens.space.x2,
    overflow: 'hidden',
    paddingBottom: tokens.space.x4,
    ...tokens.shadow.card,
  },
  communityArt: {
    alignItems: 'center',
    backgroundColor: '#FCE9D0',
    height: 130,
    justifyContent: 'center',
  },
  cardTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
    paddingHorizontal: tokens.space.x4,
  },
  meta: {
    color: tokens.color.inkMuted,
    fontSize: tokens.typography.size.caption,
    paddingHorizontal: tokens.space.x4,
  },
  topAction: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.full,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x4,
  },
  topActionText: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
  },
  filterRow: { flexDirection: 'row', gap: tokens.space.x2 },
  pill: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: tokens.space.x4,
  },
  pillActive: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  pillText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
  },
  pillTextActive: { color: tokens.color.surface },
  conversationHeader: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderBottomColor: tokens.color.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: tokens.space.x2,
    minHeight: 72,
    paddingHorizontal: tokens.space.x3,
  },
  back: { color: tokens.color.primary, fontSize: 36 },
  menuLabel: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  online: { color: '#14804A', fontSize: tokens.typography.size.caption },
  messages: { gap: tokens.space.x3, padding: tokens.space.x4 },
  message: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    gap: tokens.space.x1,
    maxWidth: '82%',
    padding: tokens.space.x3,
  },
  messageSent: { alignSelf: 'flex-end', backgroundColor: tokens.color.primary },
  messageText: { color: tokens.color.ink, lineHeight: 22 },
  messageTextSent: { color: tokens.color.surface },
  messageTime: {
    color: tokens.color.inkMuted,
    fontSize: 10,
    textAlign: 'right',
  },
  composerTools: {
    backgroundColor: tokens.color.surface,
    flexDirection: 'row',
    gap: tokens.space.x2,
    paddingHorizontal: tokens.space.x3,
    paddingTop: tokens.space.x2,
  },
  composer: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    flexDirection: 'row',
    gap: tokens.space.x2,
    padding: tokens.space.x3,
  },
  composerInput: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
  },
  featureCard: {
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x3,
    padding: tokens.space.x5,
  },
  featureTitle: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.display,
    fontSize: 26,
  },
  featureBody: { color: tokens.color.surface, lineHeight: 22 },
  creatorRow: {
    flexDirection: 'row',
    gap: tokens.space.x4,
    justifyContent: 'space-around',
  },
  creator: { alignItems: 'center', gap: tokens.space.x1 },
  trend: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 72,
    padding: tokens.space.x3,
  },
  rank: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.display,
    fontSize: 28,
  },
  storeBanner: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x2,
    minHeight: 160,
    padding: tokens.space.x5,
  },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.x3 },
});

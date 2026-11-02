import { useState, type ReactNode } from 'react';
import { Link } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import {
  Avatar,
  BottomNavigation,
  ChatRow,
  Chip,
  ProductCard,
  tokens,
} from '@tavira/ui';
import taviraLogo from '../assets/tavira-logo.png';
import featuredFounders from '../assets/review/featured-founders.png';
import liveMusic from '../assets/review/live-music.png';
import indigoTote from '../assets/review/indigo-tote.png';
import clayVase from '../assets/review/clay-vase.png';

type Tab = 'home' | 'chats' | 'discover' | 'store' | 'profile';
const navIconStyle = {
  color: '#17133F',
  fontSize: 18,
  lineHeight: 20,
} as const;
const navigation = [
  { key: 'home', label: 'Home', icon: <Text style={navIconStyle}>⌂</Text> },
  { key: 'chats', label: 'Chats', icon: <Text style={navIconStyle}>◉</Text> },
  {
    key: 'discover',
    label: 'Discover',
    icon: <Text style={navIconStyle}>◇</Text>,
  },
  { key: 'store', label: 'Store', icon: <Text style={navIconStyle}>▱</Text> },
  {
    key: 'profile',
    label: 'Profile',
    icon: <Text style={navIconStyle}>○</Text>,
  },
] as const;

export default function TeamPreview() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  return (
    <View style={styles.screen}>
      <View style={styles.brandBar}>
        <Image source={taviraLogo} resizeMode="contain" style={styles.logo} />
        <View style={styles.brandActions}>
          <RoundButton label="Search" symbol="⌕" />
          <RoundButton
            label="Notifications, two unread"
            symbol="♢"
            notification
          />
        </View>
      </View>
      {activeTab === 'home' ? <Home onNavigate={setActiveTab} /> : null}
      {activeTab === 'chats' ? <Chats /> : null}
      {activeTab === 'discover' ? <Discover /> : null}
      {activeTab === 'store' ? <Store /> : null}
      {activeTab === 'profile' ? <Profile /> : null}
      <Link href="/sos-review" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open TAVIRA SOS emergency assistance"
          style={styles.sosButton}
        >
          <View style={styles.sosPulse} />
          <Text style={styles.sosIcon}>!</Text>
          <Text style={styles.sosLabel}>SOS</Text>
        </Pressable>
      </Link>
      <BottomNavigation
        items={navigation}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as Tab)}
      />
    </View>
  );
}

function Page({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.page}
    >
      {children}
    </ScrollView>
  );
}
function RoundButton({
  label,
  symbol,
  notification = false,
}: {
  label: string;
  symbol: string;
  notification?: boolean;
}) {
  return (
    <Pressable accessibilityLabel={label} style={styles.roundButton}>
      <Text style={styles.roundButtonText}>{symbol}</Text>
      {notification ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  );
}
function Home({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <Page>
      <View style={styles.welcomeRow}>
        <View style={styles.flex}>
          <Text style={styles.kicker}>GOOD MORNING</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Welcome to TAVIRA
          </Text>
          <Text style={styles.subtitle}>
            Your people, passions, and marketplace.
          </Text>
        </View>
        <Avatar name="Tavira Member" size="lg" />
      </View>
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroEyebrow}>
          ONE COMMUNITY. MANY POSSIBILITIES.
        </Text>
        <Text style={styles.heroTitle}>Connect. Discover. Grow.</Text>
        <Text style={styles.heroCopy}>
          Meet people who share your interests, join live conversations, and
          support trusted African creators.
        </Text>
        <Pressable
          onPress={() => onNavigate('discover')}
          style={styles.heroButton}
        >
          <Text style={styles.heroButtonText}>Explore TAVIRA</Text>
          <Text style={styles.heroButtonText}>→</Text>
        </Pressable>
      </View>
      <SectionHeader
        title="Continue exploring"
        action="See all"
        onPress={() => onNavigate('discover')}
      />
      <View style={styles.quickGrid}>
        <QuickCard
          icon="♬"
          tone="#FFE7E8"
          title="Live rooms"
          detail="12 live now"
        />
        <QuickCard
          icon="◎"
          tone="#E8E7F3"
          title="Communities"
          detail="Find your circle"
        />
        <QuickCard
          icon="✦"
          tone="#FFF3D5"
          title="Creators"
          detail="Fresh stories"
        />
        <QuickCard
          icon="▱"
          tone="#F2E8F5"
          title="Marketplace"
          detail="Shop local"
        />
      </View>
      <SectionHeader
        title="Happening now"
        action="View rooms"
        onPress={() => onNavigate('discover')}
      />
      <View style={styles.liveCard}>
        <Image source={liveMusic} resizeMode="cover" style={styles.liveImage} />
        <View style={styles.liveTop}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>● LIVE</Text>
          </View>
          <Text style={styles.meta}>128 listening</Text>
        </View>
        <Text style={styles.cardTitle}>Building bold African brands</Text>
        <Text style={styles.cardCopy}>
          A candid conversation with founders shaping culture through design.
        </Text>
        <View style={styles.liveBottom}>
          <View style={styles.avatarStack}>
            <Avatar name="Amara" size="sm" />
            <Avatar name="Kofi" size="sm" />
            <Avatar name="Zainab" size="sm" />
          </View>
          <Text style={styles.joinText}>Join conversation →</Text>
        </View>
      </View>
      <SectionHeader
        title="Made for you"
        action="Open store"
        onPress={() => onNavigate('store')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.productRow}>
          <ProductCard
            name="Handwoven Indigo Tote"
            priceMinor={4250000}
            imageSource={indigoTote}
            seller="Adire House Lagos"
            onPress={() => onNavigate('store')}
          />
          <ProductCard
            name="Minimal Clay Vase"
            priceMinor={2850000}
            imageSource={clayVase}
            seller="Earth & Form"
            onPress={() => onNavigate('store')}
          />
        </View>
      </ScrollView>
    </Page>
  );
}
function Chats() {
  return (
    <Page>
      <PageHeading
        title="Messages"
        subtitle="Conversations that move you forward."
      />
      <Filters labels={['All', 'Unread', 'Communities']} />
      <View style={styles.listCard}>
        <ChatRow
          name="TAVIRA Creators"
          preview="Amara shared a new collection"
          time="09:42"
          unreadCount={3}
          onPress={() => undefined}
        />
        <ChatRow
          name="Chidi Okafor"
          preview="See you at the market tomorrow"
          time="08:15"
          unreadCount={1}
          onPress={() => undefined}
        />
        <ChatRow
          name="Women in Product Africa"
          preview="Live room starts in 20 minutes"
          time="Yesterday"
          onPress={() => undefined}
        />
        <ChatRow
          name="Kofi Mensah"
          preview="That idea has real potential!"
          time="Mon"
          onPress={() => undefined}
        />
      </View>
      <Pressable
        accessibilityLabel="Start a new chat"
        style={styles.floatingAction}
      >
        <Text style={styles.floatingActionText}>＋</Text>
        <Text style={styles.floatingActionLabel}>New chat</Text>
      </Pressable>
    </Page>
  );
}
function Discover() {
  return (
    <Page>
      <PageHeading
        title="Discover"
        subtitle="Fresh voices, ideas, and communities."
      />
      <Filters labels={['For you', 'Trending', 'Nearby']} />
      <FeatureCard
        eyebrow="FEATURED COMMUNITY"
        title="The Creative Economy"
        detail="8.4k members · Design, film, music, and culture"
        imageSource={featuredFounders}
      />
      <SectionHeader title="Trending conversations" />
      <TopicCard
        number="01"
        title="What makes a city feel like home?"
        meta="Culture & Society · 342 replies"
      />
      <TopicCard
        number="02"
        title="Building globally from Africa"
        meta="Business · 218 replies"
      />
      <TopicCard
        number="03"
        title="New sounds from the continent"
        meta="Music · 176 replies"
      />
      <SectionHeader title="Communities to join" />
      <CommunityRow icon="✦" title="Women Who Build" members="12.8k members" />
      <CommunityRow icon="◒" title="The Food Table" members="7.1k members" />
      <CommunityRow
        icon="◇"
        title="Future of Work Africa"
        members="9.6k members"
      />
    </Page>
  );
}
function Store() {
  return (
    <Page>
      <PageHeading
        title="Marketplace"
        subtitle="Distinctive goods from trusted creators."
      />
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Search products and creators</Text>
      </View>
      <Filters labels={['Featured', 'Fashion', 'Home', 'Art']} />
      <FeatureCard
        eyebrow="CREATOR SPOTLIGHT"
        title="Objects with a story"
        detail="Meet makers turning heritage techniques into modern essentials."
        imageSource={featuredFounders}
      />
      <SectionHeader title="Editor’s picks" action="See all" />
      <View style={styles.productGrid}>
        <ProductCard
          name="Handwoven Indigo Tote"
          priceMinor={4250000}
          imageSource={indigoTote}
          seller="Adire House Lagos"
          onPress={() => undefined}
        />
        <ProductCard
          name="Minimal Clay Vase"
          priceMinor={2850000}
          imageSource={clayVase}
          seller="Earth & Form"
          onPress={() => undefined}
        />
      </View>
    </Page>
  );
}
function Profile() {
  return (
    <Page>
      <View style={styles.profileHeader}>
        <Avatar name="Tavira Member" size="lg" />
        <Text style={styles.profileName}>Tavira Member</Text>
        <Text style={styles.profileHandle}>
          @tavira.member · Lagos, Nigeria
        </Text>
        <View style={styles.profileStats}>
          <Stat value="12" label="Communities" />
          <Stat value="248" label="Connections" />
          <Stat value="18" label="Saved" />
        </View>
      </View>
      <Link href="/identity/account" asChild>
        <Pressable style={styles.primaryWide}>
          <Text style={styles.primaryWideText}>Manage account</Text>
        </Pressable>
      </Link>
      <View style={styles.settingsCard}>
        <Setting icon="◇" label="My communities" />
        <Setting icon="♡" label="Saved items" />
        <Setting icon="▱" label="Orders and payments" />
        <Setting icon="♢" label="Notifications" />
        <Setting icon="⚙" label="Privacy and safety" />
      </View>
      <View style={styles.reviewPanel}>
        <Text style={styles.reviewLabel}>TEAM REVIEW TOOLS</Text>
        <Text style={styles.reviewCopy}>
          Prototype flows for structured product feedback.
        </Text>
        <View style={styles.reviewLinks}>
          <ReviewLink href="/core-review" label="Core screens" />
          <ReviewLink href="/profile-review" label="Profile & ads" />
          <ReviewLink href="/sos-review" label="TAVIRA SOS" />
          <ReviewLink href="/identity/register" label="Identity flow" />
        </View>
      </View>
    </Page>
  );
}

function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}
function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={styles.sectionAction}>{action} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function Filters({ labels }: { labels: string[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filterRow}>
        {labels.map((label, index) => (
          <Chip
            key={label}
            label={label}
            selected={index === 0}
            onPress={() => undefined}
          />
        ))}
      </View>
    </ScrollView>
  );
}
function QuickCard({
  icon,
  title,
  detail,
  tone,
}: {
  icon: string;
  title: string;
  detail: string;
  tone: string;
}) {
  return (
    <Pressable style={styles.quickCard}>
      <View style={[styles.quickIcon, { backgroundColor: tone }]}>
        <Text style={styles.quickIconText}>{icon}</Text>
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickDetail}>{detail}</Text>
    </Pressable>
  );
}
function FeatureCard({
  eyebrow,
  title,
  detail,
  imageSource,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  imageSource: ImageSourcePropType;
}) {
  return (
    <View style={styles.featureCard}>
      <Image
        source={imageSource}
        resizeMode="cover"
        style={styles.featureImage}
      />
      <View style={styles.featureScrim} />
      <Text style={styles.featureEyebrow}>{eyebrow}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDetail}>{detail}</Text>
      <Text style={styles.featureLink}>Explore now →</Text>
    </View>
  );
}
function TopicCard({
  number,
  title,
  meta,
}: {
  number: string;
  title: string;
  meta: string;
}) {
  return (
    <Pressable style={styles.topicCard}>
      <Text style={styles.topicNumber}>{number}</Text>
      <View style={styles.flex}>
        <Text style={styles.topicTitle}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}
function CommunityRow({
  icon,
  title,
  members,
}: {
  icon: string;
  title: string;
  members: string;
}) {
  return (
    <View style={styles.communityRow}>
      <View style={styles.communityIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.topicTitle}>{title}</Text>
        <Text style={styles.meta}>{members}</Text>
      </View>
      <Pressable style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join</Text>
      </Pressable>
    </View>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
function Setting({ icon, label }: { icon: string; label: string }) {
  return (
    <Pressable style={styles.setting}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}
function ReviewLink({
  href,
  label,
}: {
  href:
    | '/core-review'
    | '/profile-review'
    | '/sos-review'
    | '/identity/register';
  label: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.reviewChip}>
        <Text style={styles.reviewChipText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.color.canvas },
  flex: { flex: 1 },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 10,
  },
  logo: { width: 126, height: 42 },
  brandActions: { flexDirection: 'row', gap: 10 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: tokens.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  roundButtonText: { color: tokens.color.primary, fontSize: 22 },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: tokens.color.accent,
  },
  page: { padding: 20, paddingBottom: 40, gap: 22 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  kicker: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    fontSize: 11,
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  title: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  hero: {
    overflow: 'hidden',
    borderRadius: 26,
    backgroundColor: tokens.color.primary,
    padding: 24,
    minHeight: 260,
    justifyContent: 'flex-end',
  },
  heroGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: tokens.color.accent,
    opacity: 0.32,
    right: -70,
    top: -85,
  },
  heroEyebrow: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.strong,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.display,
    fontSize: 29,
    lineHeight: 36,
  },
  heroCopy: {
    color: '#D7D3E7',
    fontFamily: tokens.typography.family.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 20,
    backgroundColor: tokens.color.accent,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  heroButtonText: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.strong,
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.display,
    fontSize: 20,
  },
  sectionAction: {
    color: tokens.color.accent,
    backgroundColor: '#FFE7E8',
    borderRadius: 999,
    fontFamily: tokens.typography.family.strong,
    fontSize: 13,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    width: '48%',
    backgroundColor: tokens.color.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quickIconText: { fontSize: 20, color: tokens.color.primary },
  quickTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: 15,
  },
  quickDetail: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 12,
    marginTop: 4,
  },
  liveCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  liveImage: {
    borderRadius: 16,
    height: 170,
    marginBottom: 18,
    width: '100%',
  },
  liveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: '#FFE7E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveBadgeText: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    fontSize: 11,
  },
  cardTitle: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 21,
    marginTop: 18,
  },
  cardCopy: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },
  liveBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  avatarStack: { flexDirection: 'row', gap: 4 },
  joinText: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    fontSize: 12,
  },
  productRow: { flexDirection: 'row', gap: 12, paddingBottom: 4 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  navIcon: { color: tokens.color.primary, fontSize: 18, lineHeight: 20 },
  filterRow: { flexDirection: 'row', gap: 8 },
  listCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: 22,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  floatingAction: {
    alignSelf: 'flex-end',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: tokens.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 18,
  },
  floatingActionText: { color: tokens.color.surface, fontSize: 22 },
  floatingActionLabel: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.strong,
    fontSize: 14,
  },
  featureCard: {
    backgroundColor: '#EEEAF8',
    borderRadius: 22,
    overflow: 'hidden',
    padding: 24,
    minHeight: 280,
    justifyContent: 'flex-end',
  },
  featureImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  featureScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,19,63,0.62)',
  },
  featureEyebrow: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  featureTitle: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.display,
    fontSize: 26,
    marginTop: 10,
  },
  featureDetail: {
    color: '#E8E5F2',
    fontFamily: tokens.typography.family.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  featureLink: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.strong,
    fontSize: 13,
    marginTop: 18,
  },
  topicCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  topicNumber: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.display,
    fontSize: 16,
  },
  topicTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: 15,
  },
  meta: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 12,
    marginTop: 4,
  },
  chevron: { color: tokens.color.inkMuted, fontSize: 26 },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.surface,
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  communityIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEEAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: tokens.color.primary,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  joinButtonText: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.strong,
    fontSize: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: tokens.color.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  searchIcon: { color: tokens.color.primary, fontSize: 20 },
  searchText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 14,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  profileName: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 24,
    marginTop: 14,
  },
  profileHandle: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 13,
    marginTop: 4,
  },
  profileStats: { flexDirection: 'row', marginTop: 22 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 20,
  },
  statLabel: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 11,
    marginTop: 3,
  },
  primaryWide: {
    backgroundColor: tokens.color.primary,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  primaryWideText: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.strong,
    fontSize: 14,
  },
  settingsCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEEAF3',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.color.border,
  },
  settingIcon: { fontSize: 18, color: tokens.color.primary, width: 24 },
  settingLabel: {
    flex: 1,
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: 14,
  },
  reviewPanel: { backgroundColor: '#FFF4E1', borderRadius: 20, padding: 18 },
  reviewLabel: {
    color: '#8A5A00',
    fontFamily: tokens.typography.family.strong,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  reviewCopy: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: 13,
    marginTop: 8,
  },
  reviewLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  reviewChip: {
    backgroundColor: tokens.color.surface,
    borderColor: '#E3C98C',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  reviewChipText: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.strong,
    fontSize: 11,
  },
  sosButton: {
    alignItems: 'center',
    backgroundColor: '#B42318',
    borderColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 3,
    bottom: 82,
    elevation: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 56,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 16,
    shadowColor: '#B42318',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 20,
  },
  sosPulse: {
    backgroundColor: '#FF8A80',
    borderRadius: 34,
    bottom: -7,
    left: -7,
    opacity: 0.2,
    position: 'absolute',
    right: -7,
    top: -7,
  },
  sosIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    color: '#B42318',
    fontFamily: tokens.typography.family.strong,
    fontSize: 14,
    height: 23,
    lineHeight: 23,
    textAlign: 'center',
    width: 23,
  },
  sosLabel: {
    color: '#FFFFFF',
    fontFamily: tokens.typography.family.display,
    fontSize: 15,
    letterSpacing: 0.7,
  },
});

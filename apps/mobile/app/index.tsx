import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts as useInter,
} from '@expo-google-fonts/inter';
import {
  Manrope_700Bold,
  useFonts as useManrope,
} from '@expo-google-fonts/manrope';
import {
  Avatar,
  BottomNavigation,
  Button,
  ChatRow,
  Chip,
  EmptyState,
  Modal,
  ProductCard,
  Sheet,
  Skeleton,
  TextInput,
  Toast,
  tokens,
} from '@tavira/ui';

const nav = ['Home', 'Chats', 'Discover', 'Store', 'Profile'].map((label) => ({
  key: label.toLowerCase(),
  label,
  icon: <Text>●</Text>,
}));
export default function Gallery() {
  const [active, setActive] = useState('home');
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [interLoaded] = useInter({ Inter_400Regular, Inter_600SemiBold });
  const [manropeLoaded] = useManrope({ Manrope_700Bold });
  if (!interLoaded || !manropeLoaded) return null;
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>TAVIRA DESIGN SYSTEM</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Component gallery
        </Text>
        <Text style={styles.subtitle}>Chat. Discover. Shop.</Text>
        <Link
          href="/core-review"
          accessibilityRole="link"
          style={styles.reviewLink}
        >
          Open core screen review →
        </Link>
        <Link
          href="/profile-review"
          accessibilityRole="link"
          style={styles.reviewLink}
        >
          Open Profile, Verification, and Ads review →
        </Link>
        <Link
          href="/sos-review"
          accessibilityRole="link"
          style={styles.reviewLink}
        >
          Open TAVIRA SOS review →
        </Link>
        <Section title="Buttons">
          <View style={styles.row}>
            <Button label="Continue" onPress={() => undefined} />
            <Button label="Loading" loading onPress={() => undefined} />
            <Button label="Disabled" disabled onPress={() => undefined} />
          </View>
        </Section>
        <Section title="Inputs">
          <TextInput label="Display name" placeholder="How people know you" />
          <TextInput
            label="Username"
            value="taken"
            error="That username is unavailable"
          />
          <TextInput label="Disabled" editable={false} value="Unavailable" />
        </Section>
        <Section title="Avatars">
          <View style={styles.row}>
            <Avatar name="Ada" size="sm" />
            <Avatar name="Tavira Community" />
            <Avatar name="Creator" size="lg" />
          </View>
        </Section>
        <Section title="Chips">
          <View style={styles.row}>
            <Chip label="For you" selected onPress={() => undefined} />
            <Chip label="Communities" onPress={() => undefined} />
            <Chip label="Unavailable" disabled onPress={() => undefined} />
          </View>
        </Section>
        <Section title="Chats">
          <ChatRow
            name="Tavira Creators"
            preview="Amina sent a photo"
            time="09:42"
            unreadCount={3}
            onPress={() => undefined}
          />
          <ChatRow
            name="Chidi Okafor"
            preview="See you at the market"
            time="Yesterday"
            onPress={() => undefined}
          />
        </Section>
        <Section title="Products">
          <View style={styles.row}>
            <ProductCard
              name="Handwoven Indigo Tote"
              priceMinor={4250000}
              seller="Adire House Lagos"
              onPress={() => undefined}
            />
            <ProductCard
              name="Loading product"
              priceMinor={0}
              seller="Seller"
              loading
              onPress={() => undefined}
            />
          </View>
        </Section>
        <Section title="Loading">
          <Skeleton height={160} radius="lg" />
          <Skeleton width="62%" height={20} />
          <Skeleton width="38%" height={16} />
        </Section>
        <Section title="Empty state">
          <EmptyState
            title="Nothing saved yet"
            description="Products, rooms, channels, and creators you save will appear here."
            actionLabel="Start discovering"
            onAction={() => undefined}
          />
        </Section>
        <Section title="Feedback">
          <Toast
            message="Your preferences were saved."
            tone="success"
            actionLabel="Undo"
            onAction={() => undefined}
          />
          <Toast message="We could not send that message." tone="error" />
        </Section>
        <Section title="Overlays">
          <View style={styles.row}>
            <Button label="Open modal" onPress={() => setModalVisible(true)} />
            <Button label="Open sheet" onPress={() => setSheetVisible(true)} />
          </View>
        </Section>
      </ScrollView>
      <BottomNavigation items={nav} activeKey={active} onChange={setActive} />
      <Modal
        visible={modalVisible}
        title="Confirm action"
        onClose={() => setModalVisible(false)}
      >
        <Text style={styles.subtitle}>
          Review the details before you continue.
        </Text>
        <Button label="Confirm" onPress={() => setModalVisible(false)} />
      </Modal>
      <Sheet
        visible={sheetVisible}
        title="Choose an option"
        onClose={() => setSheetVisible(false)}
      >
        <Chip label="First option" selected onPress={() => undefined} />
        <Chip label="Second option" onPress={() => undefined} />
      </Sheet>
    </View>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { backgroundColor: tokens.color.canvas, flex: 1 },
  content: {
    gap: tokens.space.x8,
    padding: tokens.space.x5,
    paddingTop: tokens.space.x16,
  },
  eyebrow: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    letterSpacing: 2,
  },
  title: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.display,
  },
  subtitle: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
  },
  reviewLink: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    minHeight: tokens.size.touch,
    paddingVertical: tokens.space.x3,
  },
  section: { gap: tokens.space.x3 },
  sectionTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.x3 },
});

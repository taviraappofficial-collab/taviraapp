import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Chip, TextInput, tokens } from '@tavira/ui';
import {
  sosDeliveryStates,
  sosReviewLabels,
  sosReviewStates,
} from './sos-model';
import type { SosReviewState } from './sos-model';

export default function SosReview() {
  const [state, setState] = useState<SosReviewState>('safety-centre');

  return (
    <View style={styles.canvas}>
      <ScrollView
        horizontal
        accessibilityRole="tablist"
        contentContainerStyle={styles.tabs}
        showsHorizontalScrollIndicator={false}
      >
        {sosReviewStates.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: state === item }}
            onPress={() => setState(item)}
            style={[styles.tab, state === item && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, state === item && styles.tabTextActive]}
            >
              {sosReviewLabels[item]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.device}>
        <SosScreen state={state} />
      </View>
    </View>
  );
}

function SosScreen({ state }: { state: SosReviewState }) {
  switch (state) {
    case 'safety-centre':
      return <SafetyCentre />;
    case 'trusted-contacts':
      return <TrustedContacts />;
    case 'confirmation':
      return <Confirmation />;
    case 'active':
      return <ActiveSos />;
    case 'recipient':
      return <RecipientView />;
    case 'safe-confirmation':
      return <SafeConfirmation />;
  }
}

function SafetyCentre() {
  return (
    <Page>
      <Header title="Safety Centre" />
      <View style={styles.safetyHero}>
        <Text style={styles.shield}>◇</Text>
        <Text style={styles.heroTitle}>Help is easier to reach.</Text>
        <Text style={styles.heroBody}>
          TAVIRA SOS alerts only the trusted contacts you choose. It does not
          replace official emergency services.
        </Text>
      </View>
      <MenuItem
        title="TAVIRA SOS"
        description="Review setup and emergency alert controls"
        status="Not active"
      />
      <MenuItem
        title="Trusted contacts"
        description="3 contacts · Mum is primary"
      />
      <MenuItem
        title="Location permissions"
        description="Only while an SOS is active"
        status="Allowed"
      />
      <MenuItem
        title="Test alert"
        description="Send a clearly labelled test to selected contacts"
      />
      <Notice>
        Production alert delivery and location tracking remain disabled pending
        privacy, platform, and provider approval.
      </Notice>
    </Page>
  );
}

function TrustedContacts() {
  return (
    <Page>
      <Header title="Trusted contacts" />
      <Text style={styles.body}>
        Only people you deliberately add can receive an SOS. Your address book
        is never alerted automatically.
      </Text>
      <Contact name="Mum" detail="Verified TAVIRA contact" primary />
      <Contact name="Kunle Adeyemi" detail="Verified phone · secure link" />
      <Contact name="Amara" detail="Verification pending" />
      <Button label="Add trusted contact" onPress={() => undefined} />
      <Chip label="Silent SOS disabled" onPress={() => undefined} />
      <Notice>
        Silent SOS requires a separate explanation and explicit consent before
        it can be enabled.
      </Notice>
    </Page>
  );
}

function Confirmation() {
  return (
    <Page tone="danger">
      <Badge label="EMERGENCY ALERT" tone="coral" />
      <Text style={styles.confirmTitle}>Send SOS to 3 trusted contacts?</Text>
      <Text style={styles.confirmBody}>
        Your permitted current or last-known location will be shared through
        secure, time-limited links.
      </Text>
      <View style={styles.countdown}>
        <Text style={styles.countdownNumber}>3</Text>
        <Text style={styles.countdownLabel}>Press and hold to send</Text>
        <View style={styles.progress}>
          <View style={styles.progressFill} />
        </View>
      </View>
      <Button label="Hold for 3 seconds" onPress={() => undefined} />
      <Pressable accessibilityRole="button" style={styles.cancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Notice>This prototype never dispatches an alert.</Notice>
    </Page>
  );
}

function ActiveSos() {
  return (
    <Page tone="danger">
      <View style={styles.inlineBetween}>
        <Badge label="SOS ACTIVE" tone="coral" />
        <Text style={styles.elapsed}>02:18</Text>
      </View>
      <Text style={styles.confirmTitle}>
        Your trusted contacts are being updated.
      </Text>
      <View style={styles.locationCard}>
        <Text style={styles.cardLabel}>LOCATION</Text>
        <Text style={styles.locationTitle}>Live · updated 8 seconds ago</Text>
        <Text style={styles.body}>
          Lekki Phase 1, Lagos · approximate preview
        </Text>
      </View>
      {sosDeliveryStates.map((delivery) => (
        <View key={delivery.recipient} style={styles.delivery}>
          <View>
            <Text style={styles.itemTitle}>{delivery.recipient}</Text>
            <Text style={styles.itemDescription}>{delivery.channel}</Text>
          </View>
          <Badge
            label={delivery.status}
            tone={delivery.status === 'Queued' ? 'neutral' : 'gold'}
          />
        </View>
      ))}
      <View style={styles.actionRow}>
        <Button label="Call contact" onPress={() => undefined} />
        <Button label="I am safe" onPress={() => undefined} />
      </View>
      <Notice>
        An active call does not stop SOS tracking. Failed recipients retry
        independently.
      </Notice>
    </Page>
  );
}

function RecipientView() {
  return (
    <Page>
      <Badge label="TAVIRA SOS" tone="coral" />
      <Text style={styles.confirmTitle}>Amina may need your help.</Text>
      <Text style={styles.confirmBody}>
        Alert started at 14:32 WAT. This secure preview expires in 58 minutes.
      </Text>
      <View style={styles.map}>
        <Text style={styles.mapPin}>●</Text>
        <Text style={styles.locationTitle}>Last known location</Text>
        <Text style={styles.body}>Updated 24 seconds ago</Text>
      </View>
      <Button label="Acknowledge alert" onPress={() => undefined} />
      <View style={styles.actionRow}>
        <Button label="Call Amina" onPress={() => undefined} />
        <Button label="Message" onPress={() => undefined} />
      </View>
      <Notice>
        If there is immediate danger, contact the appropriate local emergency
        service. TAVIRA is not an emergency service.
      </Notice>
    </Page>
  );
}

function SafeConfirmation() {
  return (
    <Page>
      <Header title="End SOS" />
      <Text style={styles.confirmTitle}>Confirm that you are safe</Text>
      <Text style={styles.confirmBody}>
        Ending the session stops background location updates immediately and
        tells your trusted contacts the SOS has ended.
      </Text>
      <TextInput
        label="Account PIN"
        placeholder="Enter PIN"
        secureTextEntry
        keyboardType="number-pad"
      />
      <Button label="Confirm safe and end SOS" onPress={() => undefined} />
      <Pressable accessibilityRole="button" style={styles.cancel}>
        <Text style={styles.cancelText}>Keep SOS active</Text>
      </Pressable>
      <Notice>
        Biometric, password, or PIN reauthentication is required where
        available.
      </Notice>
    </Page>
  );
}

function Page({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'danger';
}) {
  return (
    <ScrollView
      style={[styles.page, tone === 'danger' && styles.pageDanger]}
      contentContainerStyle={styles.content}
    >
      {children}
    </ScrollView>
  );
}
function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.back}>‹</Text>
      <Text accessibilityRole="header" style={styles.headerTitle}>
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
function MenuItem({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status?: string;
}) {
  return (
    <Pressable accessibilityRole="button" style={styles.menuItem}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>●</Text>
      </View>
      <View style={styles.itemCopy}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      {status ? (
        <Badge label={status} tone="neutral" />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </Pressable>
  );
}
function Contact({
  name,
  detail,
  primary = false,
}: {
  name: string;
  detail: string;
  primary?: boolean;
}) {
  return (
    <View style={styles.contact}>
      <View style={styles.contactAvatar}>
        <Text style={styles.contactInitial}>{name.slice(0, 1)}</Text>
      </View>
      <View style={styles.itemCopy}>
        <View style={styles.inline}>
          <Text style={styles.itemTitle}>{name}</Text>
          {primary ? <Badge label="Primary" tone="gold" /> : null}
        </View>
        <Text style={styles.itemDescription}>{detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  );
}
function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { backgroundColor: '#EDEAF2', flex: 1, paddingTop: tokens.space.x3 },
  tabs: { gap: tokens.space.x2, padding: tokens.space.x3 },
  tab: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.full,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x4,
  },
  tabActive: { backgroundColor: tokens.color.primary },
  tabText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
  },
  tabTextActive: { color: tokens.color.surface },
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
  page: { backgroundColor: tokens.color.canvas, flex: 1 },
  pageDanger: { backgroundColor: '#FFF5F5' },
  content: {
    gap: tokens.space.x5,
    padding: tokens.space.x5,
    paddingBottom: tokens.space.x12,
    paddingTop: tokens.space.x8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  back: { color: tokens.color.primary, fontSize: 36 },
  headerTitle: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  headerSpacer: { width: tokens.size.touch },
  safetyHero: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x3,
    padding: tokens.space.x5,
  },
  shield: { color: tokens.color.gold, fontSize: 44 },
  heroTitle: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.display,
    fontSize: 26,
  },
  heroBody: { color: '#D9D5EA', lineHeight: 22 },
  body: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    lineHeight: 22,
  },
  menuItem: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 76,
    padding: tokens.space.x3,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: tokens.radius.md,
    height: tokens.size.touch,
    justifyContent: 'center',
    width: tokens.size.touch,
  },
  menuIconText: { color: tokens.color.accent },
  itemCopy: { flex: 1, gap: tokens.space.x1 },
  itemTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  itemDescription: {
    color: tokens.color.inkMuted,
    fontSize: tokens.typography.size.caption,
    lineHeight: 18,
  },
  chevron: { color: tokens.color.inkMuted, fontSize: 28 },
  notice: {
    backgroundColor: '#FFF7E6',
    borderRadius: tokens.radius.md,
    padding: tokens.space.x3,
  },
  noticeText: {
    color: '#6A4B00',
    fontSize: tokens.typography.size.caption,
    lineHeight: 18,
  },
  contact: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 72,
    padding: tokens.space.x3,
  },
  contactAvatar: {
    alignItems: 'center',
    backgroundColor: tokens.color.gold,
    borderRadius: tokens.radius.full,
    height: tokens.size.touch,
    justifyContent: 'center',
    width: tokens.size.touch,
  },
  contactInitial: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.strong,
  },
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.x2,
  },
  confirmTitle: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: 30,
    lineHeight: 36,
  },
  confirmBody: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
    lineHeight: 24,
  },
  countdown: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x3,
    padding: tokens.space.x6,
  },
  countdownNumber: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.display,
    fontSize: 72,
  },
  countdownLabel: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
  },
  progress: {
    backgroundColor: tokens.color.border,
    borderRadius: tokens.radius.full,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: tokens.color.accent,
    height: 8,
    width: '66%',
  },
  cancel: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.size.touch,
  },
  cancelText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
  },
  inlineBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  elapsed: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.display,
    fontSize: 26,
  },
  locationCard: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.accent,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    gap: tokens.space.x2,
    padding: tokens.space.x4,
  },
  cardLabel: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
    letterSpacing: 1.5,
  },
  locationTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  delivery: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    padding: tokens.space.x3,
  },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.x3 },
  map: {
    alignItems: 'center',
    backgroundColor: '#E8E5D8',
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x2,
    minHeight: 220,
    justifyContent: 'center',
    padding: tokens.space.x5,
  },
  mapPin: { color: tokens.color.accent, fontSize: 44 },
});

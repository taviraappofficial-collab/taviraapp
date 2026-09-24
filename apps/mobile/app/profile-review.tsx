import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Button, tokens } from '@tavira/ui';
import { getProfileMenu } from './profile-model';
import type { ProfileCapabilityState } from './profile-model';

const states: readonly { key: ProfileCapabilityState; label: string }[] = [
  { key: 'ordinary', label: 'Ordinary user' },
  { key: 'creator_approved', label: 'Approved creator' },
  { key: 'creator_suspended', label: 'Suspended creator' },
];

export default function ProfileReview() {
  const [state, setState] = useState<ProfileCapabilityState>('ordinary');
  const isApproved = state === 'creator_approved';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>VISUAL REVIEW</Text>
      <Text accessibilityRole="header" style={styles.pageTitle}>
        Profile states
      </Text>
      <View accessibilityRole="tablist" style={styles.statePicker}>
        {states.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: state === item.key }}
            onPress={() => setState(item.key)}
            style={[
              styles.stateButton,
              state === item.key && styles.stateButtonActive,
            ]}
          >
            <Text
              style={[
                styles.stateText,
                state === item.key && styles.stateTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.profileCard}>
        <Avatar name="Amina Bello" size="lg" />
        <View style={styles.profileIdentity}>
          <View style={styles.inline}>
            <Text style={styles.name}>Amina Bello</Text>
            {isApproved ? <Badge label="Creator" tone="gold" /> : null}
          </View>
          <Text style={styles.handle}>@aminabello</Text>
          <Text style={styles.bio}>Designing joyful things in Lagos.</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {getProfileMenu(state).map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}. ${item.description}`}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.menuIcon} accessibilityElementsHidden>
              <Text style={styles.menuIconText}>●</Text>
            </View>
            <View style={styles.menuCopy}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
              {item.status ? (
                <Text style={styles.status}>{item.status}</Text>
              ) : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <ReviewPanel title="Verification" label="Application not started">
        <Text style={styles.panelText}>
          Payment never issues a badge by itself. Identity and policy review
          remain separate.
        </Text>
        <Button label="Review eligibility" onPress={() => undefined} />
      </ReviewPanel>

      <ReviewPanel title="Ads Manager" label="Feature preview">
        <View style={styles.metrics}>
          <Metric label="Active campaigns" value="0" />
          <Metric label="Spend" value="₦0" />
          <Metric label="Results" value="—" />
        </View>
        <Text style={styles.panelText}>
          Campaign creation and billing stay disabled until policy, privacy,
          pricing, and provider approval.
        </Text>
        <Button
          label="Preview campaign builder"
          disabled
          onPress={() => undefined}
        />
      </ReviewPanel>
    </ScrollView>
  );
}

function ReviewPanel({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.inlineBetween}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        <Badge label={label} tone="neutral" />
      </View>
      {children}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: tokens.color.canvas, flex: 1 },
  content: {
    gap: tokens.space.x6,
    padding: tokens.space.x5,
    paddingBottom: tokens.space.x16,
    paddingTop: tokens.space.x12,
  },
  eyebrow: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    letterSpacing: 2,
  },
  pageTitle: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.display,
  },
  statePicker: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.full,
    flexDirection: 'row',
    padding: tokens.space.x1,
  },
  stateButton: {
    alignItems: 'center',
    borderRadius: tokens.radius.full,
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x2,
  },
  stateButtonActive: { backgroundColor: tokens.color.primary },
  stateText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
    textAlign: 'center',
  },
  stateTextActive: { color: tokens.color.surface },
  profileCard: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    flexDirection: 'row',
    gap: tokens.space.x4,
    padding: tokens.space.x5,
    ...tokens.shadow.card,
  },
  profileIdentity: { flex: 1, gap: tokens.space.x1 },
  inline: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.x2,
  },
  inlineBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.x2,
    justifyContent: 'space-between',
  },
  name: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  handle: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
  },
  bio: { color: tokens.color.ink, fontFamily: tokens.typography.family.body },
  menu: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: tokens.color.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 72,
    padding: tokens.space.x4,
  },
  pressed: { backgroundColor: tokens.color.canvas },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: tokens.color.canvas,
    borderRadius: tokens.radius.md,
    height: tokens.size.touch,
    justifyContent: 'center',
    width: tokens.size.touch,
  },
  menuIconText: { color: tokens.color.accent },
  menuCopy: { flex: 1, gap: tokens.space.x1 },
  menuLabel: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  menuDescription: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.caption,
    lineHeight: 18,
  },
  status: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
  },
  chevron: { color: tokens.color.inkMuted, fontSize: 28 },
  panel: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x4,
    padding: tokens.space.x5,
    ...tokens.shadow.card,
  },
  sectionTitle: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  panelText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    lineHeight: 24,
  },
  metrics: { flexDirection: 'row', gap: tokens.space.x2 },
  metric: {
    backgroundColor: tokens.color.canvas,
    borderRadius: tokens.radius.md,
    flex: 1,
    gap: tokens.space.x1,
    minHeight: 80,
    padding: tokens.space.x3,
  },
  metricValue: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  metricLabel: {
    color: tokens.color.inkMuted,
    fontSize: tokens.typography.size.caption,
  },
});

import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { tokens } from '@tavira/ui';
import type { DeviceSessionView } from '../identity-model';

export function IdentityScaffold({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brandMark} accessibilityLabel="TAVIRA">
        <Text style={styles.brandLetter}>T</Text>
      </View>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </ScrollView>
  );
}

export function InlineLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as never} accessibilityRole="link" style={styles.link}>
      {label}
    </Link>
  );
}

export function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {control}
    </View>
  );
}

export function SessionRow({
  session,
  onRemove,
}: {
  session: DeviceSessionView;
  onRemove: () => void;
}) {
  return (
    <View style={styles.sessionRow}>
      <View style={styles.deviceIcon}>
        <Text style={styles.deviceIconText}>▣</Text>
      </View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>
          {session.deviceName} {session.current ? '· This device' : ''}
        </Text>
        <Text style={styles.settingDescription}>{session.createdAtLabel}</Text>
      </View>
      {!session.current ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sign out ${session.deviceName}`}
          onPress={onRemove}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>Sign out</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const identityStyles = StyleSheet.create({
  fieldStack: { gap: tokens.space.x4 },
  splitRow: { flexDirection: 'row', gap: tokens.space.x3 },
  helper: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.caption,
    lineHeight: 18,
  },
  center: { alignItems: 'center', gap: tokens.space.x3 },
  codeHint: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    textAlign: 'center',
  },
  sectionTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  dangerText: {
    color: tokens.color.danger,
    fontFamily: tokens.typography.family.strong,
  },
});

const styles = StyleSheet.create({
  screen: { backgroundColor: tokens.color.canvas, flex: 1 },
  content: {
    alignSelf: 'center',
    gap: tokens.space.x6,
    maxWidth: 520,
    padding: tokens.space.x5,
    paddingBottom: tokens.space.x16,
    paddingTop: tokens.space.x12,
    width: '100%',
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  brandLetter: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.display,
    fontSize: 26,
  },
  heading: { gap: tokens.space.x2 },
  eyebrow: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    letterSpacing: 1.4,
  },
  title: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.display,
    lineHeight: 40,
  },
  description: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
    lineHeight: 24,
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    gap: tokens.space.x5,
    padding: tokens.space.x5,
    ...tokens.shadow.card,
  },
  link: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
    minHeight: tokens.size.touch,
    paddingVertical: tokens.space.x3,
    textAlign: 'center',
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: tokens.color.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 76,
    paddingVertical: tokens.space.x3,
  },
  settingCopy: { flex: 1, gap: tokens.space.x1 },
  settingTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
  },
  settingDescription: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.caption,
  },
  sessionRow: {
    alignItems: 'center',
    borderBottomColor: tokens.color.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: tokens.space.x3,
    paddingVertical: tokens.space.x3,
  },
  deviceIcon: {
    alignItems: 'center',
    backgroundColor: tokens.color.canvas,
    borderRadius: tokens.radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  deviceIconText: { color: tokens.color.primary, fontSize: 20 },
  removeButton: { minHeight: tokens.size.touch, justifyContent: 'center' },
  removeText: {
    color: tokens.color.danger,
    fontFamily: tokens.typography.family.strong,
  },
});

import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  Text,
  TextInput as NativeInput,
  View,
} from 'react-native';
import type { ImageSourcePropType, TextInputProps } from 'react-native';
import { tokens } from './tokens';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}
export function Button({
  label,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tokens.color.surface} />
      ) : (
        <Text style={styles.buttonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export interface TaviraTextInputProps extends TextInputProps {
  label: string;
  error?: string;
}
export function TextInput({
  label,
  error,
  editable = true,
  ...props
}: TaviraTextInputProps) {
  const errorId = `${label.replace(/\s/g, '-').toLowerCase()}-error`;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <NativeInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: !editable }}
        accessibilityHint={error ? `${errorId}: ${error}` : undefined}
        editable={editable}
        placeholderTextColor={tokens.color.inkMuted}
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.disabled,
        ]}
        {...props}
      />
      {error ? (
        <Text nativeID={errorId} accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export interface AvatarProps {
  name: string;
  source?: ImageSourcePropType;
  size?: 'sm' | 'md' | 'lg';
}
export function Avatar({ name, source, size = 'md' }: AvatarProps) {
  const px = {
    sm: tokens.size.avatarSm,
    md: tokens.size.avatarMd,
    lg: tokens.size.avatarLg,
  }[size];
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${name}'s avatar`}
      style={[styles.avatar, { width: px, height: px, borderRadius: px / 2 }]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: px, height: px, borderRadius: px / 2 }}
        />
      ) : (
        <Text style={styles.avatarText}>
          {name.trim().slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'coral' | 'gold';
}
export function Badge({ label, tone = 'coral' }: BadgeProps) {
  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.statusBadge,
        tone === 'gold' && styles.statusBadgeGold,
        tone === 'neutral' && styles.statusBadgeNeutral,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          tone === 'gold' && styles.statusBadgeTextDark,
          tone === 'neutral' && styles.statusBadgeTextDark,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}
export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View accessibilityRole="summary" style={styles.emptyState}>
      <View accessibilityElementsHidden style={styles.emptySymbol}>
        <Text style={styles.emptySymbolText}>◇</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

export interface ModalProps {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}
export function Modal({ visible, title, children, onClose }: ModalProps) {
  return (
    <NativeModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View accessibilityViewIsModal style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.dialogHeader}>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </NativeModal>
  );
}

export interface SheetProps {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}
export function Sheet({ visible, title, children, onClose }: SheetProps) {
  return (
    <NativeModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View accessibilityViewIsModal style={styles.sheetOverlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={onClose}
          style={styles.sheetDismiss}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.dialogHeader}>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </NativeModal>
  );
}

export interface ToastProps {
  message: string;
  tone?: 'success' | 'error' | 'neutral';
  actionLabel?: string;
  onAction?: () => void;
}
export function Toast({
  message,
  tone = 'neutral',
  actionLabel,
  onAction,
}: ToastProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.toast,
        tone === 'success' && styles.toastSuccess,
        tone === 'error' && styles.toastError,
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.toastAction}
        >
          <Text style={styles.toastActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: keyof typeof tokens.radius;
  accessibilityLabel?: string;
}
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 'sm',
  accessibilityLabel = 'Loading content',
}: SkeletonProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      style={[
        styles.skeleton,
        { width, height, borderRadius: tokens.radius[radius] },
      ]}
    />
  );
}

export interface NavigationItem {
  key: string;
  label: string;
  icon: ReactNode;
}
export interface BottomNavigationProps {
  items: readonly NavigationItem[];
  activeKey: string;
  onChange: (key: string) => void;
}
export function BottomNavigation({
  items,
  activeKey,
  onChange,
}: BottomNavigationProps) {
  return (
    <View accessibilityRole="tablist" style={styles.navigation}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: item.key === activeKey }}
          accessibilityLabel={item.label}
          onPress={() => onChange(item.key)}
          style={styles.navItem}
        >
          {item.icon}
          <Text
            style={[
              styles.navLabel,
              item.key === activeKey && styles.navActive,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export interface ChatRowProps {
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  avatarSource?: ImageSourcePropType;
  onPress: () => void;
}
export function ChatRow({
  name,
  preview,
  time,
  unreadCount = 0,
  avatarSource,
  onPress,
}: ChatRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${name}. ${preview}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar name={name} source={avatarSource} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {name}
          </Text>
          <Text style={styles.meta}>{time}</Text>
        </View>
        <View style={styles.rowTop}>
          <Text numberOfLines={1} style={styles.preview}>
            {preview}
          </Text>
          {unreadCount > 0 ? (
            <View
              accessibilityLabel={`${unreadCount} unread messages`}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export interface ProductCardProps {
  name: string;
  priceMinor: number;
  currency?: 'NGN';
  imageSource?: ImageSourcePropType;
  seller: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}
export function ProductCard({
  name,
  priceMinor,
  currency = 'NGN',
  imageSource,
  seller,
  loading = false,
  disabled = false,
  onPress,
}: ProductCardProps) {
  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(priceMinor / 100);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${price}, sold by ${seller}`}
      accessibilityState={{ busy: loading, disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.rowPressed,
        disabled && styles.disabled,
      ]}
    >
      {imageSource ? (
        <Image source={imageSource} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.imagePlaceholder]}>
          <Text style={styles.meta}>Product image</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        {loading ? (
          <ActivityIndicator color={tokens.color.primary} />
        ) : (
          <>
            <Text numberOfLines={2} style={styles.rowTitle}>
              {name}
            </Text>
            <Text style={styles.price}>{price}</Text>
            <Text numberOfLines={1} style={styles.meta}>
              {seller}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x5,
  },
  buttonPressed: { backgroundColor: tokens.color.primaryPressed },
  buttonLabel: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  disabled: { opacity: 0.45 },
  field: { gap: tokens.space.x2 },
  label: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  input: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x4,
  },
  inputError: { borderColor: tokens.color.danger },
  error: {
    color: tokens.color.danger,
    fontSize: tokens.typography.size.caption,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: tokens.color.gold,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.strong,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.full,
    minHeight: 24,
    paddingHorizontal: tokens.space.x2,
    paddingVertical: tokens.space.x1,
  },
  statusBadgeGold: { backgroundColor: tokens.color.gold },
  statusBadgeNeutral: {
    backgroundColor: tokens.color.canvas,
    borderColor: tokens.color.border,
    borderWidth: 1,
  },
  statusBadgeText: {
    color: tokens.color.surface,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.caption,
  },
  statusBadgeTextDark: { color: tokens.color.primary },
  chip: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x4,
  },
  chipSelected: {
    backgroundColor: tokens.color.primary,
    borderColor: tokens.color.primary,
  },
  chipPressed: { opacity: 0.72 },
  chipText: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.strong,
  },
  chipTextSelected: { color: tokens.color.surface },
  emptyState: {
    alignItems: 'center',
    gap: tokens.space.x3,
    padding: tokens.space.x6,
  },
  emptySymbol: {
    alignItems: 'center',
    backgroundColor: tokens.color.canvas,
    borderRadius: tokens.radius.full,
    height: tokens.size.avatarLg,
    justifyContent: 'center',
    width: tokens.size.avatarLg,
  },
  emptySymbolText: { color: tokens.color.gold, fontSize: 32 },
  emptyTitle: {
    color: tokens.color.ink,
    fontFamily: tokens.typography.family.display,
    fontSize: tokens.typography.size.title,
  },
  emptyDescription: {
    color: tokens.color.inkMuted,
    fontFamily: tokens.typography.family.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: tokens.color.overlayStrong,
    flex: 1,
    justifyContent: 'center',
    padding: tokens.space.x5,
  },
  dialog: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    gap: tokens.space.x4,
    maxWidth: 420,
    padding: tokens.space.x5,
    width: '100%',
  },
  dialogHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.space.x3,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: tokens.radius.full,
    height: tokens.size.touch,
    justifyContent: 'center',
    width: tokens.size.touch,
  },
  closeText: { color: tokens.color.inkMuted, fontSize: 28 },
  sheetOverlay: {
    backgroundColor: tokens.color.overlaySoft,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetDismiss: { flex: 1 },
  sheet: {
    backgroundColor: tokens.color.surface,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    gap: tokens.space.x4,
    padding: tokens.space.x5,
    paddingBottom: tokens.space.x8,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: tokens.color.border,
    borderRadius: tokens.radius.full,
    height: 4,
    width: 48,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 56,
    padding: tokens.space.x3,
  },
  toastSuccess: { backgroundColor: tokens.color.success },
  toastError: { backgroundColor: tokens.color.danger },
  toastText: {
    color: tokens.color.surface,
    flex: 1,
    fontFamily: tokens.typography.family.body,
  },
  toastAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.size.touch,
    paddingHorizontal: tokens.space.x2,
  },
  toastActionText: {
    color: tokens.color.gold,
    fontFamily: tokens.typography.family.strong,
  },
  skeleton: { backgroundColor: tokens.color.border, overflow: 'hidden' },
  navigation: {
    backgroundColor: tokens.color.surface,
    borderTopColor: tokens.color.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: tokens.size.touch,
  },
  navLabel: {
    color: tokens.color.inkMuted,
    fontSize: tokens.typography.size.caption,
  },
  navActive: {
    color: tokens.color.accent,
    fontFamily: tokens.typography.family.strong,
  },
  row: {
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    flexDirection: 'row',
    gap: tokens.space.x3,
    minHeight: 72,
    padding: tokens.space.x3,
  },
  rowPressed: { opacity: 0.72 },
  rowBody: { flex: 1, gap: tokens.space.x1 },
  rowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.space.x2,
    justifyContent: 'space-between',
  },
  rowTitle: {
    color: tokens.color.ink,
    flexShrink: 1,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.body,
  },
  preview: { color: tokens.color.inkMuted, flex: 1 },
  meta: {
    color: tokens.color.inkMuted,
    fontSize: tokens.typography.size.caption,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.full,
    minWidth: 22,
    padding: tokens.space.x1,
  },
  badgeText: {
    color: tokens.color.surface,
    fontSize: tokens.typography.size.caption,
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    width: 220,
    ...tokens.shadow.card,
  },
  productImage: { height: 150, width: '100%' },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: tokens.color.canvas,
    justifyContent: 'center',
  },
  cardBody: { gap: tokens.space.x2, minHeight: 112, padding: tokens.space.x3 },
  price: {
    color: tokens.color.primary,
    fontFamily: tokens.typography.family.strong,
    fontSize: tokens.typography.size.title,
  },
});

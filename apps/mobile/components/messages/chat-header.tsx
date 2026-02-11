/**
 * Chat Header - Mobile Native
 * Header for chat screen with back button, avatar, name, activity status
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Data, Supporting } from '@/components/ui';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeenAt?: Date | string | null;
  listingTitle?: string;
  onBack?: () => void;
}

export function ChatHeader({
  name,
  avatarUrl,
  isOnline = false,
  isTyping = false,
  lastSeenAt,
  listingTitle,
  onBack,
}: ChatHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Format last seen
  const getStatusText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'Active now';
    if (lastSeenAt) {
      const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
      if (!isNaN(date.getTime())) {
        return `Active ${formatDistanceToNow(date, { addSuffix: false })} ago`;
      }
    }
    return null;
  };

  const statusText = getStatusText();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top + Spacing.xs,
        },
      ]}
    >
      {/* Back Button */}
      <HapticPressable
        onPress={handleBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: pressed ? colors.surface : 'transparent' },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
      </HapticPressable>

      {/* Avatar with online indicator */}
      <View>
        <UserAvatar src={avatarUrl} name={name} size="md" />
        {isOnline && (
          <View style={[styles.onlineIndicator, { backgroundColor: colors.success, borderColor: colors.background }]} />
        )}
      </View>

      {/* Name & Status */}
      <View style={styles.info}>
        <Data size="large" style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
          {name}
        </Data>
        {listingTitle ? (
          <Supporting size="small" style={{ color: colors.textTertiary, marginTop: 1 }} numberOfLines={1}>
            Re: {listingTitle}
          </Supporting>
        ) : statusText ? (
          <Data
            size="mini"
            style={{
              color: isTyping ? colors.primary : (isOnline ? colors.success : colors.textTertiary),
              marginTop: 1,
            }}
          >
            {statusText}
          </Data>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
    borderRadius: Radius.md,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});

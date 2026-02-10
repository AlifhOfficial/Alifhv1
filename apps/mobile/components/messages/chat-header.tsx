/**
 * Chat Header - Mobile Native
 * Header for chat screen with back button, avatar, name, online status
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Heading, Supporting } from '@/components/ui';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeenAt?: Date | string | null;
  listingTitle?: string;
  onBack?: () => void;
}

export function ChatHeader({
  name,
  avatarUrl,
  isOnline = false,
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
    if (isOnline) return 'Online';
    if (lastSeenAt) {
      const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
      if (!isNaN(date.getTime())) {
        return `Last seen ${formatDistanceToNow(date, { addSuffix: false })} ago`;
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
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: pressed ? colors.surface : 'transparent' },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
      </Pressable>

      {/* Avatar */}
      <UserAvatar src={avatarUrl} name={name} size="md" />

      {/* Name & Status */}
      <View style={styles.info}>
        <Heading size="small" numberOfLines={1}>{name}</Heading>
        {listingTitle ? (
          <Supporting size="medium" tone="muted" style={{ marginTop: 2 }} numberOfLines={1}>
            Re: {listingTitle}
          </Supporting>
        ) : statusText ? (
          <Supporting 
            size="medium" 
            tone={isOnline ? 'success' : 'muted'}
            style={{ marginTop: 2 }}
          >
            {statusText}
          </Supporting>
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
    borderBottomWidth: 0.5,
    gap: Spacing.md,
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
});

/**
 * Chat Header - Mobile Native
 * Clean native header bar with avatar, name and status
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { Colors, Spacing, Sizes, Layout, ZIndex} from '@/constants/theme';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Data, Supporting } from '@/components/ui';

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeenAt?: Date | string | null;
  listingTitle?: string;
  listingId?: string | null;
  partnerId?: string | null;
  partnerName?: string | null;
  isLoading?: boolean;
}

export function ChatHeader({
  name,
  avatarUrl,
  isOnline = false,
  isTyping = false,
  lastSeenAt,
  listingTitle,
  listingId,
  partnerId,
  partnerName,
  isLoading = false,
}: ChatHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { applySearch, clearSearch, clearFilterParams } = useSearch();

  // Format activity timestamp
  const getActivityText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'now';
    if (lastSeenAt) {
      const date = lastSeenAt instanceof Date ? lastSeenAt : new Date(lastSeenAt);
      if (!isNaN(date.getTime())) {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    }
    return 'offline';
  };

  const activityText = getActivityText();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, borderBottomColor: colors.border, backgroundColor: colors.bg },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {isLoading ? (
          <Skeleton circle width={Sizes.avatarSm} height={Sizes.avatarSm} />
        ) : (
          <UserAvatar src={avatarUrl} name={name} size="sm" />
        )}
        {isOnline && !isLoading && (
          <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.bg }]} />
        )}
      </View>

      {/* Name + Status — tappable to partner search if dealer */}
      {partnerId && partnerName ? (
        <Pressable
          onPress={() => {
            clearSearch();
            clearFilterParams();
            applySearch({ partnerId, partnerName });
            router.push('/browse' as any);
          }}
          style={styles.nameBlock}
        >
          {isLoading ? (
            <Skeleton width={120} height={14} />
          ) : (
            <>
              <Data size="body" style={{ color: colors.text }} numberOfLines={1}>
                {name}
              </Data>
              <Supporting size="bodySm" style={{ color: colors.text3 }} numberOfLines={1}>
                {activityText}
                {listingTitle ? `  ·  ${listingTitle}` : ''}
              </Supporting>
            </>
          )}
        </Pressable>
      ) : (
        <View style={styles.nameBlock}>
          {isLoading ? (
            <Skeleton width={120} height={14} />
          ) : (
            <>
              <Data size="body" style={{ color: colors.text }} numberOfLines={1}>
                {name}
              </Data>
              <Supporting size="bodySm" style={{ color: colors.text3 }} numberOfLines={1}>
                {activityText}
                {listingTitle ? `  ·  ${listingTitle}` : ''}
              </Supporting>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.overlay,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarWrap: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Spacing.md / 2,
    borderWidth: 2,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
});

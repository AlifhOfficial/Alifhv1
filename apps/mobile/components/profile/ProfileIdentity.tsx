/**
 * Profile Identity Component
 * Avatar + Name + Email + Member since
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { Heading, Data, Body } from '@/components/ui';
import { Spacing, Sizes } from '@/constants/theme';
import { ProfileAvatar } from './ProfileAvatar';
import type { ThemeColors } from './types';

interface ProfileIdentityProps {
  displayName: string;
  email?: string;
  memberSince: number;
  avatarUrl?: string | null;
  useGeneratedAvatar?: boolean;
  isVerified?: boolean;
  isExpiringSoon?: boolean;
  isUploading?: boolean;
  colors: ThemeColors;
  onPhotoSelected?: (uri: string) => Promise<void>;
  onRemovePhoto?: () => Promise<void>;
}

export function ProfileIdentity({
  displayName,
  email,
  memberSince,
  avatarUrl,
  useGeneratedAvatar = true,
  isVerified = false,
  isExpiringSoon = false,
  isUploading = false,
  colors,
  onPhotoSelected,
  onRemovePhoto,
}: ProfileIdentityProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(50).duration(350)}
      style={styles.container}
    >
      <ProfileAvatar
        imageUrl={avatarUrl}
        displayName={displayName}
        useGeneratedAvatar={useGeneratedAvatar}
        isUploading={isUploading}
        colors={colors}
        onPhotoSelected={onPhotoSelected}
        onRemovePhoto={onRemovePhoto}
      />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Heading
            size="medium"
            style={styles.name}
            numberOfLines={1}
          >
            {displayName}
          </Heading>
          {isVerified && (
            <CheckCircle2
              size={Sizes.iconXs}
              color={colors.primary}
              strokeWidth={2.5}
              style={isExpiringSoon ? styles.expiringBadge : undefined}
            />
          )}
        </View>

        {email && (
          <Data
            size="medium"
            tone="secondary"
            numberOfLines={1}
            style={styles.email}
          >
            {email}
          </Data>
        )}

        <Body size="small" tone="muted" style={styles.memberSince}>
          Member since {memberSince}
        </Body>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.sm,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  expiringBadge: {
    opacity: 0.5,
  },
  email: {
    marginTop: Sizes.badgePaddingV,
  },
  memberSince: {
    marginTop: Sizes.badgePaddingV,
  },
});

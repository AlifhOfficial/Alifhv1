/**
 * Profile Identity Component
 * Avatar + Name + Email + Member since
 */

import { Text } from '@/components/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { Sizes, Spacing } from '@/constants/theme';
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
          <Text
            variant="headline"
            style={styles.name}
            numberOfLines={1}
          >
            {displayName}
          </Text>
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
          <Text
            variant="body"
            tone="secondary"
            numberOfLines={1}
          >
            {email}
          </Text>
        )}

        <Text variant="subhead" tone="muted">
          Member since {memberSince}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
    marginTop: Spacing['3xl'],
  },
  info: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    textAlign: 'center',
  },
  expiringBadge: {
    opacity: 0.5,
  },
});

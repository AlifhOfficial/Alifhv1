/**
 * Profile Identity Component
 * Avatar + Name + Email + Member since
 */

import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { Typography } from '@/constants/theme';
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
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayName}
          </Text>
          {isVerified && (
            <CheckCircle2
              size={16}
              color={colors.primary}
              strokeWidth={2.5}
              style={isExpiringSoon ? styles.expiringBadge : undefined}
            />
          )}
        </View>

        {email && (
          <Text
            style={[styles.email, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {email}
          </Text>
        )}

        <Text style={[styles.memberSince, { color: colors.textTertiary }]}>
          Member since {memberSince}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: Typography.h3.fontSize,
    lineHeight: Typography.h3.lineHeight,
    fontFamily: 'Inter_700Bold',
    fontWeight: Typography.h3.fontWeight as any,
    letterSpacing: Typography.h3.letterSpacing,
    flexShrink: 1,
  },
  expiringBadge: {
    opacity: 0.5,
  },
  email: {
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.subhead.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.subhead.fontWeight as any,
    letterSpacing: Typography.subhead.letterSpacing,
    marginTop: 2,
  },
  memberSince: {
    fontSize: Typography.footnote.fontSize,
    lineHeight: Typography.footnote.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.footnote.fontWeight as any,
    letterSpacing: Typography.footnote.letterSpacing,
    marginTop: 2,
  },
});

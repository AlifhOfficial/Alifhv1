/**
 * Profile Identity Component
 * Avatar + Name + Email + Member since
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

import { Heading, Data, Supporting } from '@/components/ui';
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
            size="large"
            style={styles.name}
            numberOfLines={1}
          >
            {displayName}
          </Heading>
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
          <Data
            size="medium"
            tone="secondary"
            numberOfLines={1}
            style={styles.email}
          >
            {email}
          </Data>
        )}

        <Supporting size="small" tone="muted" style={styles.memberSince}>
          Member since {memberSince}
        </Supporting>
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
    flexShrink: 1,
  },
  expiringBadge: {
    opacity: 0.5,
  },
  email: {
    marginTop: 2,
  },
  memberSince: {
    marginTop: 2,
  },
});

/**
 * Profile Button - Opens auth flow or shows user profile
 */

import { Bubble } from '@/components/ui';
import { UserAvatar } from '@/components/ui/user-avatar';
import React from 'react';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Sizes, Stroke } from '@/constants/theme';

export function ProfileMenu() {
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  return (
    <Bubble
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Profile"
    >
      {isAuthenticated && user ? (
        <UserAvatar
          src={user.avatarUrl || user.image}
          name={user.name}
          size="sm"
          useGeneratedAvatar={user.useGeneratedAvatar ?? true}
        />
      ) : (
        <User size={Sizes.iconSm} color={colors.label} strokeWidth={Stroke.icon} />
      )}
    </Bubble>
  );
}

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
  const { isAuthenticated, user, showAuthSheet } = useAuth();
  const router = useRouter();

  const handlePress = () => {
    if (!isAuthenticated) {
      showAuthSheet('profile');
      return;
    }

    router.push('/profile');
  };

  return (
    <Bubble
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Profile"
    >
      {isAuthenticated && user ? (
        <UserAvatar
          src={user.avatarUrl}
          name={user.name}
          size="md"
          useGeneratedAvatar={user.useGeneratedAvatar ?? true}
        />
      ) : (
        <User size={Sizes.iconSm} color={colors.label} strokeWidth={Stroke.icon} />
      )}
    </Bubble>
  );
}

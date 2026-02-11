/**
 * Profile Button - Opens auth flow or shows user profile
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Colors } from '@/constants/theme';

export function ProfileMenu() {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user, openAuthFlow } = useAuth();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      openAuthFlow();
    }
  };

  // Show user avatar if authenticated
  if (isAuthenticated && user) {
    return (
      <HapticPressable
        style={styles.trigger}
        onPress={handlePress}
      >
        <UserAvatar
          src={user.avatarUrl || user.image}
          name={user.name}
          size="md"
          useGeneratedAvatar={user.useGeneratedAvatar ?? true}
        />
      </HapticPressable>
    );
  }

  return (
    <HapticPressable
      style={[
        styles.trigger,
        styles.unauthTrigger,
        { 
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }
      ]}
      onPress={handlePress}
    >
      {({ pressed }) => (
        <User 
          size={20} 
          color={colors.icon}
          strokeWidth={2}
          style={{ opacity: pressed ? 0.7 : 1 }}
        />
      )}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderRadius: 24,
  },
  unauthTrigger: {
    padding: 4,
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

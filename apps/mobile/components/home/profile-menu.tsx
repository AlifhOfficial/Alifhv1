/**
 * Profile Button - Opens auth flow or shows user profile
 */

import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
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
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={handlePress}
      >
        <UserAvatar
          src={user.avatarUrl || user.image}
          name={user.name}
          size="md"
          useGeneratedAvatar={user.useGeneratedAvatar ?? true}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
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
          color="#8E8E93"
          strokeWidth={2}
          style={{ opacity: pressed ? 0.7 : 1 }}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderRadius: 24,
  },
  unauthTrigger: {
    padding: 4,
    borderWidth: 1,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

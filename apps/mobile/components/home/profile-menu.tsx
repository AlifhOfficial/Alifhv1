/**
 * Profile Button - Opens auth flow or shows user profile
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Colors, Sizes } from '@/constants/theme';

export function ProfileMenu() {
  const { colorScheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    router.push('/profile');
  };

  // Show user avatar if authenticated
  if (isAuthenticated && user) {
    return (
      <View
        style={[
          styles.bubble,
          styles.glass,
          {
            borderColor: colors.glassBorder,
            backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
          },
        ]}
      >
        <HapticPressable
          style={styles.bubbleInner}
          onPress={handlePress}
        >
          <UserAvatar
            src={user.avatarUrl || user.image}
            name={user.name}
            size="md"
            useGeneratedAvatar={user.useGeneratedAvatar ?? true}
          />
        </HapticPressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bubble,
        styles.glass,
        { 
          borderColor: colors.glassBorder,
          backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
        }
      ]}
    >
      <HapticPressable
        style={styles.bubbleInner}
        onPress={handlePress}
      >
        {({ pressed }) => (
          <Ionicons
            name="person-circle-outline"
            size={Sizes.iconSm}
            color={colors.icon}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubbleInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    borderWidth: 1,
  },
});

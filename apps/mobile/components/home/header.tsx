/**
 * Home Header - Custom header with profile menu
 * Alifh Design System + Inter font
 */

import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack, Text } from 'tamagui';
import { Bell } from 'lucide-react-native';

import { ProfileMenu } from './profile-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/context/theme-context';

interface HomeHeaderProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
  onNotificationPress?: () => void;
}

export function HomeHeader({ onSignIn, onCreateAccount, onNotificationPress }: HomeHeaderProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <XStack
      paddingTop={insets.top + 8}
      paddingBottom={12}
      paddingHorizontal={16}
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left: Profile Menu + Title */}
      <XStack alignItems="center" gap={10}>
        <ProfileMenu 
          onSignIn={onSignIn}
          onCreateAccount={onCreateAccount}
        />
        <Text
          fontSize={28}
          fontFamily="Inter_700Bold"
          fontWeight="700"
          color="$textPrimary"
          letterSpacing={0.36}
        >
          Home
        </Text>
      </XStack>

      {/* Right: Notifications + Theme Toggle */}
      <XStack alignItems="center" gap={4}>
        <XStack
          padding={8}
          pressStyle={{ opacity: 0.7 }}
          onPress={onNotificationPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Bell 
            size={22} 
            color={isDark ? '#FAFAFA' : '#0D0D0D'} 
            strokeWidth={2}
          />
        </XStack>
        <ThemeToggle />
      </XStack>
    </XStack>
  );
}

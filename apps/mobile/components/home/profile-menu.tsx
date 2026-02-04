/**
 * Profile Menu - Simple dropdown for auth actions
 * Revvup Design System + Inter font
 */

import { useState } from 'react';
import { Popover, YStack, XStack, Text, Button, Separator } from 'tamagui';
import { User } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';

interface ProfileMenuProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export function ProfileMenu({ onSignIn, onCreateAccount }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();

  const handleSignIn = () => {
    setOpen(false);
    onSignIn();
  };

  const handleCreateAccount = () => {
    setOpen(false);
    onCreateAccount();
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement="bottom-start"
      offset={{ mainAxis: 8, crossAxis: 0 }}
    >
      <Popover.Trigger asChild>
        <Button
          unstyled
          padding={4}
          borderRadius={20}
          pressStyle={{ opacity: 0.7 }}
        >
          {/* Avatar placeholder */}
          <XStack
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor="$surfaceSecondary"
            alignItems="center"
            justifyContent="center"
          >
            <User 
              size={18} 
              color={isDark ? '#A3A3A3' : '#737373'} 
              strokeWidth={2} 
            />
          </XStack>
        </Button>
      </Popover.Trigger>

      <Popover.Content
        enterStyle={{ opacity: 0, y: -8 }}
        exitStyle={{ opacity: 0, y: -8 }}
        animation="fast"
        elevate
        backgroundColor="$surface"
        borderRadius={12}
        borderWidth={1}
        borderColor="$borderColor"
        padding={4}
        minWidth={160}
        shadowColor="black"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
      >
        <Popover.Arrow 
          borderWidth={1} 
          borderColor="$borderColor" 
          backgroundColor="$surface"
        />

        <YStack>
          {/* Sign In */}
          <Button
            unstyled
            paddingVertical={10}
            paddingHorizontal={12}
            borderRadius={8}
            pressStyle={{ backgroundColor: '$fillTertiary' }}
            onPress={handleSignIn}
          >
            <Text
              fontSize={15}
              fontFamily="Inter_400Regular"
              fontWeight="400"
              color="$textPrimary"
              letterSpacing={-0.24}
            >
              Sign in
            </Text>
          </Button>

          <Separator backgroundColor="$borderColor" marginVertical={4} />

          {/* Create Account */}
          <Button
            unstyled
            paddingVertical={10}
            paddingHorizontal={12}
            borderRadius={8}
            pressStyle={{ backgroundColor: '$fillTertiary' }}
            onPress={handleCreateAccount}
          >
            <Text
              fontSize={15}
              fontFamily="Inter_400Regular"
              fontWeight="400"
              color="$textPrimary"
              letterSpacing={-0.24}
            >
              Create account
            </Text>
          </Button>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}

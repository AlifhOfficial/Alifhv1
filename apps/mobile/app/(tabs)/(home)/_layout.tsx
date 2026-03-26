import { Stack } from 'expo-router/stack';
import { Platform } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { HapticPressable } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Sizes, Spacing } from '@/constants/theme';

const iosOptions = {
  headerTransparent: true,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerLargeStyle: { backgroundColor: 'transparent' },
  headerLargeTitle: true,
  headerBlurEffect: 'none' as const,
  headerBackButtonDisplayMode: 'minimal' as const,
};

export default function HomeLayout() {
  const { colorScheme, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleToggleTheme = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  const ThemeIcon = colorScheme === 'dark' ? Moon : Sun;

  return (
    <Stack
      screenOptions={{
        ...(Platform.OS === 'ios'
          ? iosOptions
          : { headerStyle: { backgroundColor: colors.bg } }),
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colorScheme === 'light' ? colors.white : colors.black },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => (
            <HapticPressable
              onPress={handleToggleTheme}
              style={{ marginRight: Spacing.sm }}
            >
              <ThemeIcon size={Sizes.iconSm} color={colors.icon} strokeWidth={2} />
            </HapticPressable>
          ),
        }}
      />
    </Stack>
  );
}

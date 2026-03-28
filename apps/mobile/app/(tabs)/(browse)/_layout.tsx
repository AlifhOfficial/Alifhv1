import { Stack } from 'expo-router/stack';
import { Platform } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

const iosOptions = {
  headerTransparent: true,
  headerShadowVisible: false,
  headerBlurEffect: 'none' as const,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerTitleAlign: 'center' as const,
};

export default function BrowseLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        ...(Platform.OS === 'ios'
          ? iosOptions
          : { headerStyle: { backgroundColor: colors.background } }),
        headerTintColor: colors.label,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Browse',
        }}
      />
    </Stack>
  );
}

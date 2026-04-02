import { Stack } from 'expo-router/stack';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function SettingsLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.label,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen
        name="delete-account"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.86],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="verify-identity"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.42],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
    </Stack>
  );
}
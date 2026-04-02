import { Stack } from 'expo-router/stack';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function ChatLayout() {
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
      <Stack.Screen name="[conversationId]" options={{ title: 'Chat' }} />
      <Stack.Screen
        name="share-location"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.72],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
    </Stack>
  );
}
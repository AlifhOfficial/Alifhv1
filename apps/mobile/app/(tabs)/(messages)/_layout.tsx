import { Stack } from 'expo-router/stack';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export default function MessagesLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          title: 'Chats',
        }}
      />
    </Stack>
  );
}

import { Stack } from 'expo-router/stack';

import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { createFormSheetOptions } from '@/lib/form-sheet';

export default function SettingsLayout() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.label,
        sheetCornerRadius: Radius.sheet,
        sheetExpandsWhenScrolledToEdge: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen
        name="delete-account"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.86],
        })}
      />
      <Stack.Screen
        name="verify-identity"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.42],
        })}
      />
    </Stack>
  );
}

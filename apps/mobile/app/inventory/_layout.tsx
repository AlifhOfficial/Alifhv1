import { Stack } from 'expo-router/stack';

import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function InventoryLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory',
        }}
      />
      <Stack.Screen
        name="actions"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.62],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="mark-sold"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.48],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="extend"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.56],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="archive"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.48],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="delete"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.52],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.58],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="review-reason"
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
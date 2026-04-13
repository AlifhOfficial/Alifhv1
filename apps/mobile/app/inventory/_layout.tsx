import { Stack } from 'expo-router/stack';

import { Colors, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { createFormSheetOptions } from '@/lib/form-sheet';

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
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.62],
        })}
      />
      <Stack.Screen
        name="filters"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.62],
        })}
      />
      <Stack.Screen
        name="mark-sold"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.48],
        })}
      />
      <Stack.Screen
        name="extend"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.56],
        })}
      />
      <Stack.Screen
        name="archive"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.48],
        })}
      />
      <Stack.Screen
        name="delete"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.52],
        })}
      />
      <Stack.Screen
        name="stats"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.58],
        })}
      />
      <Stack.Screen
        name="review-reason"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.72],
        })}
      />
    </Stack>
  );
}

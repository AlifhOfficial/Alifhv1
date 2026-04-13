import { Stack } from 'expo-router/stack';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius } from '@/constants/theme';
import { createFormSheetOptions } from '@/lib/form-sheet';

export default function BrowseLayout() {
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
          title: 'Browse',
        }}
      />
      <Stack.Screen
        name="sort"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.75],
        })}
      />
      <Stack.Screen
        name="search"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.58, 0.92],
          sheetExpandsWhenScrolledToEdge: true,
        })}
      />
      <Stack.Screen
        name="menu"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.9],
        })}
      />
      <Stack.Screen
        name="active-filters"
        options={createFormSheetOptions(colors, {
          sheetAllowedDetents: [0.9],
        })}
      />
    </Stack>
  );
}

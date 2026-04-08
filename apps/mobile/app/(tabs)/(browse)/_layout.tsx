import { Stack } from 'expo-router/stack';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius } from '@/constants/theme';

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
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.75],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.58, 0.92],
          sheetExpandsWhenScrolledToEdge: true,
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
          sheetExpandsWhenScrolledToEdge: false,
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
      <Stack.Screen
        name="active-filters"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
          headerShown: false,
          contentStyle: { backgroundColor: colors.sheet },
        }}
      />
    </Stack>
  );
}

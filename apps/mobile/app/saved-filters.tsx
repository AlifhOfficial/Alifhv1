import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import type { SavedTab } from '@/components/saved/types';

const SAVED_OPTIONS: { value: SavedTab; label: string; countKey: string }[] = [
  { value: 'favorites', label: 'Favorites', countKey: 'favoritesCount' },
  { value: 'superlikes', label: 'Superlikes', countKey: 'superlikesCount' },
];

function getStringParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseNumberParam(value?: string | string[], fallback = 0) {
  const parsed = Number(getStringParam(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isSavedTab(value: string | undefined): value is SavedTab {
  return value === 'favorites' || value === 'superlikes';
}

function buildSavedRouteParams(activeTab?: SavedTab | string) {
  if (!activeTab || activeTab === 'favorites') {
    return {};
  }

  return { tab: activeTab };
}

export default function SavedFiltersScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    activeTab?: string | string[];
    favoritesCount?: string | string[];
    superlikesCount?: string | string[];
  }>();

  const rawActiveTab = getStringParam(params.activeTab);
  const activeTab: SavedTab = isSavedTab(rawActiveTab) ? rawActiveTab : 'favorites';

  function handleSelect(nextTab: SavedTab) {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.dismissTo({
      pathname: '/saved',
      params: buildSavedRouteParams(nextTab),
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Filter Saved
        </Text>
      </View>

      <View style={styles.list}>
        {SAVED_OPTIONS.map((option) => {
          const selected = option.value === activeTab;
          const count = parseNumberParam(params[option.countKey as keyof typeof params], 0);

          return (
            <HapticPressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={styles.listItem}
            >
              <Text
                variant={selected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
                style={{ color: selected ? colors.sheetLabel : colors.sheetLabelMuted }}
              >
                {option.label}
              </Text>

              {count > 0 ? (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: selected ? colors.sheetLabel : colors.sheetBorder,
                    },
                  ]}
                >
                  <Text
                    variant="footnoteEmphasized"
                    style={{ color: selected ? colors.sheet : colors.sheetLabelMuted }}
                  >
                    {count}
                  </Text>
                </View>
              ) : null}
            </HapticPressable>
          );
        })}
      </View>

      <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
    alignItems: 'center',
  },
  list: {
    gap: SheetChrome.rowGap,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SheetChrome.rowPaddingVertical,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
  },
  countBadge: {
    minWidth: Sizes.iconMd + Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
});

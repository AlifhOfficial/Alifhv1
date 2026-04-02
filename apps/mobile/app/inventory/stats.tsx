import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Eye, Flame, Heart, MousePointerClick, Zap } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing, type ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getStringParam, parseNumberParam, type InventorySheetRouteParams } from '@/components/user-inventory-management/sub-operations/route-params';

function formatCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(value);
}

function calculateHotScore({
  viewCount,
  impressionCount,
  favouriteCount,
  superlikeCount,
}: {
  viewCount: number;
  impressionCount: number;
  favouriteCount: number;
  superlikeCount: number;
}) {
  const ctr = impressionCount > 0 ? viewCount / impressionCount : 0;
  const engagement = viewCount > 0 ? (favouriteCount + superlikeCount * 2) / viewCount : 0;
  const ctrScore = Math.min(ctr * 1000, 50);
  const engagementScore = Math.min(engagement * 1000, 40);
  const volumeBonus = Math.min(Math.log10(viewCount + 1) * 5, 10);

  return Math.round(ctrScore + engagementScore + volumeBonus);
}

function getHotLevel(score: number): { label: string; colorKey: keyof ColorPalette } {
  if (score >= 70) return { label: 'Hot', colorKey: 'warning' };
  if (score >= 40) return { label: 'Warm', colorKey: 'warning' };
  if (score >= 20) return { label: 'Active', colorKey: 'success' };
  return { label: 'New', colorKey: 'labelQuaternary' };
}

export default function InventoryStatsScreen() {
  const params = useLocalSearchParams() as InventorySheetRouteParams;
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const listingTitle = getStringParam(params.listingTitle) ?? 'Listing';
  const viewCount = parseNumberParam(params.viewCount);
  const impressionCount = parseNumberParam(params.impressionCount);
  const favouriteCount = parseNumberParam(params.favouriteCount);
  const superlikeCount = parseNumberParam(params.superlikeCount);
  const ctr = impressionCount > 0 ? ((viewCount / impressionCount) * 100).toFixed(1) : '0.0';
  const hotLevel = getHotLevel(
    calculateHotScore({ viewCount, impressionCount, favouriteCount, superlikeCount }),
  );

  const stats = [
    { label: 'Views', value: viewCount, icon: Eye, color: colors.sheetLabel },
    { label: 'Impressions', value: impressionCount, icon: MousePointerClick, color: colors.sheetLabel },
    { label: 'Saves', value: favouriteCount, icon: Heart, color: colors.favorite },
    { label: 'Superlikes', value: superlikeCount, icon: Zap, color: colors.warning },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Insights
        </Text>
      </View>

      <View style={[styles.previewCard, { backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }]}> 
        <View style={[styles.previewIcon, { backgroundColor: colors.fill2 }]}> 
          <Ionicons name="stats-chart-outline" size={Sizes.iconSm} color={colors.sheetLabelMuted} />
        </View>
        <Text variant={SheetTypography.rowLabelSelected} numberOfLines={2} style={{ color: colors.sheetLabel, flex: 1 }}>
          {listingTitle}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: colors.sheetSurface }]}>
          <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
            Click Rate
          </Text>
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
            {ctr}%
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.sheetSurface }]}>
          <Text variant={SheetTypography.supporting} style={{ color: colors.sheetLabelMuted }}>
            Engagement
          </Text>
          <View style={styles.metricValueRow}>
            <Flame size={16} color={colors[hotLevel.colorKey]} />
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors[hotLevel.colorKey] }}>
              {hotLevel.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const isLast = index === stats.length - 1;
          return (
            <View
              key={stat.label}
              style={[
                styles.listItem,
                {
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.sheetBorder,
                },
              ]}
            >
              <View style={styles.listItemLeft}>
                <IconComponent size={16} color={stat.color} fill={stat.label === 'Saves' ? stat.color : 'none'} />
                <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
                  {stat.label}
                </Text>
              </View>
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
                {formatCount(stat.value)}
              </Text>
            </View>
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
    paddingVertical: SheetChrome.rowPaddingVertical,
    marginBottom: Spacing.md,
  },
  previewIcon: {
    width: Sizes.avatarSm + Spacing.lg,
    height: Sizes.avatarSm + Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  list: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SheetChrome.rowPaddingVertical,
    paddingHorizontal: SheetChrome.rowPaddingHorizontal,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
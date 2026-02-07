/**
 * Stats Grid Component
 * 2x2 grid showing profile statistics
 */

import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';

import { Typography } from '@/constants/theme';
import type { ThemeColors, ProfileStats } from './types';

interface StatItemProps {
  label: string;
  value: string | number;
  colors: ThemeColors;
  showStar?: boolean;
}

function StatItem({ label, value, colors, showStar }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
      <View style={styles.valueRow}>
        {showStar && value !== '—' && (
          <Star size={16} color="#FACC15" fill="#FACC15" strokeWidth={0} style={styles.starIcon} />
        )}
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

interface StatsGridProps {
  stats: ProfileStats;
  platformRating: number | null;
  colors: ThemeColors;
}

export function StatsGrid({ stats, platformRating, colors }: StatsGridProps) {
  // Check if any stats have data
  const hasListings = stats.listings !== null && stats.listings !== undefined;
  const hasSold = stats.sold !== null && stats.sold !== undefined;
  const hasResponse = stats.responseRate !== null && stats.responseRate !== undefined;
  const hasRating = platformRating !== null && platformRating !== undefined;

  // Build array of available stats
  const availableStats: Array<{
    label: string;
    value: string;
    showStar?: boolean;
  }> = [];

  if (hasListings) {
    availableStats.push({ label: 'Listings', value: String(stats.listings) });
  }
  if (hasSold) {
    availableStats.push({ label: 'Sold', value: String(stats.sold) });
  }
  if (hasResponse) {
    availableStats.push({ label: 'Response', value: `${stats.responseRate}%` });
  }
  if (hasRating) {
    availableStats.push({ label: 'Rating', value: platformRating.toFixed(1), showStar: true });
  }

  // Don't render if no stats available
  if (availableStats.length === 0) {
    return null;
  }

  // Render based on number of stats
  if (availableStats.length <= 2) {
    return (
      <Animated.View
        entering={FadeInDown.delay(150).duration(350)}
        style={[styles.container, { backgroundColor: colors.surface }]}
      >
        <View style={styles.row}>
          {availableStats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 && (
                <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
              )}
              <StatItem
                label={stat.label}
                value={stat.value}
                colors={colors}
                showStar={stat.showStar}
              />
            </React.Fragment>
          ))}
        </View>
      </Animated.View>
    );
  }

  // 3-4 stats: 2x2 grid
  const topRow = availableStats.slice(0, 2);
  const bottomRow = availableStats.slice(2, 4);

  return (
    <Animated.View
      entering={FadeInDown.delay(150).duration(350)}
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <View style={styles.row}>
        {topRow.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 && (
              <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
            )}
            <StatItem
              label={stat.label}
              value={stat.value}
              colors={colors}
              showStar={stat.showStar}
            />
          </React.Fragment>
        ))}
      </View>
      {bottomRow.length > 0 && (
        <>
          <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            {bottomRow.map((stat, index) => (
              <React.Fragment key={stat.label}>
                {index > 0 && (
                  <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                )}
                <StatItem
                  label={stat.label}
                  value={stat.value}
                  colors={colors}
                  showStar={stat.showStar}
                />
              </React.Fragment>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginBottom: 28,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  horizontalDivider: {
    height: StyleSheet.hairlineWidth,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  statLabel: {
    fontSize: Typography.caption2.fontSize,
    lineHeight: Typography.caption2.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  statValue: {
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    fontFamily: 'Inter_700Bold',
    fontWeight: Typography.h2.fontWeight as any,
    letterSpacing: Typography.h2.letterSpacing,
  },
});

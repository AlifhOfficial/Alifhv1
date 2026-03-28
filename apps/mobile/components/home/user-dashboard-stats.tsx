import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Spacing, Radius, Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui';
import { type UserDashboardStats } from '@/lib/dashboard-api';

interface UserDashboardStatsCardProps {
  stats?: UserDashboardStats | null;
  isLoading?: boolean;
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return value.toString();
};

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const maxValue = Math.max(...data, 1);
  return (
    <View style={styles.chartContainer}>
      {data.map((val, i) => {
        const heightPercentage = Math.max((val / maxValue) * 100, 10);
        return (
          <View key={i} style={styles.chartBarWrapper}>
            <View
              style={[
                styles.chartBar,
                { height: `${heightPercentage}%` as any, backgroundColor: color }
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const generateMockTrend = (currentValue: number) => {
  if (currentValue === 0) return [0, 0, 0, 0, 0, 0, 0];
  return [
    currentValue * 0.4,
    currentValue * 0.6,
    currentValue * 0.5,
    currentValue * 0.8,
    currentValue * 0.7,
    currentValue * 0.9,
    currentValue,
  ].map(Math.floor);
};

function StatCard({ 
  label, 
  value, 
  color, 
  trendData,
  colors 
}: { 
  label: string; 
  value: string; 
  color: string; 
  trendData: number[];
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[Typography.subheading, { color: colors.labelSecondary }]}>{label}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[Typography.hero, { color: colors.label, marginRight: Spacing.xl }]}>{value}</Text>
        <MiniBarChart data={trendData} color={color} />
      </View>
    </View>
  );
}

export function UserDashboardStatsCard({ stats, isLoading = false }: UserDashboardStatsCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  if (isLoading) {
    return (
      <View style={styles.root}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} width="100%" height={120} borderRadius={Radius['2xl']} />
        ))}
      </View>
    );
  }

  if (!stats) return null;

  const viewsTrendData = stats.viewsTrend?.map(t => t.views) || generateMockTrend(stats.totalViews);

  return (
    <View style={styles.root}>
      <StatCard 
        label="Active Listings" 
        value={formatCompact(stats.activeListings)} 
        color={colors.primary} 
        trendData={generateMockTrend(stats.activeListings)}
        colors={colors}
      />
      <StatCard 
        label="Total Views" 
        value={formatCompact(stats.totalViews)} 
        color={colors.info} 
        trendData={viewsTrendData}
        colors={colors}
      />
      <StatCard 
        label="Total Saves" 
        value={formatCompact(stats.totalSaves)} 
        color={colors.warning} 
        trendData={generateMockTrend(stats.totalSaves)}
        colors={colors}
      />
      <StatCard 
        label="Items Sold" 
        value={formatCompact(stats.soldCount)} 
        color={colors.success} 
        trendData={generateMockTrend(stats.soldCount)}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.lg,
  },
  card: {
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    flexDirection: 'column',
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.full,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: Spacing.xs,
    flex: 1,
    maxWidth: 120,
  },
  chartBarWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
});

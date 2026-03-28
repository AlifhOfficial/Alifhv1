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

/* ── Visual: 7-day bar chart (real trend data) ─────────────────────────── */
function TrendChart({ data, color }: { data: number[]; color: string }) {
  const maxValue = Math.max(...data, 1);
  return (
    <View style={styles.trendRow}>
      {data.map((val, i) => {
        const pct = Math.max((val / maxValue) * 100, 6);
        return (
          <View key={i} style={styles.trendBarWrap}>
            <View
              style={[styles.trendBar, { height: `${pct}%` as any, backgroundColor: color }]}
            />
          </View>
        );
      })}
    </View>
  );
}

/* ── Visual: horizontal progress bar (ratio) ───────────────────────────── */
function ProgressBar({ value, max, color, trackColor }: {
  value: number; max: number; color: string; trackColor: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

/* ── Visual: percentage ring (circular gauge) ──────────────────────────── */
function PercentRing({ value, color, trackColor }: {
  value: number; color: string; trackColor: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamped / 100) * circ;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: trackColor,
        position: 'absolute',
      }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: color,
        borderTopColor: clamped >= 25 ? color : 'transparent',
        borderRightColor: clamped >= 50 ? color : 'transparent',
        borderBottomColor: clamped >= 75 ? color : 'transparent',
        borderLeftColor: clamped < 100 ? 'transparent' : color,
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
      }} />
      <Text style={[Typography.caption, { color }]}>{clamped}%</Text>
    </View>
  );
}

/* ── Card 1: Listings Health ───────────────────────────────────────────── */
function ListingsCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[Typography.subheading, { color: colors.labelSecondary }]}>Listings</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.hero, { color: colors.primary }]}>
            {formatCompact(stats.activeListings)}
          </Text>
          <Text style={[Typography.bodySm, { color: colors.labelTertiary }]}>
            of {formatCompact(stats.totalListings)} active
          </Text>
        </View>
        {stats.expiringSoon > 0 && (
          <View style={[styles.alertPill, { backgroundColor: colors.warningMuted }]}>
            <Text style={[Typography.caption, { color: colors.warning }]}>
              {stats.expiringSoon} expiring
            </Text>
          </View>
        )}
      </View>

      <ProgressBar
        value={stats.activeListings}
        max={stats.totalListings}
        color={colors.primary}
        trackColor={colors.fill3}
      />
    </View>
  );
}

/* ── Card 2: Views Trend (real 7-day data) ─────────────────────────────── */
function ViewsTrendCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  const trend = stats.viewsTrend?.slice(-7) ?? [];
  const trendData = trend.map(t => t.views);
  const hasData = trendData.length > 0 && trendData.some(v => v > 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.row}>
        <Text style={[Typography.subheading, { color: colors.labelSecondary }]}>Views</Text>
        <Text style={[Typography.caption, { color: colors.labelTertiary }]}>Last 7 days</Text>
      </View>

      <View style={styles.row}>
        <Text style={[Typography.hero, { color: colors.info }]}>
          {formatCompact(stats.totalViews)}
        </Text>
        <Text style={[Typography.bodySm, { color: colors.labelTertiary }]}>
          ~{formatCompact(stats.avgViewsPerListing)} per listing
        </Text>
      </View>

      {hasData ? (
        <TrendChart data={trendData} color={colors.info} />
      ) : (
        <Text style={[Typography.bodySm, { color: colors.labelTertiary, textAlign: 'center', paddingVertical: Spacing.lg }]}>
          No trend data yet
        </Text>
      )}
    </View>
  );
}

/* ── Card 3: Engagement (save rate + saves) ────────────────────────────── */
function EngagementCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[Typography.subheading, { color: colors.labelSecondary }]}>Engagement</Text>

      <View style={styles.row}>
        <View style={{ flex: 1, gap: Spacing.xs }}>
          <Text style={[Typography.hero, { color: colors.success }]}>
            {formatCompact(stats.totalSaves)}
          </Text>
          <Text style={[Typography.bodySm, { color: colors.labelTertiary }]}>
            saves from {formatCompact(stats.totalViews)} views
          </Text>
        </View>
        <PercentRing value={stats.saveRate} color={colors.success} trackColor={colors.fill3} />
      </View>
    </View>
  );
}

/* ── Card 4: Sales ─────────────────────────────────────────────────────── */
function SalesCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  const conversionRate = stats.totalListings > 0
    ? Math.round((stats.soldCount / stats.totalListings) * 100)
    : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[Typography.subheading, { color: colors.labelSecondary }]}>Sales</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.hero, { color: colors.success }]}>
            {formatCompact(stats.soldCount)}
          </Text>
          <Text style={[Typography.bodySm, { color: colors.labelTertiary }]}>
            sold ({conversionRate}% of listings)
          </Text>
        </View>
      </View>

      <ProgressBar
        value={stats.soldCount}
        max={stats.totalListings}
        color={colors.success}
        trackColor={colors.fill3}
      />
    </View>
  );
}

/* ── Card 5: Your Activity (saves + superlikes) ───────────────────────── */
function ActivityCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  const totalSuperlikes = stats.superlikesUsed + stats.superlikesRemaining;

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[Typography.subheading, { color: colors.labelSecondary }]}>Your Activity</Text>

      <View style={styles.pairRow}>
        <View style={[styles.pairCell, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.title, { color: colors.favorite }]}>
            {formatCompact(stats.mySaves)}
          </Text>
          <Text style={[Typography.caption, { color: colors.labelTertiary }]}>Saved</Text>
        </View>
        <View style={[styles.pairCell, { backgroundColor: colors.surface }]}>
          <Text style={[Typography.title, { color: colors.amna }]}>
            {stats.superlikesRemaining}
          </Text>
          <Text style={[Typography.caption, { color: colors.labelTertiary }]}>Superlikes left</Text>
        </View>
      </View>

      {totalSuperlikes > 0 && (
        <View style={{ gap: Spacing.xs }}>
          <View style={styles.row}>
            <Text style={[Typography.caption, { color: colors.labelTertiary }]}>Superlikes</Text>
            <Text style={[Typography.caption, { color: colors.labelTertiary }]}>
              {stats.superlikesUsed}/{totalSuperlikes} used
            </Text>
          </View>
          <ProgressBar
            value={stats.superlikesUsed}
            max={totalSuperlikes}
            color={colors.amna}
            trackColor={colors.fill3}
          />
        </View>
      )}
    </View>
  );
}

/* ── Main export ───────────────────────────────────────────────────────── */
export function UserDashboardStatsCard({ stats, isLoading = false }: UserDashboardStatsCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  if (isLoading) {
    return (
      <View style={styles.root}>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} width="100%" height={130} borderRadius={Radius['2xl']} />
        ))}
      </View>
    );
  }

  if (!stats) return null;

  return (
    <View style={styles.root}>
      <ListingsCard stats={stats} colors={colors} />
      <ViewsTrendCard stats={stats} colors={colors} />
      <EngagementCard stats={stats} colors={colors} />
      <SalesCard stats={stats} colors={colors} />
      <ActivityCard stats={stats} colors={colors} />
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
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  pairRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pairCell: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  /* ── Progress bar ──────────────────────── */
  progressTrack: {
    height: Spacing.sm,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  /* ── Trend bars ────────────────────────── */
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 56,
    gap: Spacing.xs,
  },
  trendBarWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendBar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
});

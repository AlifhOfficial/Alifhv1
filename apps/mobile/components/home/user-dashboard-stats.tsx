import { Text, Skeleton } from '@/components/ui';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Layout, Sizes, scale } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { type UserDashboardStats } from '@/lib/dashboard-api';

interface UserDashboardStatsCardProps {
  stats?: UserDashboardStats | null;
  isLoading?: boolean;
}

const STATS_RING_SIZE = Sizes.bubbleMd + Spacing.md;
const STATS_RING_STROKE = scale(5, 0.45);
const STATS_CARD_SKELETON_HEIGHT = scale(130, 0.7);
const TREND_ROW_HEIGHT = scale(56, 0.7);

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
  const size = STATS_RING_SIZE;
  const stroke = STATS_RING_STROKE;
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
      <Text variant="caption1Emphasized" style={{ color }}>{clamped}%</Text>
    </View>
  );
}

/* ── Card 1: Listings Health ───────────────────────────────────────────── */
function ListingsCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  return (
    <Animated.View entering={FadeInDown.delay(0).duration(350)} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Listings</Text>
        {stats.expiringSoon > 0 && (
          <View style={[styles.alertPill, { backgroundColor: colors.warningMuted }]}>
            <Text variant="caption1Emphasized" style={{ color: colors.warning }}>
              {stats.expiringSoon} expiring
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Active</Text>
        <Text variant="title2Emphasized" style={{ color: colors.primary }}>
          {formatCompact(stats.activeListings)}
        </Text>
      </View>
      <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Total</Text>
        <Text variant="subheadEmphasized">{formatCompact(stats.totalListings)}</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.visualRow}>
        <ProgressBar
          value={stats.activeListings}
          max={stats.totalListings}
          color={colors.primary}
          trackColor={colors.fill3}
        />
      </View>
    </Animated.View>
  );
}

/* ── Card 2: Views Trend (real 7-day data) ─────────────────────────────── */
function ViewsTrendCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  const trend = stats.viewsTrend?.slice(-7) ?? [];
  const trendData = trend.map(t => t.views);
  const hasData = trendData.length > 0 && trendData.some(v => v > 0);

  return (
    <Animated.View entering={FadeInDown.delay(50).duration(350)} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Views</Text>
        <Text variant="caption1Emphasized" tone="muted">Last 7 days</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Total</Text>
        <Text variant="title2Emphasized" style={{ color: colors.info }}>
          {formatCompact(stats.totalViews)}
        </Text>
      </View>
      <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Avg per listing</Text>
        <Text variant="subheadEmphasized">~{formatCompact(stats.avgViewsPerListing)}</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.visualRow}>
        {hasData ? (
          <TrendChart data={trendData} color={colors.info} />
        ) : (
          <Text variant="subhead" tone="muted" style={{ textAlign: 'center', paddingVertical: Spacing.sm }}>
            No trend data yet
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

/* ── Card 3: Engagement (save rate + saves) ────────────────────────────── */
function EngagementCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(350)} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Engagement</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Saves</Text>
        <Text variant="title2Emphasized" style={{ color: colors.success }}>
          {formatCompact(stats.totalSaves)}
        </Text>
      </View>
      <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Save rate</Text>
        <PercentRing value={stats.saveRate} color={colors.success} trackColor={colors.fill3} />
      </View>
    </Animated.View>
  );
}

/* ── Card 4: Sales ─────────────────────────────────────────────────────── */
function SalesCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  const conversionRate = stats.totalListings > 0
    ? Math.round((stats.soldCount / stats.totalListings) * 100)
    : 0;

  return (
    <Animated.View entering={FadeInDown.delay(150).duration(350)} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Sales</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Sold</Text>
        <Text variant="title2Emphasized" style={{ color: colors.success }}>
          {formatCompact(stats.soldCount)}
        </Text>
      </View>
      <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Conversion rate</Text>
        <Text variant="subheadEmphasized">{conversionRate}%</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.visualRow}>
        <ProgressBar
          value={stats.soldCount}
          max={stats.totalListings}
          color={colors.success}
          trackColor={colors.fill3}
        />
      </View>
    </Animated.View>
  );
}

/* ── Card 5: Your Activity (saves + superlikes) ───────────────────────── */
function ActivityCard({ stats, colors }: { stats: UserDashboardStats; colors: typeof Colors.light }) {
  const totalSuperlikes = stats.superlikesUsed + stats.superlikesRemaining;

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(350)} style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Your Activity</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Saved</Text>
        <Text variant="title2Emphasized" style={{ color: colors.favorite }}>
          {formatCompact(stats.mySaves)}
        </Text>
      </View>
      <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

      <View style={styles.statRow}>
        <Text variant="subhead" tone="secondary">Superlikes left</Text>
        <Text variant="subheadEmphasized" style={{ color: colors.amna }}>
          {stats.superlikesRemaining}
        </Text>
      </View>

      {totalSuperlikes > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.visualRow, { gap: Spacing.sm }]}>
            <View style={styles.row}>
              <Text variant="caption1Emphasized" tone="muted">Superlikes used</Text>
              <Text variant="caption1Emphasized" tone="muted">
                {stats.superlikesUsed}/{totalSuperlikes}
              </Text>
            </View>
            <ProgressBar
              value={stats.superlikesUsed}
              max={totalSuperlikes}
              color={colors.amna}
              trackColor={colors.fill3}
            />
          </View>
        </>
      )}
    </Animated.View>
  );
}

/* ── Main export ───────────────────────────────────────────────────────── */
export function UserDashboardStatsCard({ stats, isLoading = false }: UserDashboardStatsCardProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.root}>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} width="100%" height={STATS_CARD_SKELETON_HEIGHT} borderRadius={Radius.xl} />
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
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visualRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  alertPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
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
    height: TREND_ROW_HEIGHT,
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

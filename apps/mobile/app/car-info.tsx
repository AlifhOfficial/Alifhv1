import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Crosshair, Flame, Info, Lightbulb, User, Zap } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, Sizes, Spacing, Typography, type ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getListingSummary, type ListingSummary } from '@/lib/summary-api';

const DEAL_RATING_CONFIG: Record<string, { label: string; colorKey: keyof ColorPalette }> = {
  steal: { label: 'STEAL', colorKey: 'success' },
  solid: { label: 'SOLID', colorKey: 'info' },
  fair: { label: 'FAIR', colorKey: 'labelSecondary' },
  steep: { label: 'STEEP', colorKey: 'warning' },
  unclear: { label: '-', colorKey: 'labelSecondary' },
};

export default function CarInfoScreen() {
  const params = useLocalSearchParams<{
    listingId?: string;
    make?: string;
    model?: string;
    year?: string;
    price?: string;
    sellerName?: string;
  }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const listingId = params.listingId ?? null;
  const make = params.make;
  const model = params.model;
  const year = params.year ? Number(params.year) : undefined;
  const price = params.price ? Number(params.price) : undefined;
  const sellerName = params.sellerName;

  const {
    data: summary,
    isLoading,
    isError,
  } = useQuery<ListingSummary>({
    queryKey: ['listing-summary', listingId],
    queryFn: () => getListingSummary(listingId as string),
    enabled: Boolean(listingId),
    staleTime: 60 * 1000,
  });
  const error = isError ? 'DarkWeave could not read this one' : null;

  const carTitle = [year, make, model].filter(Boolean).join(' ');
  const formattedPrice = price
    ? new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
      }).format(price)
    : null;

  const dealConfig = summary ? DEAL_RATING_CONFIG[summary.dealRating] : null;

  const contextMetrics = summary?.context
    ? [
        `${summary.context.mileage.toLocaleString()} km`,
        summary.context.specs,
        summary.context.condition === 'new' ? 'New' : null,
        summary.context.emirate,
        summary.context.transmission,
        summary.context.fuelType,
        summary.context.featureCount ? `${summary.context.featureCount} features` : null,
      ].filter(Boolean)
    : [];

  const renderFlowSection = useCallback(
    (
      title: string,
      icon: React.ReactNode,
      content: React.ReactNode,
      iconBgColor: string,
      withBorder = true,
      rightEl?: React.ReactNode,
    ) => (
      <View style={styles.flowSection}>
        <View style={styles.flowHeader}>
          <View style={[styles.flowIcon, { backgroundColor: iconBgColor }]}>{icon}</View>
          <Text
            variant="caption1Emphasized"
            style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }}
            uppercase
          >
            {title}
          </Text>
          {rightEl}
        </View>
        <View style={[styles.flowContent, { borderLeftColor: colors.border, borderLeftWidth: withBorder ? 1 : 0 }]}>
          {content}
        </View>
      </View>
    ),
    [colors],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.sheet }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SheetHeader title="DarkWeave" />

      <View style={styles.carHeader}>
        {carTitle ? <Text variant="subheadEmphasized">{carTitle}</Text> : null}
        <View style={styles.priceRow}>
          {formattedPrice ? <Text variant="title3Emphasized" style={{ color: colors.primary }}>{formattedPrice}</Text> : null}
          {dealConfig ? (
            <View style={[styles.dealBadge, { borderColor: colors[dealConfig.colorKey] }]}> 
              <Text
                variant="caption1Emphasized"
                style={{ color: colors[dealConfig.colorKey], letterSpacing: Typography.footnoteEmphasized.letterSpacing }}
                uppercase
              >
                {dealConfig.label}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="subhead" style={{ color: colors.labelSecondary }} tone="secondary">Weaving the thread...</Text>
        </View>
      ) : null}

      {error && !isLoading ? (
        <View style={styles.centeredState}>
          <Zap size={Sizes.iconLg} color={colors.labelTertiary} />
          <Text variant="subhead" style={{ color: colors.labelSecondary }} tone="secondary">{error}</Text>
        </View>
      ) : null}

      {summary && !isLoading ? (
        <View style={styles.insightContainer}>
          {contextMetrics.length > 0 &&
            renderFlowSection(
              'DATA CONSIDERED',
              <Info size={Sizes.iconXs} color={colors.labelSecondary} />,
              <View style={styles.metricsWrap}>
                {contextMetrics.map((metric, i) => (
                  <View key={String(i)} style={[styles.metricChip, { backgroundColor: colors.fill2 }]}> 
                    <Text variant="caption1Emphasized" style={{ color: colors.labelSecondary }} uppercase>{String(metric)}</Text>
                  </View>
                ))}
              </View>,
              colors.fill2,
            )}

          {summary.darkTake &&
            renderFlowSection(
              'THE TAKE',
              <Flame size={Sizes.iconXs} color={colors.warning} />,
              <Text variant="body" style={{ color: colors.label }}>{summary.darkTake}</Text>,
              colors.warningMuted,
            )}

          {(summary.machineNotes ?? []).length > 0 &&
            renderFlowSection(
              'THE READ',
              <Crosshair size={Sizes.iconXs} color={colors.labelSecondary} />,
              <>
                {(summary.machineNotes ?? []).map((note, i) => (
                  <View key={String(i)} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                    <Text variant="subhead" style={{ flex: 1, color: colors.label }}>{note}</Text>
                  </View>
                ))}
              </>,
              colors.fill2,
            )}

          {(summary.flags ?? []).length > 0 &&
            renderFlowSection(
              'WORTH NOTING',
              <AlertTriangle size={Sizes.iconXs} color={colors.warning} />,
              <>
                {(summary.flags ?? []).map((flag, i) => {
                  const flagColor = flag.type === 'red' ? colors.warning : colors.success;
                  return (
                    <View key={String(i)} style={[styles.flagItem, { borderLeftColor: flagColor }]}>
                      <Text variant="subhead" style={{ color: colors.label }}>{flag.text}</Text>
                    </View>
                  );
                })}
              </>,
              colors.warningMuted,
            )}

          {summary.sellerVibe &&
            renderFlowSection(
              sellerName ? sellerName.toUpperCase() : 'SELLER',
              <User size={Sizes.iconXs} color={colors.labelSecondary} />,
              <Text variant="subhead" style={{ color: colors.label }}>{summary.sellerVibe}</Text>,
              colors.fill2,
              true,
              summary.context?.sellerRating ? (
                <View style={[styles.ratingBadge, { backgroundColor: colors.fill2 }]}> 
                  <Text variant="caption1Emphasized" style={{ color: colors.label }} uppercase>
                    {summary.context.sellerRating.toFixed(1)}
                  </Text>
                  {summary.context.sellerReviewCount ? (
                    <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary }} uppercase>
                      · {summary.context.sellerReviewCount}
                    </Text>
                  ) : null}
                </View>
              ) : undefined,
            )}

          {summary.negotiationTip &&
            renderFlowSection(
              'GOOD TO KNOW',
              <Lightbulb size={Sizes.iconXs} color={colors.success} />,
              <Text variant="subhead" style={{ color: colors.label }}>{summary.negotiationTip}</Text>,
              colors.successMuted,
              false,
            )}

          <View style={styles.disclaimer}>
            <Text variant="subhead" style={{ color: colors.labelTertiary, textAlign: 'center' }} tone="secondary">
              AI-generated · may not be accurate · do your own check
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  topBar: {
    paddingTop: Spacing.md,
    alignItems: 'flex-end',
  },
  closeAction: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  carHeader: {
    gap: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dealBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
  },
  centeredState: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing['5xl'],
  },
  insightContainer: {
    gap: Spacing.sm,
  },
  flowSection: {
    paddingBottom: Spacing.lg,
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flowIcon: {
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowContent: {
    marginLeft: Spacing.md,
    paddingLeft: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  metricsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  bulletDot: {
    width: Spacing.xs,
    height: Spacing.xs,
    borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
  flagItem: {
    borderLeftWidth: 2,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    marginLeft: 'auto',
  },
  disclaimer: {
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
});

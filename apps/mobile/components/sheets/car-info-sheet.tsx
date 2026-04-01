/**
 * DarkWeave Sheet — AI-powered listing insight sheet
 * 
 * Triggered by long-press on CarCardM.
 * Sharp reads, bold takes, no filler.
 * 
 * Flow: Context → Take → Analysis → Flags → Seller → Tips
 * 
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling.
 */

import { Text, SheetFloatingCloseHandle } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, type BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Zap, 
  Crosshair,
  Flame,
  AlertTriangle,
  Info,
  User,
  Lightbulb,
} from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Typography, SheetSnapPoints, type ColorPalette } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getListingSummary, type ListingSummary } from '@/lib/summary-api';

// ============================================================================
// DEAL RATING CONFIG — uses semantic color keys resolved via theme
// ============================================================================

const DEAL_RATING_CONFIG: Record<string, { label: string; colorKey: keyof ColorPalette }> = {
  steal: { label: 'STEAL', colorKey: 'success' },
  solid: { label: 'SOLID', colorKey: 'info' },
  fair: { label: 'FAIR', colorKey: 'labelSecondary' },
  steep: { label: 'STEEP', colorKey: 'warning' },
  unclear: { label: '—', colorKey: 'labelSecondary' },
};

// ============================================================================
// TYPES
// ============================================================================

interface CarInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  listingId: string | null;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  sellerName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CarInfoSheet({ 
  visible, 
  onClose, 
  listingId,
  make,
  model,
  year,
  price,
  sellerName,
}: CarInfoSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [summary, setSummary] = useState<ListingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Fetch insight when sheet opens
  useEffect(() => {
    if (visible && listingId) {
      setIsLoading(true);
      setError(null);
      setSummary(null);

      getListingSummary(listingId)
        .then((data) => {
          setSummary(data);
        })
        .catch((err) => {
          console.error('[DarkWeave] Failed to fetch insight:', err);
          setError('DarkWeave couldn\'t read this one');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [visible, listingId]);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => <SheetFloatingCloseHandle {...props} onPress={onClose} />,
    [onClose]
  );

  const carTitle = [year, make, model].filter(Boolean).join(' ');
  const formattedPrice = price 
    ? new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0 }).format(price)
    : null;

  const dealConfig = summary ? DEAL_RATING_CONFIG[summary.dealRating] : null;

  // Build context metrics array
  const contextMetrics = summary?.context ? [
    `${summary.context.mileage.toLocaleString()} km`,
    summary.context.specs,
    summary.context.condition === 'new' ? 'New' : null,
    summary.context.emirate,
    summary.context.transmission,
    summary.context.fuelType,
    summary.context.featureCount ? `${summary.context.featureCount} features` : null,
  ].filter(Boolean) : [];

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SheetSnapPoints.detail}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.sheet,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleComponent={renderHandle}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Zap size={Sizes.iconSm} color={colors.label} fill={colors.label} />
            <Text variant="subheadEmphasized">DarkWeave</Text>
          </View>
        </View>

        {/* Car Title + Price + Deal Badge */}
        <View style={styles.carHeader}>
          {carTitle ? <Text variant="subheadEmphasized">{carTitle}</Text> : null}
          <View style={styles.priceRow}>
            {formattedPrice && (
              <Text variant="title3Emphasized" style={{ color: colors.primary }}>{formattedPrice}</Text>
            )}
            {dealConfig && (
              <View style={[styles.dealBadge, { borderColor: colors[dealConfig.colorKey] }]}>
                <Text variant="caption1Emphasized" style={{ color: colors[dealConfig.colorKey], letterSpacing: Typography.footnoteEmphasized.letterSpacing }} uppercase>
                  {dealConfig.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centeredState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text variant="subhead" style={{ color: colors.labelSecondary }} tone="secondary">
              Weaving the thread...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.centeredState}>
            <Zap size={Sizes.iconLg} color={colors.labelTertiary} />
            <Text variant="subhead" style={{ color: colors.labelSecondary }} tone="secondary">
              {error}
            </Text>
          </View>
        )}

        {/* DarkWeave Insight Content */}
        {summary && !isLoading && (
          <View style={styles.insightContainer}>
            
            {/* ─── Step 1: Context Metrics (Data Points) ─── */}
            {contextMetrics.length > 0 && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.fill2 }]}>
                    <Info size={Sizes.iconXs} color={colors.labelSecondary} />
                  </View>
                  <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }} uppercase>
                    DATA CONSIDERED
                  </Text>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  <View style={styles.metricsWrap}>
                    {contextMetrics.map((metric, i) => (
                      <View key={i} style={[styles.metricChip, { backgroundColor: colors.fill2 }]}>
                        <Text variant="caption1Emphasized" style={{ color: colors.labelSecondary }} uppercase>{metric}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ─── Step 2: Dark Take (The Headline) ─── */}
            {summary.darkTake && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.warningMuted }]}>
                    <Flame size={Sizes.iconXs} color={colors.warning} />
                  </View>
                  <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }} uppercase>
                    THE TAKE
                  </Text>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  <Text variant="body" style={{ color: colors.label, }}>
                    {summary.darkTake}
                  </Text>
                </View>
              </View>
            )}

            {/* ─── Step 3: Machine Notes (The Read) ─── */}
            {(summary.machineNotes ?? []).length > 0 && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.fill2 }]}>
                    <Crosshair size={Sizes.iconXs} color={colors.labelSecondary} />
                  </View>
                  <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }} uppercase>
                    THE READ
                  </Text>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  {(summary.machineNotes ?? []).map((note, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                      <Text variant="subhead" style={{ flex: 1, color: colors.label }}>
                        {note}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ─── Step 4: Flags (Worth Noting) ─── */}
            {(summary.flags ?? []).length > 0 && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.warningMuted }]}>
                    <AlertTriangle size={Sizes.iconXs} color={colors.warning} />
                  </View>
                  <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }} uppercase>
                    WORTH NOTING
                  </Text>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  {(summary.flags ?? []).map((flag, i) => {
                    const flagColor = flag.type === 'red' ? colors.warning : colors.success;
                    return (
                      <View key={i} style={[styles.flagItem, { borderLeftColor: flagColor }]}>
                        <Text variant="subhead" style={{ color: colors.label }}>
                          {flag.text}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ─── Step 5: Seller Read ─── */}
            {summary.sellerVibe && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.fill2 }]}>
                    <User size={Sizes.iconXs} color={colors.labelSecondary} />
                  </View>
                  <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }} uppercase>
                    {sellerName ? sellerName.toUpperCase() : 'SELLER'}
                  </Text>
                  {summary.context?.sellerRating && (
                    <View style={[styles.ratingBadge, { backgroundColor: colors.fill2 }]}>
                      <Text variant="caption1Emphasized" style={{ color: colors.label }} uppercase>
                        {summary.context.sellerRating.toFixed(1)}
                      </Text>
                      {summary.context.sellerReviewCount && (
                        <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary }} uppercase>
                          · {summary.context.sellerReviewCount}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  <Text variant="subhead" style={{ color: colors.label }}>
                    {summary.sellerVibe}
                  </Text>
                </View>
              </View>
            )}

            {/* ─── Step 6: Negotiation Tip ─── */}
            {summary.negotiationTip && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.successMuted }]}>
                    <Lightbulb size={Sizes.iconXs} color={colors.success} />
                  </View>
                  <Text variant="caption1Emphasized" style={{ color: colors.labelTertiary, letterSpacing: Typography.caption1Emphasized.letterSpacing }} uppercase>
                    GOOD TO KNOW
                  </Text>
                </View>
                <View style={[styles.flowContent, styles.flowContentLast]}>
                  <Text variant="subhead" style={{ color: colors.label }}>
                    {summary.negotiationTip}
                  </Text>
                </View>
              </View>
            )}

            {/* ─── Disclaimer ─── */}
            <View style={styles.disclaimer}>
              <Text variant="subhead" style={{ color: colors.labelTertiary, textAlign: 'center' }} tone="secondary">
                AI-generated · may not be accurate · do your own check
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: insets.bottom + Spacing.lg }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },

  // ─── Header ───
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

  // ─── Car Header ───
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

  // ─── Loading / Error States ───
  centeredState: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing['5xl'],
  },

  // ─── Insight Container ───
  insightContainer: {
    gap: Spacing.sm,
  },

  // ─── Flow Tree Structure ───
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
    borderLeftWidth: 1,
  },
  flowContentLast: {
    borderLeftWidth: 0,
  },

  // ─── Context Metrics ───
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

  // ─── Bullet Points ───
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

  // ─── Flags ───
  flagItem: {
    borderLeftWidth: 2,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  // ─── Rating Badge ───
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    marginLeft: 'auto',
  },

  // ─── Disclaimer ───
  disclaimer: {
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
});

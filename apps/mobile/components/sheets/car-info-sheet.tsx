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

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  Zap, 
  Crosshair,
  Flame,
  AlertTriangle,
  Info,
  User,
  Lightbulb,
} from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Data, Supporting, Label } from '@/components/ui';
import { getListingSummary, type ListingSummary } from '@/lib/summary-api';

// ============================================================================
// DEAL RATING CONFIG — outline colors only
// ============================================================================

const DEAL_RATING_CONFIG = {
  steal: { label: 'STEAL', color: '#10B981' },
  solid: { label: 'SOLID', color: '#3B82F6' },
  fair: { label: 'FAIR', color: '#737373' },
  steep: { label: 'STEEP', color: '#F59E0B' },
  unclear: { label: '—', color: '#737373' },
} as const;

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

  const snapPoints = useMemo(() => ['60%', '85%'], []);

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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Zap size={Sizes.iconSm} color={colors.text} fill={colors.text} />
            <Heading size="medium">DarkWeave</Heading>
          </View>
          <HapticPressable 
            onPress={onClose} 
            hitSlop={Spacing.md}
            style={[styles.closeButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color="#FFFFFF" />
          </HapticPressable>
        </View>

        {/* Car Title + Price + Deal Badge */}
        <View style={styles.carHeader}>
          {carTitle ? <Heading size="small">{carTitle}</Heading> : null}
          <View style={styles.priceRow}>
            {formattedPrice && (
              <Data size="large" style={{ color: colors.primary }}>{formattedPrice}</Data>
            )}
            {dealConfig && (
              <View style={[styles.dealBadge, { borderColor: dealConfig.color }]}>
                <Label size="small" style={{ color: dealConfig.color, letterSpacing: 1 }}>
                  {dealConfig.label}
                </Label>
              </View>
            )}
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centeredState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Supporting size="small" style={{ color: colors.text2 }}>
              Weaving the thread...
            </Supporting>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.centeredState}>
            <Zap size={Sizes.iconLg} color={colors.text3} />
            <Supporting size="small" style={{ color: colors.text2 }}>
              {error}
            </Supporting>
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
                    <Info size={Sizes.iconXs} color={colors.text2} />
                  </View>
                  <Label size="small" style={{ color: colors.text3, letterSpacing: 0.5 }}>
                    DATA CONSIDERED
                  </Label>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  <View style={styles.metricsWrap}>
                    {contextMetrics.map((metric, i) => (
                      <View key={i} style={[styles.metricChip, { backgroundColor: colors.fill2 }]}>
                        <Label size="small" style={{ color: colors.text2 }}>{metric}</Label>
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
                  <View style={[styles.flowIcon, { backgroundColor: 'rgba(255, 107, 53, 0.12)' }]}>
                    <Flame size={Sizes.iconXs} color="#FF6B35" />
                  </View>
                  <Label size="small" style={{ color: colors.text3, letterSpacing: 0.5 }}>
                    THE TAKE
                  </Label>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  <Body size="medium" style={{ color: colors.text, fontWeight: '600' }}>
                    {summary.darkTake}
                  </Body>
                </View>
              </View>
            )}

            {/* ─── Step 3: Machine Notes (The Read) ─── */}
            {(summary.machineNotes ?? []).length > 0 && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: colors.fill2 }]}>
                    <Crosshair size={Sizes.iconXs} color={colors.text2} />
                  </View>
                  <Label size="small" style={{ color: colors.text3, letterSpacing: 0.5 }}>
                    THE READ
                  </Label>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  {(summary.machineNotes ?? []).map((note, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                      <Body size="small" style={{ flex: 1, color: colors.text }}>
                        {note}
                      </Body>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ─── Step 4: Flags (Worth Noting) ─── */}
            {(summary.flags ?? []).length > 0 && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <AlertTriangle size={Sizes.iconXs} color="#F59E0B" />
                  </View>
                  <Label size="small" style={{ color: colors.text3, letterSpacing: 0.5 }}>
                    WORTH NOTING
                  </Label>
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  {(summary.flags ?? []).map((flag, i) => {
                    const flagColor = flag.type === 'red' ? '#F59E0B' : '#10B981';
                    return (
                      <View key={i} style={[styles.flagItem, { borderLeftColor: flagColor }]}>
                        <Body size="small" style={{ color: colors.text }}>
                          {flag.text}
                        </Body>
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
                    <User size={Sizes.iconXs} color={colors.text2} />
                  </View>
                  <Label size="small" style={{ color: colors.text3, letterSpacing: 0.5 }}>
                    {sellerName ? sellerName.toUpperCase() : 'SELLER'}
                  </Label>
                  {summary.context?.sellerRating && (
                    <View style={[styles.ratingBadge, { backgroundColor: colors.fill2 }]}>
                      <Label size="small" style={{ color: colors.text }}>
                        {summary.context.sellerRating.toFixed(1)}
                      </Label>
                      {summary.context.sellerReviewCount && (
                        <Label size="small" style={{ color: colors.text3 }}>
                          · {summary.context.sellerReviewCount}
                        </Label>
                      )}
                    </View>
                  )}
                </View>
                <View style={[styles.flowContent, { borderLeftColor: colors.border }]}>
                  <Body size="small" style={{ color: colors.text }}>
                    {summary.sellerVibe}
                  </Body>
                </View>
              </View>
            )}

            {/* ─── Step 6: Negotiation Tip ─── */}
            {summary.negotiationTip && (
              <View style={styles.flowSection}>
                <View style={styles.flowHeader}>
                  <View style={[styles.flowIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Lightbulb size={Sizes.iconXs} color="#10B981" />
                  </View>
                  <Label size="small" style={{ color: colors.text3, letterSpacing: 0.5 }}>
                    GOOD TO KNOW
                  </Label>
                </View>
                <View style={[styles.flowContent, styles.flowContentLast]}>
                  <Body size="small" style={{ color: colors.text }}>
                    {summary.negotiationTip}
                  </Body>
                </View>
              </View>
            )}

            {/* ─── Disclaimer ─── */}
            <View style={styles.disclaimer}>
              <Supporting size="small" style={{ color: colors.text3, textAlign: 'center' }}>
                AI-generated · may not be accurate · do your own check
              </Supporting>
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
  closeButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
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

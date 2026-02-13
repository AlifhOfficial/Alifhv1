/**
 * DarkWeave Sheet — AI-powered listing insight sheet
 * 
 * Triggered by long-press on CarCardM.
 * Sharp reads, bold takes, no filler.
 * 
 * Colors used smartly — outlines only, no fills or gradients.
 * Flags only show when genuinely warranted.
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
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Data, Supporting, Label } from '@/components/ui';
import { getListingSummary, type ListingSummary } from '@/lib/summary-api';

// ============================================================================
// DEAL RATING CONFIG — outline colors only
// ============================================================================

const DEAL_RATING_CONFIG = {
  steal: { label: 'STEAL', outlineColor: '#10B981' },
  solid: { label: 'SOLID', outlineColor: '#3B82F6' },
  fair: { label: 'FAIR', outlineColor: '#8B8B8B' },
  steep: { label: 'STEEP', outlineColor: '#F59E0B' },
  unclear: { label: '—', outlineColor: '#8B8B8B' },
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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: 36 }}
      detached
      bottomInset={insets.bottom + 20}
      style={styles.sheetContainer}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Zap size={18} color={colors.text} fill={colors.text} />
              <Heading size="medium">DarkWeave</Heading>
            </View>
            <HapticPressable 
              onPress={onClose} 
              hitSlop={Spacing.md}
              style={[styles.iconButton, { backgroundColor: colors.fillSecondary }]}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </HapticPressable>
          </View>

          {/* Car Title + Price (shown immediately) */}
          <View style={styles.carHeader}>
            {carTitle ? (
              <Heading size="small">{carTitle}</Heading>
            ) : null}
            <View style={styles.priceRow}>
              {formattedPrice ? (
                <Data size="large" style={{ color: colors.primary }}>{formattedPrice}</Data>
              ) : null}
              {/* Deal Rating Badge — outline only */}
              {dealConfig ? (
                <View style={[styles.dealBadge, { borderColor: dealConfig.outlineColor }]}>
                  <Label size="small" style={{ color: dealConfig.outlineColor, letterSpacing: 1 }}>
                    {dealConfig.label}
                  </Label>
                </View>
              ) : null}
            </View>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Supporting size="medium" style={{ color: colors.textSecondary }}>
                Weaving the thread...
              </Supporting>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Zap size={20} color={colors.textTertiary} />
              <Supporting size="medium" style={{ color: colors.textSecondary }}>
                {error}
              </Supporting>
            </View>
          )}

          {/* DarkWeave Insight Content */}
          {summary && !isLoading && (
            <>
              {/* Context — meaningful data DarkWeave studied */}
              {summary.context && (
                <View style={[styles.contextBar, { borderColor: colors.border }]}>
                  <View style={styles.contextMetrics}>
                    {[
                      `${summary.context.mileage.toLocaleString()} km`,
                      summary.context.specs,
                      summary.context.condition === 'new' ? 'New' : null,
                      summary.context.emirate,
                      summary.context.transmission,
                      summary.context.fuelType,
                      summary.context.featureCount ? `${summary.context.featureCount} features` : null,
                    ].filter(Boolean).map((metric, i, arr) => (
                      <React.Fragment key={i}>
                        <Label size="small" style={{ color: colors.textSecondary }}>{metric}</Label>
                        {i < arr.length - 1 && (
                          <Label size="small" style={{ color: colors.textTertiary }}>·</Label>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              )}

              {/* Dark Take — The Headline */}
              {summary.darkTake ? (
                <View style={[styles.darkTake, { backgroundColor: colors.fillSecondary, borderColor: colors.border }]}>
                  <Flame size={16} color="#FF6B35" fill="#FF6B35" style={{ marginTop: 2 }} />
                  <Body size="medium" style={{ flex: 1, color: colors.text, fontWeight: '600' }}>
                    {summary.darkTake}
                  </Body>
                </View>
              ) : null}

              {/* Machine Notes */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Crosshair size={15} color={colors.textSecondary} />
                  <Label size="medium" style={{ color: colors.textSecondary, letterSpacing: 0.5 }}>
                    THE READ
                  </Label>
                </View>
                {(summary.machineNotes ?? []).map((note, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                    <Body size="medium" style={{ flex: 1, color: colors.text }}>
                      {note}
                    </Body>
                  </View>
                ))}
              </View>

              {/* Things Worth Noting — only shows if AI found genuine flags */}
              {(summary.flags ?? []).length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Zap size={15} color={colors.textSecondary} />
                    <Label size="medium" style={{ color: colors.textSecondary, letterSpacing: 0.5 }}>
                      WORTH NOTING
                    </Label>
                  </View>
                  {(summary.flags ?? []).map((flag, i) => {
                    const outlineColor = flag.type === 'red' ? '#F59E0B' : '#10B981';
                    return (
                      <View key={i} style={[styles.flagRow, { borderLeftColor: outlineColor }]}>
                        <Body size="medium" style={{ flex: 1, color: colors.text }}>
                          {flag.text}
                        </Body>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {/* Seller Read */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Zap size={14} color={colors.text} fill={colors.text} />
                  <Label size="medium" style={{ color: colors.textSecondary, letterSpacing: 0.5 }}>
                    {sellerName ? sellerName.toUpperCase() : 'SELLER'}
                  </Label>
                  {summary.context?.sellerRating ? (
                    <View style={[styles.ratingBadge, { borderColor: colors.border }]}>
                      <Label size="small" style={{ color: colors.text }}>
                        {summary.context.sellerRating.toFixed(1)}
                      </Label>
                      {summary.context.sellerReviewCount ? (
                        <Label size="small" style={{ color: colors.textTertiary }}>
                          ({summary.context.sellerReviewCount})
                        </Label>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                <Body size="medium" style={{ color: colors.text, paddingLeft: Spacing.xs }}>
                  {summary.sellerVibe}
                </Body>
              </View>

              {/* Good to Know */}
              {summary.negotiationTip ? (
                <View style={[styles.negotiationTip, { borderColor: colors.border, backgroundColor: colors.fillSecondary }]}>
                  <Zap size={13} color={colors.text} fill={colors.text} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Label size="small" style={{ color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 2 }}>
                      GOOD TO KNOW
                    </Label>
                    <Body size="medium" style={{ color: colors.text }}>
                      {summary.negotiationTip}
                    </Body>
                  </View>
                </View>
              ) : null}

              {/* Disclaimer */}
              <View style={[styles.disclaimer, { backgroundColor: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <View style={styles.disclaimerRow}>
                  <AlertTriangle size={13} color="#F59E0B" />
                  <Supporting size="small" style={{ color: colors.textSecondary }}>
                    AI-generated · may not be accurate · do your own check
                  </Supporting>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carHeader: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['3xl'],
  },
  errorContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['3xl'],
  },
  darkTake: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 8,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderLeftWidth: 2,
    marginBottom: Spacing.xs,
  },
  negotiationTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  disclaimer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  contextBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  contextMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});

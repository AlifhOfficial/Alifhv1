/**
 * Financing Calculator
 * 
 * EMI estimation with adjustable down payment and loan term.
 * Follows profile/settings card pattern for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Settings2 } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import type { FinancingCalculatorProps } from './types';
import { formatPrice, calculateEMI } from './utils';

const DOWN_PAYMENT_OPTIONS = [10, 20, 30];
const TERM_OPTIONS = [36, 48, 60];

export const FinancingCalculator = memo(function FinancingCalculator({
  price,
  downPaymentPercent,
  loanTermMonths,
  interestRate,
  onDownPaymentChange,
  onTermChange,
  onCustomize,
  colors,
}: FinancingCalculatorProps & { onCustomize?: () => void }) {
  const emi = useMemo(() => {
    const downPayment = price * (downPaymentPercent / 100);
    return calculateEMI(price - downPayment, interestRate, loanTermMonths);
  }, [price, downPaymentPercent, interestRate, loanTermMonths]);

  return (
    <Animated.View
      entering={FadeInDown.delay(250).duration(350)}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Financing Estimate</Text>
          {onCustomize && (
            <HapticPressable onPress={onCustomize} hitSlop={Layout.hitSlopSmall} style={styles.customizeBtn}>
              <Settings2 size={Sizes.iconXs} color={colors.labelSecondary} />
              <Text variant="subhead" tone="secondary">Customize</Text>
            </HapticPressable>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Monthly EMI */}
        <View style={styles.emiBlock}>
          <Text variant="title2Emphasized">{formatPrice(emi)}<Text variant="body" tone="secondary">/mo</Text></Text>
          <Text variant="subhead" tone="muted">
            {downPaymentPercent}% down · {loanTermMonths}mo · {interestRate}% APR
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Down Payment */}
        <View style={styles.row}>
          <Text variant="subhead" tone="secondary" style={styles.rowLabel}>Down payment</Text>
          <View style={styles.chips}>
            {DOWN_PAYMENT_OPTIONS.map((dp) => {
              const isSelected = downPaymentPercent === dp;
              return (
                <HapticPressable
                  key={dp}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => onDownPaymentChange(dp)}
                >
                  <Text
                    variant="footnoteEmphasized"
                    style={{ color: isSelected ? colors.primaryForeground : colors.labelSecondary }}
                  >
                    {dp}%
                  </Text>
                </HapticPressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Loan Term */}
        <View style={styles.row}>
          <Text variant="subhead" tone="secondary" style={styles.rowLabel}>Loan term</Text>
          <View style={styles.chips}>
            {TERM_OPTIONS.map((term) => {
              const isSelected = loanTermMonths === term;
              return (
                <HapticPressable
                  key={term}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => onTermChange(term)}
                >
                  <Text
                    variant="footnoteEmphasized"
                    style={{ color: isSelected ? colors.primaryForeground : colors.labelSecondary }}
                  >
                    {term}mo
                  </Text>
                </HapticPressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Disclaimer */}
        <View style={styles.disclaimerBlock}>
          <Text variant="caption1" tone="muted">
            Estimate only. Actual rates may vary based on bank and credit profile.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {},
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emiBlock: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  rowLabel: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  disclaimerBlock: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});

/**
 * Financing Calculator
 * 
 * EMI estimation with adjustable down payment and loan term.
 * Follows listings component patterns for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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

  const loanAmount = useMemo(() => {
    return price * (1 - downPaymentPercent / 100);
  }, [price, downPaymentPercent]);

  return (
    <View style={localStyles.section}>
      <View style={localStyles.headerRow}>
        <Text variant="footnoteEmphasized" tone="muted" uppercase>FINANCING ESTIMATE</Text>
        {onCustomize && (
          <HapticPressable onPress={onCustomize} hitSlop={Layout.hitSlopSmall} style={localStyles.customizeBtn}>
            <Settings2 size={Sizes.iconXs} color={colors.labelSecondary} />
            <Text variant="subhead" tone="secondary">Customize</Text>
          </HapticPressable>
        )}
      </View>
      
      {/* Monthly Payment */}
      <View style={localStyles.emiRow}>
        <Text variant="title2Emphasized">{formatPrice(emi)}/mo</Text>
        <Text variant="subhead" tone="secondary">
          {downPaymentPercent}% down · {loanTermMonths}mo · {interestRate}% APR
        </Text>
      </View>
      
      {/* Down Payment Options */}
      <View style={localStyles.row}>
        <Text variant="subhead" style={localStyles.label} tone="secondary">Down</Text>
        <View style={localStyles.options}>
          {DOWN_PAYMENT_OPTIONS.map((dp) => {
            const isSelected = downPaymentPercent === dp;
            return (
              <HapticPressable
                key={dp}
                style={[
                  localStyles.chip,
                  { 
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => onDownPaymentChange(dp)}
              >
                <Text 
                  variant="subhead" 
                  style={{ color: isSelected ? colors.primaryForeground : colors.labelSecondary }}
                >
                  {dp}%
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>
      
      {/* Loan Term Options */}
      <View style={localStyles.row}>
        <Text variant="subhead" style={localStyles.label} tone="secondary">Term</Text>
        <View style={localStyles.options}>
          {TERM_OPTIONS.map((term) => {
            const isSelected = loanTermMonths === term;
            return (
              <HapticPressable
                key={term}
                style={[
                  localStyles.chip,
                  { 
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => onTermChange(term)}
              >
                <Text 
                  variant="subhead" 
                  style={{ color: isSelected ? colors.primaryForeground : colors.labelSecondary }}
                >
                  {term}mo
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Disclaimer */}
      <Text variant="subhead" tone="muted" style={localStyles.disclaimer}>
        Estimate only. Actual rates may vary based on bank and credit profile.
      </Text>
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emiRow: {
    gap: Spacing.xs / 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    width: Spacing['5xl'] + Spacing.xs, // 52
  },
  options: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  disclaimer: {
    marginTop: Spacing.xs,
  },
});

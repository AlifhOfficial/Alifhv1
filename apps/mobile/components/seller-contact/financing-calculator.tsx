/**
 * Financing Calculator
 * 
 * EMI estimation with adjustable down payment and loan term.
 * Follows listings component patterns for consistency.
 */

import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { Spacing, Radius } from '@/constants/theme';
import { Label, Data, Supporting } from '@/components/ui';
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
  colors,
}: FinancingCalculatorProps) {
  const emi = useMemo(() => {
    const downPayment = price * (downPaymentPercent / 100);
    return calculateEMI(price - downPayment, interestRate, loanTermMonths);
  }, [price, downPaymentPercent, interestRate, loanTermMonths]);

  const loanAmount = useMemo(() => {
    return price * (1 - downPaymentPercent / 100);
  }, [price, downPaymentPercent]);

  return (
    <View style={localStyles.section}>
      <Label size="medium" tone="muted">FINANCING ESTIMATE</Label>
      
      {/* Monthly Payment Display */}
      <View style={localStyles.emiDisplay}>
        <Supporting size="small">Est. Monthly</Supporting>
        <Data size="large">{formatPrice(emi)}/mo</Data>
      </View>
      
      {/* Down Payment Options */}
      <View style={localStyles.row}>
        <Supporting size="small" style={localStyles.label}>Down</Supporting>
        <View style={localStyles.options}>
          {DOWN_PAYMENT_OPTIONS.map((dp) => {
            const isSelected = downPaymentPercent === dp;
            return (
              <Pressable
                key={dp}
                style={[
                  localStyles.chip,
                  { 
                    borderColor: isSelected ? colors.text : colors.border,
                    backgroundColor: isSelected ? colors.text : 'transparent',
                  },
                ]}
                onPress={() => onDownPaymentChange(dp)}
              >
                <Data 
                  size="small" 
                  style={{ color: isSelected ? colors.background : colors.textSecondary }}
                >
                  {dp}%
                </Data>
              </Pressable>
            );
          })}
        </View>
      </View>
      
      {/* Loan Term Options */}
      <View style={localStyles.row}>
        <Supporting size="small" style={localStyles.label}>Term</Supporting>
        <View style={localStyles.options}>
          {TERM_OPTIONS.map((term) => {
            const isSelected = loanTermMonths === term;
            return (
              <Pressable
                key={term}
                style={[
                  localStyles.chip,
                  { 
                    borderColor: isSelected ? colors.text : colors.border,
                    backgroundColor: isSelected ? colors.text : 'transparent',
                  },
                ]}
                onPress={() => onTermChange(term)}
              >
                <Data 
                  size="small" 
                  style={{ color: isSelected ? colors.background : colors.textSecondary }}
                >
                  {term}mo
                </Data>
              </Pressable>
            );
          })}
        </View>
      </View>
      
      <Supporting size="mini" tone="muted">
        @ {interestRate}% APR · {formatPrice(loanAmount)} financed
      </Supporting>
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  emiDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    width: 44,
  },
  options: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});

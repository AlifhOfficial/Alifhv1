/**
 * Financing Calculator
 * 
 * EMI estimation with adjustable down payment and loan term.
 */

import React, { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';

import type { FinancingCalculatorProps } from './types';
import { formatPrice, calculateEMI } from './utils';
import { styles } from './styles';

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
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FINANCING ESTIMATE</Text>
      
      {/* Compact Monthly Display */}
      <View style={styles.emiCompact}>
        <Text style={[styles.emiCompactLabel, { color: colors.textSecondary }]}>Est. Monthly</Text>
        <Text style={[styles.emiCompactValue, { color: colors.text }]}>{formatPrice(emi)}/mo</Text>
      </View>
      
      {/* Down Payment Options */}
      <View style={styles.calcRow}>
        <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Down</Text>
        <View style={styles.calcOptions}>
          {DOWN_PAYMENT_OPTIONS.map((dp) => (
            <Pressable
              key={dp}
              style={[
                styles.calcChip,
                { borderColor: downPaymentPercent === dp ? colors.text : colors.border },
                downPaymentPercent === dp && { backgroundColor: colors.text },
              ]}
              onPress={() => onDownPaymentChange(dp)}
            >
              <Text style={[
                styles.calcChipText, 
                { color: downPaymentPercent === dp ? colors.background : colors.textSecondary }
              ]}>
                {dp}%
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      {/* Loan Term Options */}
      <View style={styles.calcRow}>
        <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Term</Text>
        <View style={styles.calcOptions}>
          {TERM_OPTIONS.map((term) => (
            <Pressable
              key={term}
              style={[
                styles.calcChip,
                { borderColor: loanTermMonths === term ? colors.text : colors.border },
                loanTermMonths === term && { backgroundColor: colors.text },
              ]}
              onPress={() => onTermChange(term)}
            >
              <Text style={[
                styles.calcChipText, 
                { color: loanTermMonths === term ? colors.background : colors.textSecondary }
              ]}>
                {term}mo
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <Text style={[styles.calcDisclaimer, { color: colors.textTertiary }]}>
        @ {interestRate}% APR · {formatPrice(loanAmount)} financed
      </Text>
    </View>
  );
});

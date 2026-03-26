/**
 * EMI Calculator - Simple monthly payment estimator
 * Shows estimated EMI with default financing assumptions
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calculator } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton, Data, Supporting, Label } from '@/components/ui';

// ============================================================================
// TYPES
// ============================================================================

interface EMICalculatorProps {
  /** Vehicle price in AED */
  price: number;
  /** For BLK listings styling */
  isBlk?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DOWN_PAYMENT_PERCENT = 20;
const INTEREST_RATE = 3.5; // APR
const LOAN_TENURE = 48; // months

// ============================================================================
// EMI CALCULATION
// ============================================================================

function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) return principal / tenureMonths;

  const monthlyRate = annualRate / 100 / 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EMICalculator = memo(function EMICalculator({
  price,
  isBlk = false,
}: EMICalculatorProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkText2 : colors.text2;
  const borderColor = isBlk ? colors.blkBorder : colors.glassBorder;
  const surfaceColor = isBlk ? colors.blkBg : colors.glassBg;

  const emi = useMemo(() => {
    const downPayment = Math.round(price * (DOWN_PAYMENT_PERCENT / 100));
    const loanAmount = price - downPayment;
    return calculateEMI(loanAmount, INTEREST_RATE, LOAN_TENURE);
  }, [price]);

  const formatCurrency = (amount: number) => `AED ${amount.toLocaleString('en-AE')}`;

  return (
    <View style={styles.container}>
      <Label size="small" tone="muted">ESTIMATED EMI</Label>

      <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
        <Calculator size={Sizes.iconMd} color={colors.primary} />
        <View style={styles.content}>
          <Data size="large" style={{ color: textColor }}>
            {formatCurrency(emi)}/mo
          </Data>
          <Supporting size="small" style={{ color: secondaryTextColor }}>
            {DOWN_PAYMENT_PERCENT}% down • {LOAN_TENURE} months • {INTEREST_RATE}% APR
          </Supporting>
        </View>
      </View>
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function EMICalculatorSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Skeleton width="25%" height={Spacing.md} />
      <View style={[styles.card, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
        <Skeleton width={Sizes.iconMd} height={Sizes.iconMd} borderRadius={Radius.full} />
        <View style={{ gap: Spacing.sm, flex: 1 }}>
          <Skeleton width="40%" height={Spacing.lg} />
          <Skeleton width="55%" height={Spacing.md} />
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
});

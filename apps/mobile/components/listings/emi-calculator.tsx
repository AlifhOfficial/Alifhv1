/**
 * EMI Calculator - Monthly payment estimator
 * 
 * Simple loan calculator for car financing estimates.
 * Displays monthly EMI with adjustable parameters using stepper controls.
 */

import React, { memo, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calculator, ChevronDown, X, Info, Plus, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui/skeleton';

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

const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_INTEREST_RATE = 3.5;
const DEFAULT_LOAN_TENURE = 48; // months

const MIN_DOWN_PAYMENT_PERCENT = 0;
const MAX_DOWN_PAYMENT_PERCENT = 50;
const DOWN_PAYMENT_STEP = 5;

const MIN_INTEREST_RATE = 1;
const MAX_INTEREST_RATE = 10;
const INTEREST_STEP = 0.5;

const TENURE_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

// ============================================================================
// EMI CALCULATION
// ============================================================================

function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) return principal / tenureMonths;

  const monthlyRate = annualRate / 100 / 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  return Math.round(emi);
}

// ============================================================================
// STEPPER CONTROL
// ============================================================================

interface StepperProps {
  label: string;
  value: number;
  displayValue: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement: boolean;
  canIncrement: boolean;
}

function Stepper({ 
  label, 
  value, 
  displayValue, 
  onDecrement, 
  onIncrement, 
  canDecrement, 
  canIncrement 
}: StepperProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleDecrement = () => {
    if (canDecrement) {
      Haptics.selectionAsync();
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      Haptics.selectionAsync();
      onIncrement();
    }
  };

  return (
    <View style={stepperStyles.container}>
      <Text style={[stepperStyles.label, { color: colors.text }]}>{label}</Text>
      <View style={stepperStyles.controls}>
        <Pressable
          onPress={handleDecrement}
          disabled={!canDecrement}
          style={({ pressed }) => [
            stepperStyles.button,
            { 
              backgroundColor: colors.surfaceSecondary,
              opacity: !canDecrement ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Minus size={18} color={colors.text} />
        </Pressable>
        <View style={stepperStyles.valueContainer}>
          <Text style={[stepperStyles.value, { color: colors.primary }]}>
            {displayValue}
          </Text>
        </View>
        <Pressable
          onPress={handleIncrement}
          disabled={!canIncrement}
          style={({ pressed }) => [
            stepperStyles.button,
            { 
              backgroundColor: colors.surfaceSecondary,
              opacity: !canIncrement ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Plus size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});

// ============================================================================
// TENURE SELECTOR
// ============================================================================

interface TenureSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

function TenureSelector({ value, onChange }: TenureSelectorProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleSelect = (months: number) => {
    Haptics.selectionAsync();
    onChange(months);
  };

  return (
    <View style={tenureStyles.container}>
      <Text style={[tenureStyles.label, { color: colors.text }]}>Loan Tenure</Text>
      <View style={tenureStyles.options}>
        {TENURE_OPTIONS.map((months) => {
          const isSelected = value === months;
          return (
            <Pressable
              key={months}
              onPress={() => handleSelect(months)}
              style={({ pressed }) => [
                tenureStyles.option,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tenureStyles.optionText,
                  {
                    color: isSelected ? colors.primaryForeground : colors.text,
                  },
                ]}
              >
                {months}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[tenureStyles.hint, { color: colors.textTertiary }]}>months</Text>
    </View>
  );
}

const tenureStyles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  hint: {
    ...Typography.supportingSmall,
    fontSize: 12,
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EMICalculator = memo(function EMICalculator({
  price,
  isBlk = false,
}: EMICalculatorProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_DOWN_PAYMENT_PERCENT);
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE);
  const [tenure, setTenure] = useState(DEFAULT_LOAN_TENURE);

  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;
  const borderColor = isBlk ? colors.blkBorder : colors.border;
  const surfaceColor = isBlk ? colors.blkBackground : colors.surface;

  // Calculate EMI
  const { emi, downPayment, loanAmount, totalPayment, totalInterest } = useMemo(() => {
    const dp = Math.round(price * (downPaymentPercent / 100));
    const loan = price - dp;
    const monthlyEmi = calculateEMI(loan, interestRate, tenure);
    const total = monthlyEmi * tenure;
    const interest = total - loan;

    return {
      emi: monthlyEmi,
      downPayment: dp,
      loanAmount: loan,
      totalPayment: total,
      totalInterest: interest,
    };
  }, [price, downPaymentPercent, interestRate, tenure]);

  const openModal = useCallback(() => {
    Haptics.selectionAsync();
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString('en-AE')}`;
  };

  // Stepper handlers
  const decrementDownPayment = () => {
    setDownPaymentPercent(v => Math.max(MIN_DOWN_PAYMENT_PERCENT, v - DOWN_PAYMENT_STEP));
  };
  const incrementDownPayment = () => {
    setDownPaymentPercent(v => Math.min(MAX_DOWN_PAYMENT_PERCENT, v + DOWN_PAYMENT_STEP));
  };
  const decrementInterest = () => {
    setInterestRate(v => Math.max(MIN_INTEREST_RATE, v - INTEREST_STEP));
  };
  const incrementInterest = () => {
    setInterestRate(v => Math.min(MAX_INTEREST_RATE, v + INTEREST_STEP));
  };

  return (
    <View style={styles.container}>
      {/* Section Label */}
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        EMI CALCULATOR
      </Text>

      {/* Summary Card */}
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [
          styles.summaryCard,
          { 
            backgroundColor: surfaceColor, 
            borderColor,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={styles.summaryContent}>
          <View style={styles.emiDisplay}>
            <Calculator size={20} color={colors.primary} />
            <View>
              <Text style={[styles.emiAmount, { color: textColor }]}>
                {formatCurrency(emi)}/mo
              </Text>
              <Text style={[styles.emiDetails, { color: secondaryTextColor }]}>
                {downPaymentPercent}% down • {tenure} months • {interestRate}% APR
              </Text>
            </View>
          </View>
          <ChevronDown size={20} color={secondaryTextColor} />
        </View>
      </Pressable>

      {/* Full Calculator Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              EMI Calculator
            </Text>
            <Pressable
              onPress={closeModal}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {({ pressed }) => (
                <X size={22} color={colors.text} strokeWidth={2} style={{ opacity: pressed ? 0.7 : 1 }} />
              )}
            </Pressable>
          </View>

          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
            showsVerticalScrollIndicator={false}
          >
            {/* Vehicle Price */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
                VEHICLE PRICE
              </Text>
              <Text style={[styles.priceDisplay, { color: colors.text }]}>
                {formatCurrency(price)}
              </Text>
            </View>

            {/* EMI Result */}
            <View style={[styles.emiResultCard, { backgroundColor: colors.primary }]}>
              <Text style={[styles.emiResultLabel, { color: colors.primaryForeground }]}>
                Estimated Monthly EMI
              </Text>
              <Text style={[styles.emiResultAmount, { color: colors.primaryForeground }]}>
                {formatCurrency(emi)}
              </Text>
            </View>

            {/* Down Payment Stepper */}
            <View style={[styles.controlSection, { borderColor }]}>
              <Stepper
                label="Down Payment"
                value={downPaymentPercent}
                displayValue={`${downPaymentPercent}%`}
                onDecrement={decrementDownPayment}
                onIncrement={incrementDownPayment}
                canDecrement={downPaymentPercent > MIN_DOWN_PAYMENT_PERCENT}
                canIncrement={downPaymentPercent < MAX_DOWN_PAYMENT_PERCENT}
              />
              <Text style={[styles.controlHint, { color: colors.textTertiary }]}>
                {formatCurrency(downPayment)}
              </Text>
            </View>

            {/* Interest Rate Stepper */}
            <View style={[styles.controlSection, { borderColor }]}>
              <Stepper
                label="Interest Rate (APR)"
                value={interestRate}
                displayValue={`${interestRate.toFixed(1)}%`}
                onDecrement={decrementInterest}
                onIncrement={incrementInterest}
                canDecrement={interestRate > MIN_INTEREST_RATE}
                canIncrement={interestRate < MAX_INTEREST_RATE}
              />
            </View>

            {/* Tenure Selector */}
            <View style={[styles.controlSection, { borderColor }]}>
              <TenureSelector value={tenure} onChange={setTenure} />
            </View>

            {/* Breakdown */}
            <View style={[styles.breakdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                Loan Breakdown
              </Text>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                  Loan Amount
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.text }]}>
                  {formatCurrency(loanAmount)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                  Total Interest
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.text }]}>
                  {formatCurrency(totalInterest)}
                </Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotal, { borderTopColor: colors.border }]}>
                <Text style={[styles.breakdownLabel, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                  Total Payment
                </Text>
                <Text style={[styles.breakdownValue, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>
                  {formatCurrency(totalPayment)}
                </Text>
              </View>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Info size={14} color={colors.textTertiary} />
              <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>
                This is an estimate only. Actual EMI may vary based on bank rates, 
                processing fees, and other charges. Contact a bank for accurate quotes.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
      <Skeleton width={100} height={12} />
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryContent}>
          <View style={styles.emiDisplay}>
            <Skeleton width={20} height={20} borderRadius={10} />
            <View style={{ gap: 6 }}>
              <Skeleton width={140} height={18} />
              <Skeleton width={180} height={14} />
            </View>
          </View>
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
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  summaryCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emiDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emiAmount: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  emiDetails: {
    ...Typography.supportingSmall,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    gap: 4,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  priceDisplay: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  emiResultCard: {
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emiResultLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  emiResultAmount: {
    ...Typography.displayNumber,
  },
  controlSection: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  controlHint: {
    ...Typography.supportingSmall,
    textAlign: 'right',
    marginTop: -Spacing.sm,
  },
  breakdownCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  breakdownTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginBottom: Spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    ...Typography.link,
    fontFamily: 'Inter_500Medium',
  },
  breakdownValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  breakdownTotal: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
});

/**
 * FinancingSheet - Bottom Sheet for custom financing inputs
 * Allows users to input custom down payment percentage and loan term
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, Sizes, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { formatPrice, calculateEMI } from '@/components/seller-contact/utils';

interface FinancingSheetProps {
  visible: boolean;
  onClose: () => void;
  initialDownPayment: number;
  initialTerm: number;
  price: number;
  interestRate: number;
  onApply: (downPayment: number, term: number) => void;
}

export function FinancingSheet({
  visible,
  onClose,
  initialDownPayment,
  initialTerm,
  price,
  interestRate,
  onApply,
}: FinancingSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [downPayment, setDownPayment] = useState(String(initialDownPayment));
  const [term, setTerm] = useState(String(initialTerm));

  // Calculate EMI based on current inputs
  const { emi, loanAmount, downPaymentAmount } = useMemo(() => {
    const dp = Math.min(90, Math.max(0, parseInt(downPayment) || 0));
    const t = Math.min(84, Math.max(12, parseInt(term) || 48));
    const downPaymentAmt = price * (dp / 100);
    const loan = price - downPaymentAmt;
    const calculatedEmi = calculateEMI(loan, interestRate, t);
    return {
      emi: calculatedEmi,
      loanAmount: loan,
      downPaymentAmount: downPaymentAmt,
    };
  }, [downPayment, term, price, interestRate]);

  const snapPoints = useMemo(() => ['70%', '93%'], []);

  useEffect(() => {
    if (visible) {
      setDownPayment(String(initialDownPayment));
      setTerm(String(initialTerm));
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, initialDownPayment, initialTerm]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Auto-apply values when sheet closes
      const dp = Math.min(90, Math.max(0, parseInt(downPayment) || 0));
      const t = Math.min(84, Math.max(12, parseInt(term) || 48));
      onApply(dp, t);
      onClose();
    }
  }, [onClose, onApply, downPayment, term]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: colors.border }]}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading">Custom Financing</Text>
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={[styles.closeButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="close" size={Sizes.iconSm} color={colors.primaryForeground} />
          </HapticPressable>
        </View>

        {/* Live Output */}
        <View style={[styles.outputContainer, { backgroundColor: colors.fill2 }]}>
          <Text variant="label" tone="muted" uppercase>ESTIMATED MONTHLY PAYMENT</Text>
          <Text variant="title" style={{ marginTop: Spacing.xs }}>{formatPrice(emi)}/mo</Text>
          <View style={[styles.outputDetails, { borderTopColor: colors.border }]}>
            <View style={styles.outputItem}>
              <Text variant="bodySm" tone="muted">Down Payment</Text>
              <Text variant="bodySm">{formatPrice(downPaymentAmount)}</Text>
            </View>
            <View style={styles.outputItem}>
              <Text variant="bodySm" tone="muted">Loan Amount</Text>
              <Text variant="bodySm">{formatPrice(loanAmount)}</Text>
            </View>
            <View style={styles.outputItem}>
              <Text variant="bodySm" tone="muted">Interest Rate</Text>
              <Text variant="bodySm">{interestRate}% APR</Text>
            </View>
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.inputsContainer}>
          {/* Down Payment */}
          <View style={styles.inputRow}>
            <Text variant="body" style={styles.inputLabel} tone="secondary">Down Payment</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.fill2, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.label }]}
                value={downPayment}
                onChangeText={setDownPayment}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="20"
                placeholderTextColor={colors.labelQuaternary}
              />
              <Text variant="body" tone="secondary">%</Text>
            </View>
          </View>

          {/* Loan Term */}
          <View style={styles.inputRow}>
            <Text variant="body" style={styles.inputLabel} tone="secondary">Loan Term</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.fill2, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.label }]}
                value={term}
                onChangeText={setTerm}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="48"
                placeholderTextColor={colors.labelQuaternary}
              />
              <Text variant="body" tone="secondary">months</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.fill2 }]}>
          <Ionicons name="information-circle-outline" size={Sizes.iconSm} color={colors.labelSecondary} />
          <Text variant="bodySm" style={styles.disclaimerText} tone="secondary">
            This is an estimate only. Actual rates and terms may vary based on your bank, credit profile, and other factors.
          </Text>
        </View>

        <View style={{ height: insets.bottom + Spacing.md }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.md,
  },
  background: {
    borderRadius: Radius['3xl'],
  },
  handleIndicator: {
    width: Sizes.bubble,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  closeButton: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputRow: {
    gap: Spacing.sm,
  },
  inputLabel: {
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.subheading,
    padding: 0,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 18,
  },
  outputContainer: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  outputDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  outputItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
});

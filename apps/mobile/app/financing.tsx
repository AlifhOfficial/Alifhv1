import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text, TextInput } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, SheetChrome, Spacing, Typography } from '@/constants/theme';
import { calculateEMI, formatPrice } from '@/components/seller-contact/utils';
import { emitFinancingApplied } from '@/lib/financing-events';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

export default function FinancingScreen() {
  const params = useLocalSearchParams<{
    initialDownPayment?: string;
    initialTerm?: string;
    price?: string;
    interestRate?: string;
  }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const initialDownPayment = Number(params.initialDownPayment ?? 20);
  const initialTerm = Number(params.initialTerm ?? 48);
  const price = Number(params.price ?? 0);
  const interestRate = Number(params.interestRate ?? 3.5);

  const [downPayment, setDownPayment] = useState(String(initialDownPayment));
  const [term, setTerm] = useState(String(initialTerm));

  const { emi, loanAmount, downPaymentAmount } = useMemo(() => {
    const dp = Math.min(90, Math.max(0, parseInt(downPayment, 10) || 0));
    const t = Math.min(84, Math.max(12, parseInt(term, 10) || 48));
    const downPaymentAmt = price * (dp / 100);
    const loan = price - downPaymentAmt;
    const calculatedEmi = calculateEMI(loan, interestRate, t);
    return {
      emi: calculatedEmi,
      loanAmount: loan,
      downPaymentAmount: downPaymentAmt,
    };
  }, [downPayment, term, price, interestRate]);

  const clampedDownPayment = Math.min(90, Math.max(0, parseInt(downPayment, 10) || 0));
  const clampedTerm = Math.min(84, Math.max(12, parseInt(term, 10) || 48));

  useEffect(() => {
    // Keep parent state in sync without requiring an explicit apply action.
    emitFinancingApplied({ downPayment: clampedDownPayment, term: clampedTerm });
  }, [clampedDownPayment, clampedTerm]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.sheet, paddingBottom: getSheetBottomPadding(insets.bottom, -Spacing.md) },
      ]}
    > 
      <SheetHeader
        title="Custom Financing"
        right={
          <HapticPressable
            onPress={() => router.back()}
            hitSlop={Spacing.sm}
            style={[styles.headerActionButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={16} color={colors.primaryForeground} />
          </HapticPressable>
        }
      />

      <View style={styles.outputContainer}> 
        <Text variant="footnote" tone="muted">Estimated monthly payment</Text>
        <Text variant="largeTitleEmphasized" style={{ marginTop: Spacing.xs }}>{formatPrice(emi)}/mo</Text>
        <View style={[styles.outputDetails, { borderTopColor: colors.border }]}> 
          <View style={styles.outputItem}>
            <Text variant="subhead" tone="muted">Down Payment</Text>
            <Text variant="subhead">{formatPrice(downPaymentAmount)}</Text>
          </View>
          <View style={styles.outputItem}>
            <Text variant="subhead" tone="muted">Loan Amount</Text>
            <Text variant="subhead">{formatPrice(loanAmount)}</Text>
          </View>
          <View style={styles.outputItem}>
            <Text variant="subhead" tone="muted">Interest Rate</Text>
            <Text variant="subhead">{interestRate}% APR</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          <Text variant="subhead" style={styles.inputLabel} tone="muted">Down Payment</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.fill2 }]}> 
            <TextInput
              style={[styles.input, { color: colors.label }]}
              value={downPayment}
              onChangeText={setDownPayment}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="20"
              placeholderTextColor={colors.placeholder}
            />
            <Text variant="body" tone="muted">%</Text>
          </View>
        </View>

        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

        <View style={styles.inputRow}>
          <Text variant="subhead" style={styles.inputLabel} tone="muted">Loan Term</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.fill2 }]}> 
            <TextInput
              style={[styles.input, { color: colors.label }]}
              value={term}
              onChangeText={setTerm}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="48"
              placeholderTextColor={colors.placeholder}
            />
            <Text variant="body" tone="muted">months</Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimer}> 
        <Ionicons name="information-circle-outline" size={18} color={colors.labelSecondary} />
        <Text variant="footnote" style={styles.disclaimerText} tone="secondary">
          This is an estimate only. Actual rates and terms may vary by bank, credit profile, and other factors.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SheetChrome.contentPaddingTop,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  outputContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerActionButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outputDetails: {
    flexDirection: 'column',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  outputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  inputLabel: {
    width: 108,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.headline,
    padding: Spacing.none,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: Typography.subhead.lineHeight,
  },
});

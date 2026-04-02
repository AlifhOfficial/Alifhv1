import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { useTheme } from '@/context/theme-context';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { calculateEMI, formatPrice } from '@/components/seller-contact/utils';
import { emitFinancingApplied } from '@/lib/financing-events';

export default function FinancingScreen() {
  const params = useLocalSearchParams<{
    initialDownPayment?: string;
    initialTerm?: string;
    price?: string;
    interestRate?: string;
  }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

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

  const handleApply = () => {
    const dp = Math.min(90, Math.max(0, parseInt(downPayment, 10) || 0));
    const t = Math.min(84, Math.max(12, parseInt(term, 10) || 48));
    emitFinancingApplied({ downPayment: dp, term: t });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Custom Financing" />

      <View style={{ alignItems: 'flex-end', marginBottom: Spacing.md }}>
        <HapticPressable
          onPress={handleApply}
          hitSlop={Spacing.md}
          style={{
            backgroundColor: colors.primary,
            borderRadius: Radius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
          }}
        >
          <Text variant="subheadEmphasized" style={{ color: colors.primaryForeground }}>Apply</Text>
        </HapticPressable>
      </View>

      <View style={[styles.outputContainer, { backgroundColor: colors.fill2 }]}> 
        <Text variant="footnoteEmphasized" tone="muted" uppercase>ESTIMATED MONTHLY PAYMENT</Text>
        <Text variant="headline" style={{ marginTop: Spacing.xs }}>{formatPrice(emi)}/mo</Text>
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
          <Text variant="body" style={styles.inputLabel} tone="muted">Down Payment</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}> 
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

        <View style={styles.inputRow}>
          <Text variant="body" style={styles.inputLabel} tone="muted">Loan Term</Text>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}> 
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

      <View style={[styles.disclaimer, { backgroundColor: colors.fill2 }]}> 
        <Ionicons name="information-circle-outline" size={18} color={colors.labelSecondary} />
        <Text variant="subhead" style={styles.disclaimerText} tone="secondary">
          This is an estimate only. Actual rates and terms may vary by bank, credit profile, and other factors.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  header: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  outputContainer: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
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
    ...Typography.headline,
    padding: Spacing.none,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: Typography.subhead.lineHeight,
  },
});

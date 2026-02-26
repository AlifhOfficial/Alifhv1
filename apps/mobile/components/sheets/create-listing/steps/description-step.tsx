/**
 * DescriptionStepContent — Add listing description
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/description-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { FileText, Lightbulb } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

const MAX_DESCRIPTION = 2000;

const QUICK_TEMPLATES = [
  'Single owner, full service history.',
  'Excellent condition, well maintained.',
  'Low mileage, accident-free.',
  'Recently serviced, new tires.',
];

// ─────────────────────────────────────────────────────────────────────────────

export function DescriptionStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleChange = useCallback(
    (text: string) => {
      const trimmed = text.slice(0, MAX_DESCRIPTION);
      onUpdate({ description: trimmed });
    },
    [onUpdate]
  );

  const handleTemplate = useCallback(
    (template: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = data.description || '';
      const newDesc = current ? `${current} ${template}` : template;
      const trimmed = newDesc.slice(0, MAX_DESCRIPTION);
      onUpdate({ description: trimmed });
    },
    [data.description, onUpdate]
  );

  const description = data.description || '';
  const charCount = description.length;
  const isNearLimit = charCount > MAX_DESCRIPTION - 50;

  return (
    <StepContainer>
      {/* Quick templates */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Lightbulb size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Supporting size="small" tone="muted">
            Quick add
          </Supporting>
        </View>
        <View style={styles.chipsWrap}>
          {QUICK_TEMPLATES.map((template, index) => (
            <HapticPressable
              key={index}
              onPress={() => handleTemplate(template)}
              style={[
                styles.chip,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <Body size="small" numberOfLines={1} style={{ color: colors.text }}>
                {template}
              </Body>
            </HapticPressable>
          ))}
        </View>
      </View>

      {/* Text Input */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <FileText size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Label size="small">Description</Label>
        </View>
        <BottomSheetTextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.fillSecondary,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Describe your vehicle's condition, history, notable features..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={handleChange}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={MAX_DESCRIPTION}
        />
        <View style={styles.charCount}>
          <Supporting
            size="small"
            style={{ color: isNearLimit ? colors.warning ?? '#F59E0B' : colors.textMuted }}
          >
            {charCount}/{MAX_DESCRIPTION}
          </Supporting>
        </View>
      </View>

      {/* Tips */}
      <View style={[styles.tipsBox, { backgroundColor: colors.fillSecondary }]}>
        <Supporting size="small" tone="muted" style={{ flex: 1 }}>
          Good descriptions include: service history, upgrades, reason for selling,
          and any issues the buyer should know about.
        </Supporting>
      </View>
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  charCount: {
    alignItems: 'flex-end',
  },
  tipsBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
});

export default DescriptionStepContent;

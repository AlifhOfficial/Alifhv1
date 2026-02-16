/**
 * DescriptionSheet — Add listing description
 *
 * Multi-line text input with character counter.
 * Fully optional, skippable.
 *
 * @module components/sheets/create-listing/sheets/description-sheet
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';

import { CreateFlowSheet, CreateFlowScrollContent } from '../create-flow-sheet';
import type { SheetStepProps } from '../types';
import { getProgress, SHEET_STEPS } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const MAX_DESCRIPTION = 700;

const QUICK_TEMPLATES = [
  'Single owner, full service history.',
  'Excellent condition, well maintained.',
  'Low mileage, accident-free.',
  'Recently serviced, new tires.',
];

// ─────────────────────────────────────────────────────────────────────────────

export function DescriptionSheet({
  visible,
  data,
  onUpdate,
  onNext,
  onSkip,
  onBack,
  onClose,
}: SheetStepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [localDescription, setLocalDescription] = useState(data.description || '');

  // Reset when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalDescription(data.description || '');
    }
  }, [visible]);

  const handleChange = useCallback(
    (text: string) => {
      const trimmed = text.slice(0, MAX_DESCRIPTION);
      setLocalDescription(trimmed);
      onUpdate({ description: trimmed });
    },
    [onUpdate]
  );

  const handleTemplate = useCallback(
    (template: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newDesc = localDescription
        ? `${localDescription} ${template}`
        : template;
      const trimmed = newDesc.slice(0, MAX_DESCRIPTION);
      setLocalDescription(trimmed);
      onUpdate({ description: trimmed });
    },
    [localDescription, onUpdate]
  );

  const stepIndex = SHEET_STEPS.findIndex((s) => s.id === 'description');
  const progress = getProgress(stepIndex + 1);

  const hasDescription = localDescription.trim().length > 0;
  const charCount = localDescription.length;
  const isNearLimit = charCount > MAX_DESCRIPTION - 50;

  return (
    <CreateFlowSheet
      visible={visible}
      onClose={onClose}
      title="Description"
      showBack
      onBack={onBack}
      canSkip
      onSkip={onSkip}
      primaryLabel={hasDescription ? 'Next' : 'Skip'}
      onPrimary={hasDescription ? onNext : onSkip}
      progress={progress}
    >
      <CreateFlowScrollContent>
        {/* Quick templates */}
        <View style={styles.section}>
          <Supporting size="small" tone="muted">
            Quick add
          </Supporting>
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
          <Label size="small">Description</Label>
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
            value={localDescription}
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
      </CreateFlowScrollContent>
    </CreateFlowSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
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
    marginTop: Spacing.md,
  },
});

export default DescriptionSheet;

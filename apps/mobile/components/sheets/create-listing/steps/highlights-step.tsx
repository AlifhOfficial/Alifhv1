/**
 * HighlightsStepContent — Listing highlight tags
 *
 * Content-only component for the unified flow.
 * Allows selection of up to 3 highlight tags for the listing.
 *
 * @module components/sheets/create-listing/steps/highlights-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { LISTING_TAGS } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

const MAX_TAGS = 3;

// ─────────────────────────────────────────────────────────────────────────────

export function HighlightsStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const toggleTag = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = data.tags || [];
      if (current.includes(value)) {
        onUpdate({ tags: current.filter((v) => v !== value) });
      } else if (current.length < MAX_TAGS) {
        onUpdate({ tags: [...current, value] });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    },
    [data.tags, onUpdate]
  );

  const tags = data.tags || [];

  return (
    <StepContainer>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">Highlight Tags</Text>
          <Text variant={SheetTypography.supporting} tone="muted">
            Select up to {MAX_TAGS}
          </Text>
        </View>
        <Text variant={SheetTypography.supporting} tone="secondary" style={styles.description}>
          Help buyers find your listing with relevant highlights
        </Text>
        
        <View style={styles.chipWrap}>
          {LISTING_TAGS.map((tag) => {
            const isSelected = tags.includes(tag.value);
            const isDisabled = !isSelected && tags.length >= MAX_TAGS;
            return (
              <HapticPressable
                key={tag.value}
                onPress={() => toggleTag(tag.value)}
                disabled={isDisabled}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.label : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.label : colors.border,
                    opacity: isDisabled ? 0.5 : 1,
                  },
                ]}
              >
                <Text variant={isSelected ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel} style={{ color: isSelected ? colors.background : colors.label }}>
                  {tag.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>

        {tags.length >= MAX_TAGS && (
          <Text variant={SheetTypography.supporting} tone="muted" style={styles.hint}>
            Remove a tag to add another
          </Text>
        )}
      </View>

      {/* Summary */}
      {tags.length > 0 && (
        <View style={[styles.summaryBox, { backgroundColor: colors.fill2 }]}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">
            {tags.length} highlight{tags.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
      )}
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    marginBottom: Spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  hint: {
    marginTop: Spacing.sm,
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

export default HighlightsStepContent;

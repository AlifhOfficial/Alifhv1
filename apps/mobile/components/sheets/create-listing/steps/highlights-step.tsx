/**
 * HighlightsStepContent — Listing highlight tags
 *
 * Content-only component for the unified flow.
 * Allows selection of up to 3 highlight tags for the listing.
 *
 * @module components/sheets/create-listing/steps/highlights-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { LISTING_TAGS } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

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
          <Label size="small">Highlight Tags</Label>
          <Supporting size="small" tone="muted">
            Select up to {MAX_TAGS}
          </Supporting>
        </View>
        <Supporting size="small" tone="secondary" style={styles.description}>
          Help buyers find your listing with relevant highlights
        </Supporting>
        
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
                    backgroundColor: isSelected ? colors.text : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.text : colors.border,
                    opacity: isDisabled ? 0.5 : 1,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{ color: isSelected ? colors.background : colors.text }}
                >
                  {tag.label}
                </Body>
              </HapticPressable>
            );
          })}
        </View>

        {tags.length >= MAX_TAGS && (
          <Supporting size="small" tone="muted" style={styles.hint}>
            Remove a tag to add another
          </Supporting>
        )}
      </View>

      {/* Summary */}
      {tags.length > 0 && (
        <View style={[styles.summaryBox, { backgroundColor: colors.fillSecondary }]}>
          <Supporting size="small" tone="secondary">
            {tags.length} highlight{tags.length !== 1 ? 's' : ''} selected
          </Supporting>
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

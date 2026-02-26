/**
 * ExtrasStepContent — Vehicle features and tags
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/extras-step
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, Tag, Check } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { VEHICLE_EXTRAS, LISTING_TAGS } from '@/lib/filter-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

const MAX_TAGS = 3;

// ─────────────────────────────────────────────────────────────────────────────

export function ExtrasStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const toggleExtra = useCallback(
    (value: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = data.extras || [];
      if (current.includes(value)) {
        onUpdate({ extras: current.filter((v) => v !== value) });
      } else {
        onUpdate({ extras: [...current, value] });
      }
    },
    [data.extras, onUpdate]
  );

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

  const extras = data.extras || [];
  const tags = data.tags || [];
  const hasSelection = extras.length > 0 || tags.length > 0;

  return (
    <StepContainer>
      {/* Vehicle Extras */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Sparkles size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Label size="small">Vehicle Extras</Label>
          {extras.length > 0 && (
            <Supporting size="small" style={{ color: colors.text }}>
              {extras.length} selected
            </Supporting>
          )}
        </View>
        <View style={styles.chipWrap}>
          {VEHICLE_EXTRAS.map((extra) => {
            const isSelected = extras.includes(extra.value);
            return (
              <HapticPressable
                key={extra.value}
                onPress={() => toggleExtra(extra.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.text + '15' : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.text : colors.border,
                  },
                ]}
              >
                <Body
                  size="small"
                  style={{
                    color: isSelected ? colors.text : colors.textSecondary,
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  }}
                >
                  {extra.label}
                </Body>
                {isSelected && <Check size={12} color={colors.text} strokeWidth={2} />}
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Listing Tags */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Tag size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
          <Label size="small">Highlight Tags</Label>
          <Supporting size="small" tone="muted">Max {MAX_TAGS}</Supporting>
        </View>
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
                  styles.tagChip,
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
          <Supporting size="small" tone="muted">Remove a tag to add another</Supporting>
        )}
      </View>

      {/* Summary */}
      {hasSelection && (
        <View style={[styles.summaryBox, { backgroundColor: colors.fillSecondary }]}>
          <Supporting size="small" tone="secondary">
            {extras.length > 0 && `${extras.length} extras`}
            {extras.length > 0 && tags.length > 0 && ' • '}
            {tags.length > 0 && `${tags.length} tags`}
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
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
});

export default ExtrasStepContent;

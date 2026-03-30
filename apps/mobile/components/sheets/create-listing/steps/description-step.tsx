/**
 * DescriptionStepContent — Add listing description
 *
 * Content-only component for the unified flow.
 *
 * @module components/sheets/create-listing/steps/description-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Sparkles, RefreshCw } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { API_BASE } from '@/lib/config';
import { getSession } from '@/lib/auth-api';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

// ─────────────────────────────────────────────────────────────────────────────

const MAX_DESCRIPTION = 2000;

// ─────────────────────────────────────────────────────────────────────────────

export function DescriptionStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleChange = useCallback(
    (text: string) => {
      const trimmed = text.slice(0, MAX_DESCRIPTION);
      onUpdate({ description: trimmed });
    },
    [onUpdate]
  );

  // AI Description Generator
  const generateAIDescription = useCallback(async (isRegenerate = false) => {
    if (!data.make || !data.model || !data.year) {
      setGenerateError('Complete vehicle details first');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Get auth session for Bearer token
      const { session } = await getSession();
      if (!session?.token) {
        throw new Error('Please sign in first');
      }

      const response = await fetch(`${API_BASE}/api/ai/description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          make: data.make,
          model: data.model,
          year: data.year,
          trim: data.trim,
          mileage: data.mileage,
          specs: data.specs,
          bodyType: data.bodyType,
          fuelType: data.fuelType,
          transmission: data.transmission,
          engineSize: data.engineSize,
          cylinders: data.cylinders,
          exteriorColor: data.exteriorColor,
          interiorColor: data.interiorColor,
          price: data.price,
          isNegotiable: data.isNegotiable,
          emirate: data.emirate,
          extras: data.extras,
          previousDescription: isRegenerate ? data.description : null,
          regenerateReason: isRegenerate ? 'different_angle' : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[AI Description] Response error:', response.status, errorData);
        throw new Error(errorData.error || `Failed (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data?.description) {
        onUpdate({ description: result.data.description });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(result.error || 'No description returned');
      }
    } catch (err) {
      console.error('[AI Description] Error:', err);
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  }, [data, onUpdate]);

  const description = data.description || '';
  const charCount = description.length;
  const isNearLimit = charCount > MAX_DESCRIPTION - 50;
  const hasDescription = description.length > 0;

  return (
    <StepContainer>
      {/* Text Input */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Description</Text>
          <HapticPressable
            onPress={() => generateAIDescription(hasDescription)}
            disabled={isGenerating}
            style={styles.aiLink}
          >
            {isGenerating ? (
              <ActivityIndicator size={12} color={colors.primary} />
            ) : hasDescription ? (
              <RefreshCw size={14} color={colors.primary} strokeWidth={2} />
            ) : (
              <Sparkles size={14} color={colors.primary} strokeWidth={2} />
            )}
              <Text variant="subhead" style={{ color: colors.primary }}>
              {isGenerating ? 'Generating...' : hasDescription ? 'Regenerate' : 'AI Generate'}
            </Text>
          </HapticPressable>
        </View>
        {generateError && (
          <Text variant="subhead" style={{ color: colors.error }} tone="secondary">
            {generateError}
          </Text>
        )}
        <BottomSheetTextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.fill2,
              color: colors.label,
              borderColor: colors.border,
            },
          ]}
          placeholder="Describe your vehicle's condition, history, notable features..."
          placeholderTextColor={colors.labelQuaternary}
          value={description}
          onChangeText={handleChange}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={MAX_DESCRIPTION}
        />
        <View style={styles.charCount}>
          <Text
            variant="subhead"
            style={{ color: isNearLimit ? colors.warning : colors.labelQuaternary }}
           tone="secondary">
            {charCount}/{MAX_DESCRIPTION}
          </Text>
        </View>
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
    justifyContent: 'space-between',
  },
  aiLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  textArea: {
    minHeight: Spacing["5xl"],
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Typography.body,
    lineHeight: Typography.body.lineHeight,
    textAlignVertical: 'top',
  },
  charCount: {
    alignItems: 'flex-end',
  },
});

export default DescriptionStepContent;

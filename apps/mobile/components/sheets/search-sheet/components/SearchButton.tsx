/**
 * SearchButton - Bottom action button
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '@/constants/theme';
import { ButtonText } from '@/components/ui';
import type { ThemedComponentProps } from '../types';

interface SearchButtonProps extends ThemedComponentProps {
  onPress: () => void;
  disabled: boolean;
  query: string;
  selectedMakes: string[];
  selectedModels: string[];
  selectedTrims: string[];
}

export function SearchButton({
  onPress,
  disabled,
  query,
  selectedMakes,
  selectedModels,
  selectedTrims,
  colors,
}: SearchButtonProps) {
  const insets = useSafeAreaInsets();

  const hasSelections =
    selectedMakes.length > 0 ||
    selectedModels.length > 0 ||
    selectedTrims.length > 0;

  const getButtonText = (): string => {
    if (hasSelections) {
      const parts = [
        selectedMakes.length > 0 &&
          `${selectedMakes.length} make${selectedMakes.length > 1 ? 's' : ''}`,
        selectedModels.length > 0 &&
          `${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''}`,
        selectedTrims.length > 0 &&
          `${selectedTrims.length} trim${selectedTrims.length > 1 ? 's' : ''}`,
      ].filter(Boolean);
      return `Search ${parts.join(', ')}`;
    }
    if (query.trim()) {
      return `Search "${query.trim()}"`;
    }
    return 'Search';
  };

  const canSearch = !disabled;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + Spacing.lg,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: canSearch ? colors.primary : colors.fillSecondary,
            opacity: pressed && canSearch ? 0.9 : 1,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Ionicons
          name="search"
          size={18}
          color={canSearch ? colors.primaryForeground : colors.textTertiary}
        />
        <ButtonText
          size="medium"
          style={{
            color: canSearch ? colors.primaryForeground : colors.textTertiary,
          }}
        >
          {getButtonText()}
        </ButtonText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Radius['3xl'],
    gap: Spacing.sm,
  },
});

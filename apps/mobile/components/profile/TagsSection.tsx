/**
 * Tags Section Component
 * Selectable profile tags with limit
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable, useAlert } from '@/components/ui';
import * as Haptics from 'expo-haptics';

import { Body, Supporting } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { Section } from './Section';
import { PROFILE_TAGS } from './types';
import type { ThemeColors } from './types';

const MAX_TAGS = 3;

interface TagItemProps {
  tag: string;
  isSelected: boolean;
  colors: ThemeColors;
  onPress: () => void;
}

function TagItem({ tag, isSelected, colors, onPress }: TagItemProps) {
  return (
    <HapticPressable
      onPress={onPress}
      style={[
        styles.tag,
        {
          backgroundColor: isSelected ? colors.surfaceSecondary : colors.surface,
          borderColor: isSelected ? colors.labelSecondary : colors.border,
        },
      ]}
    >
      <Body
        size="bodySm"
        tone={isSelected ? 'default' : 'secondary'}
      >
        {tag}
      </Body>
    </HapticPressable>
  );
}

interface TagsSectionProps {
  selectedTags: string[];
  colors: ThemeColors;
  onToggle: (tag: string) => void;
}

export function TagsSection({ selectedTags, colors, onToggle }: TagsSectionProps) {
  const { showAlert } = useAlert();

  const handleTagPress = (tag: string) => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }

    if (selectedTags.includes(tag)) {
      onToggle(tag);
    } else if (selectedTags.length < MAX_TAGS) {
      onToggle(tag);
    } else {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      showAlert('Limit Reached', `You can select up to ${MAX_TAGS} tags`);
    }
  };

  return (
    <Section
      title="Tags"
      colors={colors}
      delay={275}
      rightElement={
        <Supporting size="body" tone="muted">
          {selectedTags.length}/{MAX_TAGS}
        </Supporting>
      }
    >
      <View style={styles.container}>
        {PROFILE_TAGS.map((tag) => (
          <TagItem
            key={tag}
            tag={tag}
            isSelected={selectedTags.includes(tag)}
            colors={colors}
            onPress={() => handleTagPress(tag)}
          />
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

/**
 * Tags Section Component
 * Selectable profile tags with limit
 */

import { Text, HapticPressable, useAlert } from '@/components/ui';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { CheckCircle2, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Sizes } from '@/constants/theme';
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
    <HapticPressable onPress={onPress} style={styles.row}>
      <Text
        variant="subhead"
        style={[styles.label, { color: isSelected ? colors.label : colors.labelSecondary }]}
      >
        {tag}
      </Text>
      {isSelected ? (
        <CheckCircle2 size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
      ) : (
        <Plus size={Sizes.iconSm} color={colors.labelSecondary} strokeWidth={2} />
      )}
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
    <Section colors={colors} delay={275}>
      {PROFILE_TAGS.map((tag, index) => (
        <React.Fragment key={tag}>
          {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          <TagItem
            tag={tag}
            isSelected={selectedTags.includes(tag)}
            colors={colors}
            onPress={() => handleTagPress(tag)}
          />
        </React.Fragment>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  label: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
});


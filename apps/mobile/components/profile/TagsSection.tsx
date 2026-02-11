/**
 * Tags Section Component
 * Selectable profile tags with limit
 */

import React from 'react';
import { StyleSheet, View, Pressable, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Supporting, ButtonText } from '@/components/ui';
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
    <Pressable
      onPress={onPress}
      style={[
        styles.tag,
        {
          backgroundColor: isSelected ? colors.surfaceSecondary : colors.surface,
          borderColor: isSelected ? colors.textSecondary : colors.border,
        },
      ]}
    >
      <ButtonText
        size="medium"
        tone={isSelected ? 'default' : 'secondary'}
      >
        {tag}
      </ButtonText>
    </Pressable>
  );
}

interface TagsSectionProps {
  selectedTags: string[];
  colors: ThemeColors;
  onToggle: (tag: string) => void;
}

export function TagsSection({ selectedTags, colors, onToggle }: TagsSectionProps) {
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
      Alert.alert('Limit Reached', `You can select up to ${MAX_TAGS} tags`);
    }
  };

  return (
    <Section
      title="Tags"
      colors={colors}
      delay={275}
      rightElement={
        <Supporting size="medium" tone="muted">
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
    padding: 16,
    gap: 10,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

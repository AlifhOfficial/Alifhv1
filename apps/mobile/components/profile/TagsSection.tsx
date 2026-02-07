/**
 * Tags Section Component
 * Selectable profile tags with limit
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Alert } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
import { Section } from './Section';
import { PROFILE_TAGS } from './types';
import type { ThemeColors } from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const MAX_TAGS = 3;

interface TagItemProps {
  tag: string;
  isSelected: boolean;
  colors: ThemeColors;
  onPress: () => void;
}

function TagItem({ tag, isSelected, colors, onPress }: TagItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tag,
        animatedStyle,
        {
          backgroundColor: isSelected ? `${colors.text}12` : `${colors.text}06`,
          borderColor: isSelected ? `${colors.text}30` : `${colors.border}50`,
        },
      ]}
    >
      <Text
        style={[
          styles.tagText,
          { color: isSelected ? colors.text : colors.textSecondary },
        ]}
      >
        {tag}
      </Text>
    </AnimatedPressable>
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
        <Text style={[styles.counter, { color: colors.textTertiary }]}>
          {selectedTags.length}/{MAX_TAGS}
        </Text>
      }
    >
      <View style={styles.tagsContainer}>
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
  counter: {
    fontSize: Typography.footnote.fontSize,
    lineHeight: Typography.footnote.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.footnote.letterSpacing,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  tagText: {
    fontSize: Typography.small.fontSize,
    lineHeight: Typography.small.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: Typography.small.fontWeight as any,
    letterSpacing: Typography.small.letterSpacing,
  },
});

/**
 * Bio Section Component
 * Editable bio with character counter
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Typography, Spacing, Radius, Layout } from '@/constants/theme';
import { Section } from './Section';
import type { ThemeColors, EditingField, ProfileFormData } from './types';

const MAX_BIO_LENGTH = 2000;

interface BioSectionProps {
  bio: string;
  isEditing: boolean;
  saving: boolean;
  colors: ThemeColors;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (text: string) => void;
}

export function BioSection({
  bio,
  isEditing,
  saving,
  colors,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: BioSectionProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handlePress = () => {
    if (!isEditing) {
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
      onEdit();
    }
  };

  const handleChange = (text: string) => {
    // Limit length only - allow any case
    onChange(text.slice(0, MAX_BIO_LENGTH));
  };

  const charCountColor =
    bio.length >= MAX_BIO_LENGTH ? colors.error : colors.labelTertiary;

  return (
    <Section title="Bio" colors={colors} delay={250}>
      <HapticPressable onPress={handlePress} style={styles.container}>
        {isEditing ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.editContainer}>
            <TextInput
              ref={inputRef}
              multiline
              value={bio}
              onChangeText={handleChange}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.labelTertiary}
              style={[
                styles.input,
                Typography.body,
                {
                  backgroundColor: colors.surface,
                  color: colors.label,
                  borderColor: colors.border,
                },
              ]}
              maxLength={MAX_BIO_LENGTH}
              textAlignVertical="top"
            />
            <View style={styles.footer}>
              <Text variant="subhead" style={{ color: charCountColor }}>
                {bio.length}/{MAX_BIO_LENGTH}
              </Text>
              <View style={styles.actions}>
                <HapticPressable
                  onPress={onCancel}
                  hitSlop={Layout.hitSlopSmall}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Text variant="subhead" tone="secondary">
                    Cancel
                  </Text>
                </HapticPressable>
                <HapticPressable
                  onPress={onSave}
                  disabled={saving}
                  hitSlop={Layout.hitSlopSmall}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Text variant="body" tone="primary">
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </HapticPressable>
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.displayContainer}>
            <Text
              variant="body"
              tone={bio ? 'default' : 'muted'}
              style={styles.bioText}
            >
              {bio || 'Tap to add bio'}
            </Text>
            {bio && (
              <Text variant="subhead" tone="muted">
                {bio.length}/{MAX_BIO_LENGTH}
              </Text>
            )}
          </View>
        )}
      </HapticPressable>
    </Section>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  editContainer: {
    gap: Spacing.md,
  },
  input: {
    minHeight: Layout.hitTarget * 2 + Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing['2xl'],
  },
  displayContainer: {
    gap: Spacing.md,
  },
  bioText: {
    // lineHeight handled by <Text variant="body"> component
  },
});

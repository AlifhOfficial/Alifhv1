/**
 * Bio Section Component
 * Editable bio with character counter
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Body, Supporting, Data } from '@/components/ui';
import { Typography } from '@/constants/theme';
import { Section } from './Section';
import type { ThemeColors, EditingField, ProfileFormData } from './types';

const MAX_BIO_LENGTH = 700;

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
    // Keep lowercase and limit length
    onChange(text.slice(0, MAX_BIO_LENGTH).toLowerCase());
  };

  const charCountColor =
    bio.length >= MAX_BIO_LENGTH ? colors.error : colors.textTertiary;

  return (
    <Section title="Bio" colors={colors} delay={250}>
      <Pressable onPress={handlePress} style={styles.container}>
        {isEditing ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.editContainer}>
            <TextInput
              ref={inputRef}
              multiline
              value={bio}
              onChangeText={handleChange}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                Typography.bodyMedium,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              maxLength={MAX_BIO_LENGTH}
              textAlignVertical="top"
            />
            <View style={styles.footer}>
              <Supporting size="medium" style={{ color: charCountColor }}>
                {bio.length}/{MAX_BIO_LENGTH}
              </Supporting>
              <View style={styles.actions}>
                <Pressable
                  onPress={onCancel}
                  hitSlop={8}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Supporting size="medium" tone="secondary">
                    Cancel
                  </Supporting>
                </Pressable>
                <Pressable
                  onPress={onSave}
                  disabled={saving}
                  hitSlop={8}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Data size="medium" tone="primary">
                    {saving ? 'Saving...' : 'Save'}
                  </Data>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.displayContainer}>
            <Body
              size="large"
              tone={bio ? 'default' : 'muted'}
              style={styles.bioText}
            >
              {bio || 'Tap to add bio'}
            </Body>
            {bio && (
              <Supporting size="medium" tone="muted">
                {bio.length}/{MAX_BIO_LENGTH}
              </Supporting>
            )}
          </View>
        )}
      </Pressable>
    </Section>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  editContainer: {
    gap: 14,
  },
  input: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
  },
  displayContainer: {
    gap: 10,
  },
  bioText: {
    // lineHeight handled by <Body size="large"> component
  },
});

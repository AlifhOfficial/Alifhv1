/**
 * Bio Section Component
 * Editable bio with character counter
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              maxLength={MAX_BIO_LENGTH}
              textAlignVertical="top"
            />
            <View style={styles.footer}>
              <Text style={[styles.charCount, { color: charCountColor }]}>
                {bio.length}/{MAX_BIO_LENGTH}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={onCancel}
                  hitSlop={8}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onSave}
                  disabled={saving}
                  hitSlop={8}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Text style={[styles.saveText, { color: colors.primary }]}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.displayContainer}>
            <Text
              style={[
                styles.bioText,
                { color: bio ? colors.text : colors.textTertiary },
              ]}
            >
              {bio || 'Tap to add bio'}
            </Text>
            {bio && (
              <Text style={[styles.charCount, { color: colors.textTertiary }]}>
                {bio.length}/{MAX_BIO_LENGTH}
              </Text>
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
    fontSize: Typography.callout.fontSize,
    lineHeight: Typography.callout.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.callout.fontWeight as any,
    letterSpacing: Typography.callout.letterSpacing,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: Typography.caption1.fontSize,
    lineHeight: Typography.caption1.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.caption1.letterSpacing,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
  },
  cancelText: {
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.subhead.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.subhead.letterSpacing,
  },
  saveText: {
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.subhead.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as any,
    letterSpacing: Typography.subhead.letterSpacing,
  },
  displayContainer: {
    gap: 10,
  },
  bioText: {
    fontSize: Typography.callout.fontSize,
    lineHeight: Typography.p.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.callout.fontWeight as any,
    letterSpacing: Typography.callout.letterSpacing,
  },
});

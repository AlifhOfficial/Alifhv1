/**
 * Editable Field Component
 * Tap-to-edit field with native feel
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Body, Data } from '@/components/ui';
import { Typography, Spacing, Radius, Layout, Sizes } from '@/constants/theme';
import type { ThemeColors } from './types';

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (text: string) => void;
  saving: boolean;
  colors: ThemeColors;
  isLast?: boolean;
  prefix?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

export function EditableField({
  label,
  value,
  placeholder,
  disabled = false,
  suffix,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  saving,
  colors,
  isLast,
  prefix,
  keyboardType = 'default',
  maxLength,
}: EditableFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    onEdit();
  };

  const handlePressIn = () => {
    bgOpacity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    bgOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0,0,0,${bgOpacity.value * 0.03})`,
  }));

  if (isEditing) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.container, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
      >
        <Body size="bodySm" tone="muted">{label}</Body>
        <View style={styles.editContainer}>
          <View style={styles.inputWrapper}>
            {prefix && (
              <Body size="body" tone="secondary" style={styles.prefix}>
                {prefix}
              </Body>
            )}
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={colors.text3}
              style={[
                styles.input,
                Typography.bodyLg,
                { backgroundColor: colors.surface, color: colors.text },
              ]}
              keyboardType={keyboardType}
              maxLength={maxLength}
              returnKeyType="done"
              onSubmitEditing={onSave}
            />
          </View>
          <View style={styles.actions}>
            <HapticPressable
              onPress={onCancel}
              hitSlop={Layout.hitSlopSmall}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Body size="bodySm" tone="secondary">
                Cancel
              </Body>
            </HapticPressable>
            <HapticPressable
              onPress={onSave}
              disabled={saving}
              hitSlop={Layout.hitSlopSmall}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Data size="body" tone="primary">
                {saving ? 'Saving...' : 'Save'}
              </Data>
            </HapticPressable>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <HapticPressable
      onPress={handlePress}
      onPressIn={!disabled ? handlePressIn : undefined}
      onPressOut={!disabled ? handlePressOut : undefined}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.container,
          animatedBgStyle,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.labelValueContainer}>
            <Body size="bodySm" tone="muted">{label}</Body>
            <Body
              size="body"
              tone={value ? 'default' : 'muted'}
              numberOfLines={1}
            >
              {value || (disabled ? '—' : 'Add')}
            </Body>
          </View>
          <View style={styles.rightContainer}>
            {suffix}
            {!disabled && (
              <ChevronRight
                size={Sizes.iconSm}
                color={colors.text3}
                strokeWidth={2}
                style={styles.chevron}
              />
            )}
          </View>
        </View>
      </Animated.View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelValueContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chevron: {
    marginLeft: Spacing.xs,
  },
  editContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  prefix: {
    // Typography handled by <Body> component
  },
  input: {
    flex: 1,
    height: Layout.hitTarget,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xl,
  },
  actionBtn: {
    paddingVertical: Spacing.xs,
  },
});

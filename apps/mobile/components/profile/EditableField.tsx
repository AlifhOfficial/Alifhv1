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

import { Supporting, Body, Data } from '@/components/ui';
import { Typography } from '@/constants/theme';
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
        <Supporting size="medium" tone="muted">{label}</Supporting>
        <View style={styles.editContainer}>
          <View style={styles.inputWrapper}>
            {prefix && (
              <Body size="medium" tone="secondary" style={styles.prefix}>
                {prefix}
              </Body>
            )}
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                Typography.bodyLarge,
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
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Supporting size="medium" tone="secondary">
                Cancel
              </Supporting>
            </HapticPressable>
            <HapticPressable
              onPress={onSave}
              disabled={saving}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Data size="medium" tone="primary">
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
            <Supporting size="medium" tone="muted">{label}</Supporting>
            <Body
              size="large"
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
                size={18}
                color={colors.textTertiary}
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelValueContainer: {
    flex: 1,
    gap: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  editContainer: {
    marginTop: 8,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefix: {
    // Typography handled by <Body> component
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  actionBtn: {
    paddingVertical: 4,
  },
});

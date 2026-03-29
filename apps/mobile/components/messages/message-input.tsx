/**
 * Message Input - Mobile Native
 * Text input with send button, auto-resize, typing indicators
 * Inline component - parent handles keyboard avoidance
 */

import { HapticPressable } from '@/components/ui';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  Keyboard,
  Platform,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { Send, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Typography, Sizes, Layout, ZIndex, Shadows } from '@/constants/theme';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  initialText?: string;
  resetKey?: string;
  onRequestLocation?: () => void;
}

const COMPOSER_PILL_HEIGHT = Sizes.actionButtonLg;
const MIN_HEIGHT = COMPOSER_PILL_HEIGHT;
const MAX_HEIGHT = Spacing['5xl'] * 2.5;

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  initialText,
  resetKey,
  onRequestLocation,
}: MessageInputProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTypingRef = useRef(false);

  // Reset state when conversation changes
  useEffect(() => {
    if (!resetKey) return;
    setText('');
    setInputHeight(MIN_HEIGHT);

    // Reset typing state
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    onTyping?.(false);
  }, [resetKey, onTyping]);

  // Apply initial text
  useEffect(() => {
    if (!initialText) return;
    if (text.trim().length > 0) return;
    setText(initialText);
  }, [initialText, resetKey]);

  // Handle content size change for auto-resize
  const handleContentSizeChange = useCallback(
    (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const contentHeight = e.nativeEvent.contentSize.height;
      const newHeight = Math.min(Math.max(contentHeight, MIN_HEIGHT), MAX_HEIGHT);
      setInputHeight(newHeight);
    },
    []
  );

  // Handle text change with typing indicator
  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);

      // Emit typing start
      if (!isTypingRef.current && value.length > 0) {
        isTypingRef.current = true;
        onTyping?.(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      if (value.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          onTyping?.(false);
        }, 2000);
      } else {
        isTypingRef.current = false;
        onTyping?.(false);
      }
    },
    [onTyping]
  );

  // Handle send
  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled) return;

    // Clear immediately for snappy UX
    setText('');
    setInputHeight(MIN_HEIGHT);

    // Clear typing state
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping?.(false);
    }

    // Keep keyboard open by refocusing
    inputRef.current?.focus();

    // Fire and forget
    try {
      await onSend(trimmedText);
    } catch (error) {
      // Handled silently - optimistic update already done
    }
  }, [text, disabled, onSend, onTyping]);

  const canSend = text.trim().length > 0 && !disabled;

  // Animate bottom padding based on keyboard state
  const { progress } = useReanimatedKeyboardAnimation();
  const animatedContainerStyle = useAnimatedStyle(() => {
    // When keyboard is open (progress=1), use minimal padding; when closed (progress=0), use safe area
    const bottomPadding = interpolate(
      progress.value,
      [0, 1],
      [insets.bottom, Spacing.sm]
    );
    return { paddingBottom: bottomPadding };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle,
      ]}
    >
      <View
        style={[
          styles.composerRow,
        ]}
      >
        {/* Location Button */}
        {onRequestLocation && (
          <HapticPressable
            haptic="light"
            onPress={() => {
              Keyboard.dismiss();
              onRequestLocation();
            }}
            disabled={disabled}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.black,
              },
            ]}
          >
            <MapPin
              size={Sizes.iconSm}
              color={disabled ? colors.labelQuaternary : colors.labelTertiary}
              strokeWidth={2}
            />
          </HapticPressable>
        )}

        <Animated.View
          style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.black,
                minHeight: Math.max(inputHeight, COMPOSER_PILL_HEIGHT),
              },
            ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: colors.label },
            ]}
            value={text}
            onChangeText={handleChangeText}
            onContentSizeChange={handleContentSizeChange}
            placeholder={placeholder}
            placeholderTextColor={colors.labelTertiary}
            multiline
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit={false}
            selectionColor={colors.label}
          />
        </Animated.View>

        <HapticPressable
          haptic="medium"
          onPress={handleSend}
          disabled={!canSend}
            style={[
              styles.sendWrapper,
              {
                backgroundColor: canSend ? colors.primary : colors.surface,
                borderColor: canSend ? colors.primary : colors.border,
                shadowColor: colors.black,
              },
            ]}
          >
          <Send
            size={Sizes.iconSm}
            color={canSend ? colors.primaryForeground : colors.labelTertiary}
            strokeWidth={2.5}
          />
        </HapticPressable>
      </View>
    </Animated.View>
  );
}

// Export input height for parent components to use as padding
export const MESSAGE_INPUT_HEIGHT = Layout.hitTarget + Spacing.sm * 2;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    zIndex: ZIndex.overlay + 1,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: Radius.full,
    borderCurve: 'continuous',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
    minHeight: COMPOSER_PILL_HEIGHT,
    borderWidth: 1,
    ...Shadows.md,
  },
  input: {
    ...Typography.body,
    lineHeight: Typography.body.lineHeight,
    paddingTop: Platform.OS === 'ios' ? Spacing.xs : 0,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xs : 0,
    minHeight: COMPOSER_PILL_HEIGHT - Spacing.md,
    textAlignVertical: 'center',
    maxHeight: MAX_HEIGHT,
  },
  actionButton: {
    width: COMPOSER_PILL_HEIGHT,
    height: COMPOSER_PILL_HEIGHT,
    borderRadius: COMPOSER_PILL_HEIGHT / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
  sendWrapper: {
    width: COMPOSER_PILL_HEIGHT,
    height: COMPOSER_PILL_HEIGHT,
    borderRadius: COMPOSER_PILL_HEIGHT / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
});

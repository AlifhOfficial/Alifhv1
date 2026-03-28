/**
 * Message Input - Mobile Native
 * Text input with send button, auto-resize, typing indicators
 * Inline component - parent handles keyboard avoidance
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  Keyboard,
} from 'react-native';import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { HapticPressable } from '@/components/ui';
import { Send, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Typography, Sizes, Layout } from '@/constants/theme';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  initialText?: string;
  resetKey?: string;
  onRequestLocation?: () => void;
}

const MIN_HEIGHT = Sizes.actionButtonMd;
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
        { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: colors.bg },
        animatedContainerStyle,
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
              { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <MapPin
              size={Sizes.iconSm}
              color={disabled ? colors.textMuted : colors.text3}
              strokeWidth={2}
            />
          </HapticPressable>
        )}

        <Animated.View
          style={[
            styles.inputWrapper,
            { 
              backgroundColor: colors.input,
              borderColor: colors.border,
              borderWidth: StyleSheet.hairlineWidth,
              minHeight: Math.max(inputHeight, MIN_HEIGHT),
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: colors.text },
            ]}
            value={text}
            onChangeText={handleChangeText}
            onContentSizeChange={handleContentSizeChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit={false}
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
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Send
            size={Sizes.iconSm}
            color={canSend ? colors.primaryFg : colors.textMuted}
            strokeWidth={2}
          />
        </HapticPressable>
      </Animated.View>
  );
}

// Export input height for parent components to use as padding
export const MESSAGE_INPUT_HEIGHT = Layout.hitTarget + Spacing.sm * 2;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: Radius['2xl'],
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  input: {
    ...Typography.bodyLg,
    lineHeight: undefined,
    paddingVertical: Spacing.md,
    textAlignVertical: 'center',
    maxHeight: MAX_HEIGHT,
  },
  actionButton: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Sizes.bubbleMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  sendWrapper: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Sizes.bubbleMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
});

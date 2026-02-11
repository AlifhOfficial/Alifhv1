/**
 * Message Input - Mobile Native
 * Text input with send button, auto-resize, typing indicators
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  initialText?: string;
  resetKey?: string;
}

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 120;

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  initialText,
  resetKey,
}: MessageInputProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTypingRef = useRef(false);

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  // Add small padding when keyboard open, full safe area when closed
  const bottomPadding = isKeyboardVisible ? Spacing.md : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: colors.background, 
          borderTopColor: colors.border,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text, height: inputHeight }]}
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
      </View>

      <HapticPressable
        onPress={handleSend}
        disabled={!canSend}
        style={[
          styles.sendWrapper,
          {
            backgroundColor: canSend ? colors.primary : colors.surface,
            borderColor: canSend ? colors.primary : colors.border,
          },
        ]}
      >
        <Send
          size={20}
          color={canSend ? colors.primaryForeground : colors.textTertiary}
          strokeWidth={2}
        />
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  input: {
    ...Typography.bodyLarge,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.sm,
    textAlignVertical: 'center',
  },
  sendWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

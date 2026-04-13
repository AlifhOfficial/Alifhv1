import React, { forwardRef } from 'react';
import {
  Platform,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from 'react-native';

import { AppFontFamilies, Colors, InputTypography, Typography } from '@/constants/theme';
import { useThemeSafe } from '@/context/theme-context';

export type TextInputRef = RNTextInput;

export interface TextInputProps extends Omit<RNTextInputProps, 'allowFontScaling' | 'maxFontSizeMultiplier'> {}

export const TextInput = forwardRef<TextInputRef, TextInputProps>(function TextInput(
  { style, placeholderTextColor, selectionColor, cursorColor, ...props },
  ref,
) {
  const { colorScheme } = useThemeSafe();
  const colors = Colors[colorScheme];
  const hasValue =
    props.value !== undefined && props.value !== null
      ? String(props.value).length > 0
      : props.defaultValue !== undefined && props.defaultValue !== null
      ? String(props.defaultValue).length > 0
      : false;

  return (
    <RNTextInput
      {...props}
      ref={ref}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      placeholderTextColor={placeholderTextColor ?? colors.labelQuaternary}
      selectionColor={selectionColor ?? colors.primary}
      cursorColor={cursorColor ?? colors.primary}
      style={[
        {
          color: colors.label,
          ...InputTypography,
          fontFamily: AppFontFamilies.regular,
        },
        style,
        !hasValue && styles.placeholderCompact,
        Platform.OS === 'android' && styles.androidTextBase,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  androidTextBase: {
    includeFontPadding: false,
  },
  placeholderCompact: {
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.subhead.lineHeight,
    letterSpacing: Typography.subhead.letterSpacing,
  },
});

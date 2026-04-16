import React, { forwardRef } from 'react';
import {
  Platform,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useThemeSafe } from '@/context/theme-context';

export type TextInputRef = RNTextInput;

export type TextInputProps = Omit<RNTextInputProps, 'allowFontScaling' | 'maxFontSizeMultiplier'>;

function stripTypographyClassNames(className?: string) {
  if (!className) return className;

  const isTypographyToken = (token: string) => {
    const coreToken = token.includes(':') ? token.split(':').pop() ?? token : token;

    if (
      coreToken === 'italic' ||
      coreToken === 'not-italic' ||
      coreToken === 'uppercase' ||
      coreToken === 'lowercase' ||
      coreToken === 'capitalize' ||
      coreToken === 'normal-case'
    ) {
      return true;
    }

    return (
      coreToken.startsWith('font-') ||
      coreToken.startsWith('leading-') ||
      coreToken.startsWith('tracking-') ||
      /^(text-(xs|sm|base|lg|xl|[2-9]xl)|text-\[[^\]]+\])$/.test(coreToken)
    );
  };

  return className
    .split(/\s+/)
    .filter((token) => token && !isTypographyToken(token))
    .join(' ');
}

export const TextInput = forwardRef<TextInputRef, TextInputProps>(function TextInput(
  { style, placeholderTextColor, selectionColor, cursorColor, ...props },
  ref,
) {
  const { className, ...restProps } = props as TextInputProps & { className?: string };
  const { colorScheme } = useThemeSafe();
  const colors = Colors[colorScheme];
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const {
    fontFamily: _fontFamily,
    fontSize: _fontSize,
    fontStyle: _fontStyle,
    fontVariant: _fontVariant,
    fontWeight: _fontWeight,
    includeFontPadding: _includeFontPadding,
    letterSpacing: _letterSpacing,
    lineHeight: _lineHeight,
    textTransform: _textTransform,
    ...nonTypographyStyle
  } = flattenedStyle;
  const hasValue =
    props.value !== undefined && props.value !== null
      ? String(props.value).length > 0
      : props.defaultValue !== undefined && props.defaultValue !== null
      ? String(props.defaultValue).length > 0
      : false;
  const sanitizedClassName = stripTypographyClassNames(className);

  return (
    <RNTextInput
      {...restProps}
      className={sanitizedClassName}
      ref={ref}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      placeholderTextColor={placeholderTextColor ?? colors.labelQuaternary}
      selectionColor={selectionColor ?? colors.primary}
      cursorColor={cursorColor ?? colors.primary}
      style={[
        nonTypographyStyle,
        {
          color: colors.label,
          ...Typography.body,
        },
        !hasValue && styles.placeholderTypography,
        Platform.OS === 'android' && styles.androidTextBase,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  androidTextBase: {
    includeFontPadding: false,
  },
  placeholderTypography: {
    ...Typography.subhead,
  },
});

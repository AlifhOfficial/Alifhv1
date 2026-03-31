import React, { forwardRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronRight } from 'lucide-react-native';

import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { Button, HapticPressable, Text } from '@/components/ui';
import { InputTypography, Layout, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface AuthScreenShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
  scrollable?: boolean;
  keyboard?: boolean;
}

export function AuthScreenShell({
  title,
  subtitle,
  eyebrow,
  children,
  onBack,
  footer,
  scrollable = true,
  keyboard = true,
}: AuthScreenShellProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);

  const content = (
    <>
      <View style={styles.hero}>
        {eyebrow ? (
          <Text variant="subhead" tone="primary">
            {eyebrow}
          </Text>
        ) : null}
        <View style={styles.heroText}>
          <Text variant="title2Emphasized" style={{ color: colors.label }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="subhead" tone="secondary" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {children}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <MobileHeader title="" showBackButton={!!onBack} onBackPress={onBack} />
      {keyboard ? (
        <KeyboardAvoidingView behavior="padding" style={styles.flex}>
          {scrollable ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingTop: headerInset,
                  paddingBottom: insets.bottom + Spacing['3xl'],
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {content}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.staticContent,
                {
                  paddingTop: headerInset,
                  paddingBottom: insets.bottom + Spacing['3xl'],
                },
              ]}
            >
              {content}
            </View>
          )}
        </KeyboardAvoidingView>
      ) : scrollable ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: headerInset,
              paddingBottom: insets.bottom + Spacing['3xl'],
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.staticContent,
            {
              paddingTop: headerInset,
              paddingBottom: insets.bottom + Spacing['3xl'],
            },
          ]}
        >
          {content}
        </View>
      )}
    </View>
  );
}

interface AuthSectionProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AuthSection({ children, style }: AuthSectionProps) {
  return <View style={[styles.section, style]}>{children}</View>;
}

interface AuthFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  right?: React.ReactNode;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
  keyboardType?: KeyboardTypeOptions;
}

export const AuthField = forwardRef<TextInput, AuthFieldProps>(function AuthField({
  label,
  right,
  error,
  style,
  ...props
}, ref) {
  const { colors } = useTheme();

  return (
    <View style={style}>
      <Text variant="subhead" tone="muted" style={styles.fieldLabel}>
        {label}
      </Text>
      <View
        style={[
          styles.fieldShell,
          {
            backgroundColor: colors.background,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        <TextInput
          ref={ref}
          {...props}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          placeholderTextColor={colors.labelTertiary}
          selectionColor={colors.primary}
          style={[
            styles.fieldInput,
            InputTypography,
            { color: colors.label },
          ]}
        />
        {right ? <View style={styles.fieldRight}>{right}</View> : null}
      </View>
      {error ? (
        <Text variant="footnote" tone="error" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export function AuthErrorBanner({ error }: { error?: string | null }) {
  const { colors } = useTheme();

  if (!error) return null;

  return (
    <View
      style={[
        styles.errorBanner,
        {
          backgroundColor: colors.errorMuted,
          borderColor: colors.error,
        },
      ]}
    >
      <Text variant="subhead" tone="error">
        {error}
      </Text>
    </View>
  );
}

export function AuthProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.progressRow}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressPill,
            {
              backgroundColor: index < currentStep ? colors.primary : colors.surfaceSecondary,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function AuthRequirement({
  label,
  met,
}: {
  label: string;
  met: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.requirementRow}>
      <View
        style={[
          styles.requirementIcon,
          {
            backgroundColor: met ? colors.successMuted : colors.background,
            borderColor: met ? colors.success : colors.border,
          },
        ]}
      >
        {met ? <Check size={Sizes.iconXs} color={colors.success} strokeWidth={2.4} /> : null}
      </View>
      <Text variant="subhead" style={{ color: met ? colors.success : colors.labelSecondary }}>
        {label}
      </Text>
    </View>
  );
}

export function AuthInlineLink({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <HapticPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.inlineRow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.inlineCopy}>
        <Text variant="subhead" tone="muted">
          {label}
        </Text>
        <Text variant="subhead" style={{ color: colors.label }}>
          {value}
        </Text>
      </View>
      <ChevronRight size={Sizes.iconSm} color={colors.labelTertiary} strokeWidth={2.2} />
    </HapticPressable>
  );
}

export function AuthPrimaryButton(props: React.ComponentProps<typeof Button>) {
  const { colorScheme } = useTheme();

  return (
    <Button
      size="large"
      fullWidth
      variant={colorScheme === 'light' ? 'secondary' : 'primary'}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  hero: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  heroText: {
    gap: Spacing.sm,
  },
  subtitle: {
    maxWidth: '92%',
  },
  section: {
    gap: Spacing.lg,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  fieldShell: {
    minHeight: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  fieldInput: {
    flex: 1,
    minHeight: Sizes.actionButtonLg,
  },
  fieldRight: {
    marginLeft: Spacing.sm,
  },
  fieldError: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorBanner: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  footer: {
    marginTop: Spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  progressPill: {
    flex: 1,
    height: Spacing.xs,
    borderRadius: Radius.full,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requirementIcon: {
    width: Spacing.lg,
    height: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineRow: {
    minHeight: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineCopy: {
    flex: 1,
    gap: Spacing.xs,
    marginRight: Spacing.md,
  },
});

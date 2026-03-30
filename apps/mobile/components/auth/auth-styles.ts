/**
 * Auth Styles - Shared styles for authentication screens
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Centralized style definitions using proper theme tokens.
 * All auth screens should import from here for consistency.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { StyleSheet } from 'react-native';
import { Spacing, Radius, Typography, Layout, Sizes, ZIndex, InputTypography } from '@/constants/theme';

/**
 * Common auth screen styles
 * These are theme-agnostic (no colors) - colors are applied dynamically
 */
export const authStyles = StyleSheet.create({
  // ═══════════════════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════════════════
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },

  // ═══════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════
  header: {
    height: Sizes.actionButtonLg,
    justifyContent: 'center',
  },
  backButton: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    marginLeft: -Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ═══════════════════════════════════════════════════
  // TITLE SECTION
  // ═══════════════════════════════════════════════════
  titleSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  subtitle: {
    marginTop: Spacing.sm,
  },

  // ═══════════════════════════════════════════════════
  // FORM ELEMENTS
  // ═══════════════════════════════════════════════════
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.lg,
    ...InputTypography,
    backgroundColor: 'transparent',
  },
  passwordInputInner: {
    paddingRight: Spacing["5xl"],
  },
  showPasswordButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  // ═══════════════════════════════════════════════════
  // ERROR DISPLAY
  // ═══════════════════════════════════════════════════
  errorBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  errorText: {
    textAlign: 'center',
  },

  // ═══════════════════════════════════════════════════
  // BUTTONS
  // ═══════════════════════════════════════════════════
  submitButton: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  continueButton: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    marginTop: -Spacing.xs,
  },

  // ═══════════════════════════════════════════════════
  // DIVIDER
  // ═══════════════════════════════════════════════════
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing['3xl'],
    gap: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    textTransform: 'uppercase',
    letterSpacing: Typography.caption1Emphasized.letterSpacing,
  },

  // ═══════════════════════════════════════════════════
  // SOCIAL AUTH
  // ═══════════════════════════════════════════════════
  socialSection: {
    gap: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialIconButton: {
    width: Spacing["5xl"],
    height: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonNoBorder: {
    borderWidth: 0,
  },

  // ═══════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing['3xl'],
  },
  terms: {
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing.sm,
  },
  termsText: {
    textAlign: 'center',
  },

  // ═══════════════════════════════════════════════════
  // PASSWORD REQUIREMENTS
  // ═══════════════════════════════════════════════════
  requirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  requirementDot: {
    width: Spacing.xs,
    height: Spacing.xs,
    borderRadius: Radius.sm,
  },

  // ═══════════════════════════════════════════════════
  // OTP CODE INPUT
  // ═══════════════════════════════════════════════════
  codeSection: {
    position: 'relative',
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  codeBox: {
    width: Spacing["5xl"],
    height: Spacing["5xl"],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  codeCursor: {
    position: 'absolute',
    width: 2,
    height: Spacing["2xl"],
    borderRadius: Radius.sm,
  },
  codeHiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  // ═══════════════════════════════════════════════════
  // SUCCESS SCREEN
  // ═══════════════════════════════════════════════════
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSection: {
    marginBottom: Spacing['2xl'],
  },
  buttonSection: {
    alignItems: 'flex-end',
  },
  successIcon: {
    marginBottom: Spacing['2xl'],
  },
  resendSection: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  helpSection: {
    marginTop: 'auto',
    paddingBottom: Spacing['2xl'],
  },
  helpText: {
    textAlign: 'center',
  },
  loadingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
  },

  // ═══════════════════════════════════════════════════
  // CONFETTI
  // ═══════════════════════════════════════════════════
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: ZIndex.modal,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
  },
});

/**
 * Auth layout spacing constants
 */
export const AUTH_LAYOUT = {
  inputHeight: 54,
  buttonHeight: 54,
  headerHeight: 52,
  socialButtonWidth: 60,
  codeBoxWidth: 50,
  codeBoxHeight: 60,
} as const;

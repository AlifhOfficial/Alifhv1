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
import { Spacing, Radius, Typography, Layout, Sizes } from '@/constants/theme';

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
    height: 52,
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
    height: 54,
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
    ...Typography.body,
    backgroundColor: 'transparent',
  },
  passwordInputInner: {
    paddingRight: 60,
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
    height: 54,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  continueButton: {
    height: 54,
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
    letterSpacing: 0.5,
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
    width: 60,
    height: 54,
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
    width: 6,
    height: 6,
    borderRadius: 3,
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
    width: 50,
    height: 60,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  codeCursor: {
    position: 'absolute',
    width: 2,
    height: 26,
    borderRadius: 1,
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
    zIndex: 100,
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

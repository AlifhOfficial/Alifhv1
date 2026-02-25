/**
 * Onboarding Styles - Shared styles for onboarding flow
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * OLED black background for immersive onboarding experience.
 * All styles use theme tokens - no hardcoded values.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { StyleSheet } from 'react-native';
import { Spacing, Radius, Typography, Layout } from '@/constants/theme';

/**
 * Onboarding layout constants
 */
export const ONBOARDING_LAYOUT = {
  inputHeight: 56,
  buttonHeight: 56,
  progressHeight: 3,
  stepIndicatorSize: 8,
} as const;

/**
 * Common onboarding styles - OLED black background
 * Colors are applied dynamically using oledBlack/oledWhite from theme
 */
export const onboardingStyles = StyleSheet.create({
  // ═══════════════════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════════════════
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
  },

  // ═══════════════════════════════════════════════════
  // HEADER WITH PROGRESS
  // ═══════════════════════════════════════════════════
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Layout.hitTarget,
  },
  backButton: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.sm,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  progressBar: {
    flex: 1,
    height: ONBOARDING_LAYOUT.progressHeight,
    borderRadius: Radius.full,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: -Spacing.md,
  },

  // ═══════════════════════════════════════════════════
  // CONTENT SECTIONS
  // ═══════════════════════════════════════════════════
  heroSection: {
    marginTop: Spacing['4xl'],
    marginBottom: Spacing['3xl'],
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    opacity: 0.7,
  },

  // ═══════════════════════════════════════════════════
  // FORM ELEMENTS
  // ═══════════════════════════════════════════════════
  inputSection: {
    gap: Spacing.lg,
  },
  inputWrapper: {
    height: ONBOARDING_LAYOUT.inputHeight,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.xl,
    ...Typography.bodyMedium,
    backgroundColor: 'transparent',
  },
  passwordInputInner: {
    paddingRight: 70,
  },
  showPasswordButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  inputHint: {
    marginTop: Spacing.sm,
    marginLeft: Spacing.md,
  },

  // ═══════════════════════════════════════════════════
  // PASSWORD REQUIREMENTS
  // ═══════════════════════════════════════════════════
  requirementsContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },

  // ═══════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════
  errorContainer: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorText: {
    textAlign: 'center',
  },

  // ═══════════════════════════════════════════════════
  // OTP CODE INPUT
  // ═══════════════════════════════════════════════════
  codeSection: {
    position: 'relative',
    alignItems: 'center',
  },
  codeBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  codeBox: {
    width: 48,
    height: 58,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  codeCursor: {
    position: 'absolute',
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  codeHiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  // ═══════════════════════════════════════════════════
  // BUTTONS
  // ═══════════════════════════════════════════════════
  buttonSection: {
    marginTop: 'auto',
    paddingTop: Spacing['2xl'],
    gap: Spacing.md,
  },
  continueButton: {
    height: ONBOARDING_LAYOUT.buttonHeight,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: ONBOARDING_LAYOUT.buttonHeight,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },

  // ═══════════════════════════════════════════════════
  // SUCCESS / WELCOME
  // ═══════════════════════════════════════════════════
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing['3xl'],
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },

  // ═══════════════════════════════════════════════════
  // EMAIL SENT
  // ═══════════════════════════════════════════════════
  emailSentIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  emailHighlight: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
  },

  // ═══════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  helpText: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    opacity: 0.5,
  },
});

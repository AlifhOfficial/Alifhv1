/**
 * KYC Verification Sheet
 * 
 * Bottom sheet for identity verification flow.
 * Similar to web kyc-verification-modal but adapted for mobile.
 * Uses WebView to embed Didit verification.
 */

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui';
import { 
  Shield, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Camera,
  FileText,
  Zap,
  Loader2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { Colors, Typography, Layout, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, Data, ButtonText } from '@/components/ui';
import { startVerificationSession, cancelVerification } from '@/lib/kyc-api';

// ============================================================================
// TYPES
// ============================================================================

type KycStep = 'intro' | 'loading' | 'verifying' | 'confirm-cancel' | 'success' | 'failed' | 'in-review' | 'duplicate';

interface KycVerificationSheetProps {
  visible: boolean;
  onClose: () => void;
  onVerified?: () => void;
  /** Called when status changes - useful for refreshing profile data */
  onStatusChange?: () => void;
}

// JavaScript to inject into WebView to capture postMessage from webhook
const INJECTED_JS = `
  (function() {
    // Override postMessage to send to React Native
    var originalPostMessage = window.postMessage;
    window.postMessage = function(data, origin) {
      // Send to React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
      // Also call original
      return originalPostMessage.apply(this, arguments);
    };
    
    // Also listen for messages from parent (in case webhook sends to parent)
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'kyc-complete') {
        window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
      }
    });
    
    true; // Required for Android
  })();
`;

// ============================================================================
// COMPONENT
// ============================================================================

export function KycVerificationSheet({
  visible,
  onClose,
  onVerified,
  onStatusChange,
}: KycVerificationSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const webViewRef = useRef<WebView>(null);

  // State
  const [step, setStep] = useState<KycStep>('intro');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Snap points - larger for WebView content
  const snapPoints = useMemo(() => {
    if (step === 'verifying' || step === 'confirm-cancel') {
      return ['94%'];
    }
    return ['60%'];
  }, [step]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setStep('intro');
        setVerificationUrl(null);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Show/hide based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  // Backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior={step === 'verifying' || step === 'loading' ? 'none' : 'close'}
      />
    ),
    [step]
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // Reset and close
        if (step === 'verifying' && verificationUrl) {
          // User closed during verification - cancel session
          cancelVerification();
        }
        onClose();
      }
    },
    [onClose, step, verificationUrl]
  );

  // Start verification
  const handleStartVerification = useCallback(async () => {
    try {
      setStep('loading');
      setError(null);

      const result = await startVerificationSession();

      if (!result.success) {
        setError(result.error || 'Failed to start verification');
        setStep('failed');
        return;
      }

      // If there's an existing session already under review, show that status
      // instead of loading the WebView (it won't help)
      if (result.isExisting && result.status === 'pending') {
        setStep('in-review');
        onStatusChange?.();
        return;
      }

      if (result.verificationUrl) {
        setVerificationUrl(result.verificationUrl);
        setStep('verifying');
        onStatusChange?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setStep('failed');
    }
  }, [onStatusChange]);

  // Handle WebView message (from injected JS capturing postMessage)
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type !== 'kyc-complete') return;

      console.log('[KYC Sheet] Received postMessage:', data);

      // Trigger status change callback
      onStatusChange?.();

      switch (data.status) {
        case 'approved':
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setStep('success');
          setTimeout(() => {
            onVerified?.();
            onClose();
          }, 1500);
          break;

        case 'duplicate':
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          setStep('duplicate');
          setError(data.reason || 'This document has already been used to verify another account.');
          break;

        case 'pending':
          setStep('in-review');
          break;

        case 'rejected':
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          setStep('failed');
          setError(data.reason || 'Verification was declined. Please try again with a valid ID.');
          break;

        default:
          // Unknown status - stay on current screen
          break;
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, [onVerified, onClose, onStatusChange]);

  // Handle WebView navigation - detect callback redirect
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    // Check if we've been redirected to our webhook/callback URL
    const url = navState.url;
    if (url.includes('/api/kyc/webhook') && url.includes('status=')) {
      // Extract status from URL
      const urlParams = new URL(url).searchParams;
      const status = urlParams.get('status')?.toLowerCase();
      
      console.log('[KYC Sheet] Detected callback redirect, status:', status);
      
      // The WebView will load the HTML which sends postMessage
      // So we don't need to do anything here - handleWebViewMessage will catch it
    }
  }, []);

  // Cancel session and retry
  const handleCancelAndRetry = useCallback(async () => {
    setStep('loading');
    await cancelVerification();
    onStatusChange?.();
    setStep('intro');
  }, [onStatusChange]);

  // Confirm cancel during verification
  const handleConfirmCancel = useCallback(async () => {
    await cancelVerification();
    onStatusChange?.();
    onClose();
  }, [onClose, onStatusChange]);

  // Resume verification from confirm-cancel
  const handleResumeVerification = useCallback(() => {
    setStep('verifying');
  }, []);

  // Handle close button press
  const handleClose = useCallback(() => {
    if (step === 'verifying') {
      // Show confirmation before cancelling
      setStep('confirm-cancel');
    } else if (step === 'confirm-cancel') {
      // Already showing confirm, do nothing
      return;
    } else {
      if (step === 'loading' || verificationUrl) {
        cancelVerification();
        onStatusChange?.();
      }
      onClose();
    }
  }, [step, verificationUrl, onClose, onStatusChange]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={step !== 'verifying' && step !== 'loading'}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ 
        backgroundColor: colors.textMuted, 
        width: Sizes.actionButtonSm,
        display: step === 'verifying' || step === 'confirm-cancel' ? 'none' : 'flex',
      }}
      backgroundStyle={{ 
        backgroundColor: colors.surface, 
        borderRadius: Radius['3xl'] 
      }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {/* Intro Screen */}
        {step === 'intro' && (
          <View style={styles.introContainer}>
            {/* Header */}
            <View style={styles.header}>
              <HapticPressable
                onPress={handleClose}
                hitSlop={Spacing.md}
                style={styles.closeButton}
              >
                <X size={Sizes.iconSm} color={colors.textMuted} />
              </HapticPressable>
              
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryMuted }]}>
                <Shield size={Sizes.iconLg} color={colors.primary} />
              </View>
              <Heading size="small">Identity Verification</Heading>
              <Supporting size="medium" tone="muted" style={styles.subtitle}>
                Get verified in less than 2 minutes
              </Supporting>
            </View>

            {/* Steps */}
            <View style={[styles.stepsContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.stepRow}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primaryMuted }]}>
                  <FileText size={Sizes.iconXs} color={colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Body size="medium">Scan your ID</Body>
                  <Supporting size="small" tone="muted">Emirates ID, Passport, or License</Supporting>
                </View>
              </View>
              
              <View style={[styles.stepDivider, { backgroundColor: colors.border }]} />
              
              <View style={styles.stepRow}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primaryMuted }]}>
                  <Camera size={Sizes.iconXs} color={colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Body size="medium">Quick selfie</Body>
                  <Supporting size="small" tone="muted">We'll match it to your ID photo</Supporting>
                </View>
              </View>
              
              <View style={[styles.stepDivider, { backgroundColor: colors.border }]} />
              
              <View style={styles.stepRow}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primaryMuted }]}>
                  <Zap size={Sizes.iconXs} color={colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Body size="medium">Instant verification</Body>
                  <Supporting size="small" tone="muted">AI-powered by Didit</Supporting>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <HapticPressable
              onPress={handleStartVerification}
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            >
              <ButtonText size="medium" style={{ color: colors.primaryForeground }}>
                Continue
              </ButtonText>
              <ArrowRight size={Sizes.iconSm} color={colors.primaryForeground} />
            </HapticPressable>

            {/* Footer */}
            <Supporting size="small" tone="muted" style={styles.footer}>
              Your data is encrypted end-to-end with AES-256
            </Supporting>
          </View>
        )}

        {/* Loading State */}
        {step === 'loading' && (
          <View style={styles.centerContainer}>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color={colors.textMuted} />
            </View>
            <Heading size="small">Preparing</Heading>
            <Supporting size="medium" tone="muted">
              Setting up secure connection...
            </Supporting>
          </View>
        )}

        {/* WebView Verification */}
        {(step === 'verifying' || step === 'confirm-cancel') && verificationUrl && (
          <View style={styles.webViewContainer}>
            {/* Header */}
            <View style={[styles.webViewHeader, { borderBottomColor: colors.border }]}>
              <Heading size="small">Identity Verification</Heading>
              <HapticPressable
                onPress={handleClose}
                hitSlop={Spacing.md}
                style={[styles.webViewCloseButton, { backgroundColor: colors.surfaceSecondary }]}
              >
                <X size={Sizes.iconXs} color={colors.textMuted} />
              </HapticPressable>
            </View>
            
            <WebView
              ref={webViewRef}
              source={{ uri: verificationUrl }}
              style={[
                styles.webView,
                step === 'confirm-cancel' && styles.webViewDimmed,
              ]}
              injectedJavaScript={INJECTED_JS}
              onMessage={handleWebViewMessage}
              onNavigationStateChange={handleNavigationStateChange}
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              mediaCapturePermissionGrantType="grant"
              startInLoadingState
              renderLoading={() => (
                <View style={[styles.webViewLoading, { backgroundColor: colors.surface }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            />

            {/* Cancel Confirmation Overlay */}
            {step === 'confirm-cancel' && (
              <View style={styles.confirmOverlay}>
                <View style={[styles.confirmCard, { backgroundColor: colors.surface }]}>
                  <Heading size="small">Cancel verification?</Heading>
                  <Supporting size="medium" tone="muted" style={styles.confirmText}>
                    Your progress will be lost
                  </Supporting>
                  <View style={styles.confirmActions}>
                    <HapticPressable
                      onPress={handleResumeVerification}
                      style={[styles.confirmButton, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <ButtonText size="medium">Continue</ButtonText>
                    </HapticPressable>
                    <HapticPressable
                      onPress={handleConfirmCancel}
                      style={[styles.confirmButton, { backgroundColor: colors.error }]}
                    >
                      <ButtonText size="medium" style={{ color: colors.primaryForeground }}>
                        Cancel
                      </ButtonText>
                    </HapticPressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Success State */}
        {step === 'success' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.successMuted }]}>
              <CheckCircle2 size={Sizes.iconLg} color={colors.success} />
            </View>
            <Heading size="small">Verified</Heading>
            <Supporting size="medium" tone="muted">
              Your profile now has a verified badge
            </Supporting>
          </View>
        )}

        {/* In Review State */}
        {step === 'in-review' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warningMuted }]}>
              <Clock size={Sizes.iconLg} color={colors.warning} />
            </View>
            <Heading size="small">Under Review</Heading>
            <Supporting size="medium" tone="muted">
              We'll notify you once it's complete
            </Supporting>
            <View style={styles.inReviewActions}>
              <HapticPressable
                onPress={onClose}
                style={[styles.resultButton, { backgroundColor: colors.surfaceSecondary }]}
              >
                <ButtonText size="medium">Got it</ButtonText>
              </HapticPressable>
              <HapticPressable
                onPress={handleCancelAndRetry}
                style={[styles.retryLink]}
              >
                <Supporting size="small" tone="muted">
                  Cancel & start over
                </Supporting>
              </HapticPressable>
            </View>
          </View>
        )}

        {/* Failed State */}
        {step === 'failed' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.errorMuted }]}>
              <X size={Sizes.iconLg} color={colors.error} />
            </View>
            <Heading size="small">Verification Failed</Heading>
            <Supporting size="medium" tone="muted" style={styles.errorText}>
              {error || 'Please try again with a valid ID'}
            </Supporting>
            <HapticPressable
              onPress={handleCancelAndRetry}
              style={[styles.resultButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ButtonText size="medium">Try again</ButtonText>
            </HapticPressable>
          </View>
        )}

        {/* Duplicate State */}
        {step === 'duplicate' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.errorMuted }]}>
              <AlertCircle size={Sizes.iconLg} color={colors.error} />
            </View>
            <Heading size="small">Document Already Used</Heading>
            <Supporting size="medium" tone="muted" style={styles.errorText}>
              {error || 'This ID is linked to another account'}
            </Supporting>
            <HapticPressable
              onPress={onClose}
              style={[styles.resultButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ButtonText size="medium">Close</ButtonText>
            </HapticPressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  // Intro
  introContainer: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Spacing.sm,
  },
  iconContainer: {
    width: Sizes.avatarLg,
    height: Sizes.avatarLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  stepsContainer: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepIcon: {
    width: Sizes.actionButtonSm,
    height: Sizes.actionButtonSm,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepDivider: {
    height: 1,
    marginLeft: Sizes.actionButtonSm + Spacing.md,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  // Center container for loading/result states
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  resultButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
  },
  inReviewActions: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  retryLink: {
    padding: Spacing.sm,
  },
  errorText: {
    textAlign: 'center',
  },
  // WebView
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  webViewCloseButton: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  webView: {
    flex: 1,
  },
  webViewDimmed: {
    opacity: 0.3,
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Confirm cancel overlay
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 300,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmText: {
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});

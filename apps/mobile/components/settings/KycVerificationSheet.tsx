/**
 * KYC Verification Sheet
 * 
 * Mobile equivalent of web kyc-verification-modal.tsx
 * Matches web behavior 1:1
 */

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticPressable } from '@/components/ui';
import { 
  Shield, 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Camera,
  FileText,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { startVerificationSession, cancelVerification } from '@/lib/kyc-api';

// ============================================================================
// TYPES
// ============================================================================

type KycStatus = 'intro' | 'loading' | 'verifying' | 'confirm-cancel' | 'in-review' | 'success' | 'failed' | 'duplicate';

interface KycVerificationSheetProps {
  visible: boolean;
  onClose: () => void;
  onVerified?: () => void;
  /** Called to refresh profile data (equivalent to queryClient.refetchQueries) */
  onRefreshProfile?: () => void;
}

// JavaScript to inject into WebView to capture postMessage from webhook
const INJECTED_JS = `
  (function() {
    // Listen for messages and forward to React Native
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'kyc-complete') {
        window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
      }
    });
    true;
  })();
`;

// ============================================================================
// COMPONENT
// ============================================================================

export function KycVerificationSheet({
  visible,
  onClose,
  onVerified,
  onRefreshProfile,
}: KycVerificationSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const webViewRef = useRef<WebView>(null);

  // State - matches web exactly
  const [status, setStatus] = useState<KycStatus>('intro');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Snap points - larger for WebView content
  const snapPoints = useMemo(() => {
    if (status === 'verifying' || status === 'confirm-cancel') {
      return ['94%'];
    }
    return ['60%'];
  }, [status]);

  // Reset state when sheet closes - matches web
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setStatus('intro');
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
        pressBehavior={status === 'verifying' || status === 'loading' ? 'none' : 'close'}
      />
    ),
    [status]
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Start verification - matches web startVerification()
  const startVerification = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);

      const result = await startVerificationSession();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start verification');
      }

      if (result.verificationUrl) {
        setVerificationUrl(result.verificationUrl);
        setStatus('verifying');
        onRefreshProfile?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setStatus('failed');
    }
  }, [onRefreshProfile]);

  // Cancel session - matches web cancelSession()
  const cancelSession = useCallback(async () => {
    try {
      await cancelVerification();
      onRefreshProfile?.();
    } catch {
      // Silent fail - next session start will clean up anyway
    }
  }, [onRefreshProfile]);

  // Cancel and retry - matches web cancelAndRetry()
  const cancelAndRetry = useCallback(async () => {
    setStatus('loading');
    await cancelSession();
    setStatus('intro');
  }, [cancelSession]);

  // Confirm cancel - matches web confirmCancel()
  const confirmCancel = useCallback(async () => {
    await cancelSession();
    onClose();
  }, [cancelSession, onClose]);

  // Handle close - matches web handleClose()
  const handleClose = useCallback(() => {
    if (status === 'verifying') {
      // Show custom confirmation instead of browser confirm
      setStatus('confirm-cancel');
    } else if (status === 'confirm-cancel') {
      // Already showing confirm, do nothing
      return;
    } else {
      // If we were loading or in any non-success state, also cancel
      if (status === 'loading' || verificationUrl) {
        cancelSession();
      }
      onClose();
    }
  }, [status, verificationUrl, cancelSession, onClose]);

  // Resume verification - matches web resumeVerification()
  const resumeVerification = useCallback(() => {
    setStatus('verifying');
  }, []);

  /**
   * Handle WebView message - matches web window.addEventListener('message')
   * 
   * Webhook sends these exact statuses:
   * - 'approved' → success
   * - 'rejected' → failed (with reason)
   * - 'pending' → in-review
   * - 'duplicate' → duplicate document
   */
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type !== 'kyc-complete') return;

      const { status: webhookStatus, reason } = data;

      // Refetch profile first
      onRefreshProfile?.();

      switch (webhookStatus) {
        case 'approved':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStatus('success');
          setTimeout(() => onVerified?.(), 1500);
          break;

        case 'duplicate':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setStatus('duplicate');
          setError(reason || 'This document has already been used to verify another account.');
          break;

        case 'pending':
          setStatus('in-review');
          break;

        case 'rejected':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setStatus('failed');
          setError(reason || 'Verification was declined. Please try again with a valid ID.');
          break;

        default:
          // Unknown status - stay on current screen
          break;
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, [onVerified, onRefreshProfile]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={status !== 'verifying' && status !== 'loading'}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ 
        backgroundColor: colors.textMuted, 
        width: Sizes.actionButtonSm,
        display: status === 'verifying' || status === 'confirm-cancel' ? 'none' : 'flex',
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
        {status === 'intro' && (
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
              onPress={startVerification}
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
        {status === 'loading' && (
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

        {/* Duplicate Document State */}
        {status === 'duplicate' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.errorMuted }]}>
              <X size={Sizes.iconLg} color={colors.error} />
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

        {/* WebView Verification */}
        {(status === 'verifying' || status === 'confirm-cancel') && verificationUrl && (
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
                status === 'confirm-cancel' && styles.webViewDimmed,
              ]}
              injectedJavaScript={INJECTED_JS}
              onMessage={handleWebViewMessage}
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
            {status === 'confirm-cancel' && (
              <View style={styles.confirmOverlay}>
                <View style={[styles.confirmCard, { backgroundColor: colors.surface }]}>
                  <Heading size="small">Cancel verification?</Heading>
                  <Supporting size="medium" tone="muted" style={styles.confirmText}>
                    Your progress will be lost
                  </Supporting>
                  <View style={styles.confirmActions}>
                    <HapticPressable
                      onPress={resumeVerification}
                      style={[styles.confirmButton, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <ButtonText size="medium">Continue</ButtonText>
                    </HapticPressable>
                    <HapticPressable
                      onPress={confirmCancel}
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
        {status === 'success' && (
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
        {status === 'in-review' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warningMuted }]}>
              <Clock size={Sizes.iconLg} color={colors.warning} />
            </View>
            <Heading size="small">Under Review</Heading>
            <Supporting size="medium" tone="muted">
              We'll notify you once it's complete
            </Supporting>
            <HapticPressable
              onPress={onClose}
              style={[styles.resultButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ButtonText size="medium">Got it</ButtonText>
            </HapticPressable>
          </View>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <View style={styles.centerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: colors.errorMuted }]}>
              <X size={Sizes.iconLg} color={colors.error} />
            </View>
            <Heading size="small">Verification Failed</Heading>
            <Supporting size="medium" tone="muted" style={styles.errorText}>
              {error || 'Please try again with a valid ID'}
            </Supporting>
            <HapticPressable
              onPress={cancelAndRetry}
              style={[styles.resultButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ButtonText size="medium">Try again</ButtonText>
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

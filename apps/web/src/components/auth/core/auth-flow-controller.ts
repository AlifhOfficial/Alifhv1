/**
 * Auth Flow Controller - Business Logic Coordinator
 * 
 * Simplified authentication flows:
 * - Sign In: email/password or Google → feedback → success
 * - Sign Up: email → OTP verification → auto sign-in → success
 * - Google: Popup-based flow for sign-in/sign-up (auto-creates account if new)
 */

import { AUTH_CONFIG } from "@/lib/auth/config";
import { 
  signInWithEmail, 
  signInWithGooglePopup,
  signInWithApplePopup,
  signUpWithEmail, 
  requestPasswordReset,
  sendMagicLink,
  verifyEmailWithOTP,
  resendVerificationOTP,
} from "./auth-handlers";
import { AuthState, AuthActions, AuthCallbacks } from "./auth-state";
import { getAuthErrorInfo, parseAuthError, AuthErrorAction } from "@/lib/auth/errors";

export class AuthFlowController {
  private isFlowActive: boolean = false;

  constructor(
    private state: AuthState,
    private actions: AuthActions,
    private callbacks: AuthCallbacks = {}
  ) {}

  private cancelCurrentFlow() {
    this.isFlowActive = false;
    this.actions.setLoading(false);
  }

  private async startFlow(run: () => Promise<void>) {
    this.cancelCurrentFlow();
    this.isFlowActive = true;

    try {
      await run();
    } catch (error) {
      console.error("[AuthFlowController] Flow error", error);
    } finally {
      this.isFlowActive = false;
    }
  }

  private async wait(ms: number): Promise<boolean> {
    if (ms <= 0) return true;
    await new Promise(resolve => setTimeout(resolve, ms));
    return this.isFlowActive;
  }

  // ============================================================================
  // SIGN IN FLOWS
  // ============================================================================

  async handleSignIn(email: string, password: string) {
    this.startFlow(async () => {
      this.actions.setSignInSuccess(false);
      this.actions.setCurrentModal("signin-feedback");
      this.actions.setLoading(true);
      this.actions.setError(null);

      const normalizedEmail = email.trim().toLowerCase();
      const result = await signInWithEmail(normalizedEmail, password);
      if (!this.isFlowActive) return;

      if (result.success) {
        this.actions.setSignInSuccess(true);
        this.actions.setLoading(false);
        this.callbacks.onSuccess?.(result.user);
        this.handleCloseAll();
      } else if ((result as any).needsVerification && result.error === "EMAIL_NOT_VERIFIED") {
        // User exists but email not verified
        // Only proceed if this is truly a verification issue, not a network/origin error
        console.warn('[AuthFlow] User needs verification, sending OTP');
        
        // Send OTP for verification
        const otpResult = await resendVerificationOTP(normalizedEmail, "email-verification");
        if (!this.isFlowActive) return;
        
        if (otpResult.success) {
          // Show OTP modal - store email and password so we can auto-signin after verification
          this.actions.setOtpData({ 
            email: normalizedEmail, 
            type: "email-verification", 
            password,
            attemptsRemaining: AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS,
            cooldownSeconds: otpResult.retryAfterSeconds ?? AUTH_CONFIG.EMAIL_OTP.RESEND_COOLDOWN_SECONDS,
          });
          this.actions.setLoading(false);
          this.actions.setCurrentModal("otp-verification");
        } else {
          if (typeof otpResult.retryAfterSeconds === 'number') {
            this.actions.setOtpData({
              email: normalizedEmail,
              type: "email-verification",
              password,
              attemptsRemaining: typeof otpResult.attemptsRemaining === 'number'
                ? otpResult.attemptsRemaining
                : 0,
              cooldownSeconds: otpResult.retryAfterSeconds,
            });
            this.actions.setError(otpResult.error || "Please wait before requesting a new code.");
            this.actions.setLoading(false);
            this.actions.setCurrentModal("otp-verification");
          } else {
            // Failed to send OTP - show error
            this.actions.setError("Failed to send verification code. Please try again.");
            this.actions.setLoading(false);
            this.actions.setCurrentModal("signin");
          }
        }
      } else {
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  /**
   * Google Sign In - Uses Better Auth redirect flow
   * User will be redirected to Google immediately - no loading state needed
   */
  async handleGoogleSignIn() {
    this.startFlow(async () => {
      // Don't set loading state - just redirect immediately
      this.actions.setError(null);

      // Trigger redirect to Google OAuth
      const result = await signInWithGooglePopup();
      
      // Only reaches here if redirect failed
      if (!result.success) {
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  /**
   * Passkey Sign In - Uses WebAuthn/biometric authentication
   * User authenticates with fingerprint, face, or security key
   * Note: For conditional mediation, auth already happened - just show success
   */
  async handlePasskeySignIn() {
    this.startFlow(async () => {
      // Auth already completed via conditional mediation, just show success feedback
      this.actions.setSignInSuccess(true);
      this.actions.setLoading(false);
      this.actions.setCurrentModal("signin-feedback");
      this.callbacks.onSuccess?.();
      this.handleCloseAll();
    });
  }

  // ============================================================================
  // SIGN UP FLOWS (Simplified)
  // ============================================================================

  async handleSignUp(name: string, email: string, password: string) {
    if (password.length < AUTH_CONFIG.PASSWORD.MIN_LENGTH) {
      this.actions.setError(`Password must be at least ${AUTH_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
      return;
    }

    this.startFlow(async () => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();

      this.actions.setLoading(true);
      this.actions.setError(null);

      const result = await signUpWithEmail(normalizedName, normalizedEmail, password);
      if (!this.isFlowActive) return;

      if (result.success) {
        // Show OTP verification modal - user stays in same browser tab!
        // Store password so we can auto sign-in after OTP verification
        this.actions.setOtpData({
          email: normalizedEmail,
          type: "email-verification",
          password,
          attemptsRemaining: AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS,
          cooldownSeconds: AUTH_CONFIG.EMAIL_OTP.RESEND_COOLDOWN_SECONDS,
        });
        this.actions.setLoading(false);
        this.actions.setCurrentModal("otp-verification");
      } else {
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  // Google sign-up = Google sign-in (auto-creates account)
  async handleGoogleSignUp() {
    return this.handleGoogleSignIn();
  }

  /**
   * Apple Sign In - Uses Better Auth redirect flow
   * User will be redirected to Apple immediately - no loading state needed
   */
  async handleAppleSignIn() {
    this.startFlow(async () => {
      // Don't set loading state - just redirect immediately
      this.actions.setError(null);

      // Trigger redirect to Apple OAuth
      const result = await signInWithApplePopup();
      
      // Only reaches here if redirect failed
      if (!result.success) {
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  // Apple sign-up = Apple sign-in (auto-creates account)
  async handleAppleSignUp() {
    return this.handleAppleSignIn();
  }

  // ============================================================================
  // OTHER AUTH FLOWS
  // ============================================================================

  async handleForgotPassword(email: string) {
    this.startFlow(async () => {
      const normalizedEmail = email.trim().toLowerCase();

      this.actions.setLoading(true);
      this.actions.setError(null);

      const result = await requestPasswordReset(normalizedEmail);
      if (!this.isFlowActive) return;

      if (result.success) {
        this.actions.setEmailSentData({ email: normalizedEmail, type: "reset" });
        this.actions.setCurrentModal("email-sent");
      } else {
        if (typeof result.retryAfterSeconds === 'number' && result.retryAfterSeconds > 0) {
          this.actions.setError(`${result.error || 'Please wait before retrying.'} (${result.retryAfterSeconds}s)`);
          this.actions.setCurrentModal("forgot-password");
        } else {
          const errorMessage = parseAuthError(result.error);
          const errorInfo = getAuthErrorInfo(errorMessage);
          
          this.actions.setAuthErrorInfo(errorInfo);
          this.actions.setCurrentModal("auth-error");
        }
      }

      this.actions.setLoading(false);
    });
  }

  async handleMagicLink(email: string) {
    this.startFlow(async () => {
      const normalizedEmail = email.trim().toLowerCase();

      this.actions.setLoading(true);
      this.actions.setError(null);

      const result = await sendMagicLink(normalizedEmail);
      if (!this.isFlowActive) return;

      if (result.success) {
        this.actions.setEmailSentData({ email: normalizedEmail, type: "magic-link" });
        this.actions.setCurrentModal("email-sent");
      } else {
        if (typeof result.retryAfterSeconds === 'number' && result.retryAfterSeconds > 0) {
          this.actions.setError(`${result.error || 'Please wait before retrying.'} (${result.retryAfterSeconds}s)`);
          this.actions.setCurrentModal("magic-link");
        } else {
          const errorMessage = parseAuthError(result.error);
          const errorInfo = getAuthErrorInfo(errorMessage);
          
          this.actions.setAuthErrorInfo(errorInfo);
          this.actions.setCurrentModal("auth-error");
        }
      }

      this.actions.setLoading(false);
    });
  }

  // ============================================================================
  // OTP VERIFICATION FLOW
  // ============================================================================

  /**
   * Verify OTP code after sign-up
   * On success, user is verified and automatically signed in
   */
  async handleVerifyOTP(otp: string) {
    const otpData = this.state.otpData;
    if (!otpData) return;

    this.startFlow(async () => {
      this.actions.setLoading(true);
      this.actions.setError(null);

      const result = await verifyEmailWithOTP(otpData.email, otp);
      if (!this.isFlowActive) return;

      if (result.success) {
        // Email verified! Now sign the user in automatically
        if (otpData.password) {
          // Sign in with stored credentials
          const signInResult = await signInWithEmail(otpData.email, otpData.password);
          if (!this.isFlowActive) return;

          if (signInResult.success) {
            // Success! Show feedback and close
            this.actions.setSignInSuccess(true);
            this.actions.setLoading(false);
            this.actions.setCurrentModal("signin-feedback");
            this.actions.setOtpData(null);
            this.callbacks.onSuccess?.(signInResult.user);
            this.handleCloseAll();
          } else {
            // Sign-in failed, but email is verified - let user sign in manually
            this.actions.setOtpData(null);
            this.actions.setLoading(false);
            this.actions.setCurrentModal("signin");
          }
        } else {
          // No password stored, just show success and let user sign in
          this.actions.setSignInSuccess(true);
          this.actions.setLoading(false);
          this.actions.setCurrentModal("signin-feedback");
          this.actions.setOtpData(null);
          this.callbacks.onSuccess?.();
          this.handleCloseAll();
        }
      } else {
        // Show error inline in the OTP modal
        this.actions.setError(result.error || "Verification failed");

        if (typeof result.attemptsRemaining === 'number' || typeof result.retryAfterSeconds === 'number') {
          this.actions.setOtpData({
            ...otpData,
            attemptsRemaining: typeof result.attemptsRemaining === 'number'
              ? result.attemptsRemaining
              : otpData.attemptsRemaining,
            cooldownSeconds: typeof result.retryAfterSeconds === 'number'
              ? result.retryAfterSeconds
              : otpData.cooldownSeconds,
          });
        }

        this.actions.setLoading(false);
      }
    });
  }

  /**
   * Resend OTP code
   */
  async handleResendOTP() {
    const otpData = this.state.otpData;
    if (!otpData) {
      return { success: false, error: "Missing OTP data" };
    }

    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await resendVerificationOTP(otpData.email, otpData.type);
    
    this.actions.setLoading(false);
    
    if (!result.success) {
      this.actions.setError(result.error || "Failed to resend code");
      this.actions.setOtpData({
        ...otpData,
        attemptsRemaining: typeof result.attemptsRemaining === 'number'
          ? result.attemptsRemaining
          : otpData.attemptsRemaining,
        cooldownSeconds: typeof result.retryAfterSeconds === 'number'
          ? result.retryAfterSeconds
          : otpData.cooldownSeconds,
      });
      return result;
    }

    this.actions.setOtpData({
      ...otpData,
      attemptsRemaining: AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS,
      cooldownSeconds: result.retryAfterSeconds ?? AUTH_CONFIG.EMAIL_OTP.RESEND_COOLDOWN_SECONDS,
    });

    return result;
  }

  /**
   * Go back from OTP verification to sign-up
   */
  handleOTPBack() {
    this.cancelCurrentFlow();
    this.actions.setOtpData(null);
    this.actions.setError(null);
    this.actions.setCurrentModal("signup");
  }

  // ============================================================================
  // MODAL NAVIGATION
  // ============================================================================

  handleEmailSentClose() {
    this.actions.setCurrentModal("signin");
    this.actions.setEmailSentData(null);
  }

  handleResendEmail() {
    const emailData = this.state.emailSentData;
    if (!emailData) return;

    if (emailData.type === "verification") {
      this.actions.setCurrentModal("signup");
    } else if (emailData.type === "reset") {
      this.actions.setCurrentModal("forgot-password");
    } else if (emailData.type === "magic-link") {
      this.actions.setCurrentModal("magic-link");
    }
    this.actions.setEmailSentData(null);
  }

  handleErrorAction(action: AuthErrorAction) {
    this.cancelCurrentFlow();
    
    switch (action) {
      case "SIGN_IN":
        this.actions.setCurrentModal("signin");
        this.actions.setAuthErrorInfo(null);
        break;
      
      case "SIGN_UP":
        this.actions.setCurrentModal("signup");
        this.actions.setAuthErrorInfo(null);
        break;
      
      case "RETRY":
        this.actions.setCurrentModal("signin");
        this.actions.setAuthErrorInfo(null);
        break;
      
      case "CONTACT_SUPPORT":
        this.handleCloseAll();
        if (typeof window !== 'undefined') {
          window.location.href = '/contact';
        }
        break;
      
      case "CLOSE":
      default:
        this.handleCloseAll();
        break;
    }
  }

  handleCloseAll() {
    this.cancelCurrentFlow();
    this.actions.resetState();
    this.callbacks.onClose?.();
  }
}

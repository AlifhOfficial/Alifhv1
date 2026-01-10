/**
 * Auth Flow Controller - Business Logic Coordinator
 * 
 * Simplified authentication flows:
 * - Sign In: email/password or Google → feedback → success
 * - Sign Up: email → verification email sent → done (user signs in after verifying)
 * - Google: Popup-based flow for sign-in/sign-up (auto-creates account if new)
 */

import { AUTH_CONFIG } from "@/lib/auth/config";
import { 
  signInWithEmail, 
  signInWithGooglePopup, 
  signUpWithEmail, 
  requestPasswordReset,
  sendMagicLink,
  AuthUser,
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

      const result = await signInWithEmail(email, password);
      if (!this.isFlowActive) return;

      if (result.success) {
        this.actions.setSignInSuccess(true);
        this.actions.setLoading(false);

        const stillActive = await this.wait(AUTH_CONFIG.FEEDBACK_DELAYS.SUCCESS_DISPLAY);
        if (!stillActive) return;

        this.callbacks.onSuccess?.(result.user);
        this.handleCloseAll();
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
   * Google Sign In - Opens in popup window for better UX
   * User stays on current page, popup handles OAuth flow
   */
  async handleGoogleSignIn() {
    this.startFlow(async () => {
      // Show loading state in current modal (don't switch to redirect modal)
      this.actions.setLoading(true);
      this.actions.setError(null);

      // Open Google OAuth in popup - this awaits until popup completes/closes
      const result = await signInWithGooglePopup();
      if (!this.isFlowActive) return;

      if (result.success) {
        // Show success feedback briefly
        this.actions.setSignInSuccess(true);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("signin-feedback");

        const stillActive = await this.wait(AUTH_CONFIG.FEEDBACK_DELAYS.SUCCESS_DISPLAY);
        if (!stillActive) return;

        this.callbacks.onSuccess?.(result.user);
        this.handleCloseAll();
      } else {
        // User cancelled or error occurred
        // If just cancelled, close modal silently
        if (result.error === "Sign in window was closed" || result.error === "Sign in was cancelled") {
          this.actions.setLoading(false);
          // Keep current modal open, user can try again
          return;
        }
        
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
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
        // Just show email sent modal - user will sign in after verifying
        const emailForState = result.user?.email || normalizedEmail;
        this.actions.setEmailSentData({ email: emailForState, type: "verification" });
        this.actions.setLoading(false);
        this.actions.setCurrentModal("email-sent");
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
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setCurrentModal("auth-error");
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
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setCurrentModal("auth-error");
      }

      this.actions.setLoading(false);
    });
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

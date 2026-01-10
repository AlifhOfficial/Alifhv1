/**
 * Auth Flow Controller - Business Logic Coordinator
 * 
 * Coordinates authentication flows using handlers and state management
 * Pure business logic without direct UI dependencies
 * 
 * Simplified: Removed complex AbortController logic in favor of simple boolean flags
 */

import { AUTH_CONFIG } from "@/lib/auth/config";
import { 
  signInWithEmail, 
  signInWithGoogle, 
  signUpWithEmail, 
  signUpWithGoogle,
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
    return this.isFlowActive; // Return whether flow is still active
  }

  // Sign In Flows
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
        // Show error in auth error modal
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  async handleGoogleSignIn() {
    this.startFlow(async () => {
      this.actions.setCurrentModal("google-redirect");
      this.actions.setLoading(true);
      this.actions.setError(null);

      const result = await signInWithGoogle();
      if (!this.isFlowActive) return;

      if (result.success) {
        this.actions.setSignInSuccess(true);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("signin-feedback");

        const stillActive = await this.wait(AUTH_CONFIG.FEEDBACK_DELAYS.SUCCESS_DISPLAY);
        if (!stillActive) return;

        this.callbacks.onSuccess?.(result.user);
        this.handleCloseAll();
      } else {
        // Show error in auth error modal
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  // Sign Up Flows
  async handleSignUp(name: string, email: string, password: string) {
    // Validation
    if (password.length < AUTH_CONFIG.PASSWORD.MIN_LENGTH) {
      this.actions.setError(`Password must be at least ${AUTH_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
      return;
    }

    this.startFlow(async () => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();

      this.actions.setLoading(true);
      this.actions.setError(null);
      this.actions.setSignUpSource('email');

      const result = await signUpWithEmail(normalizedName, normalizedEmail, password);
      if (!this.isFlowActive) return;

      if (result.success) {
        this.actions.setNewUserName(normalizedName);
        this.actions.setIsNewUser(true);
        this.actions.setLoading(false);
        const emailForState = result.user?.email || normalizedEmail;
        this.actions.setEmailSentData({ email: emailForState, type: "verification" });
        this.actions.setCurrentModal("email-sent");
      } else {
        // Show error in auth error modal
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  async handleGoogleSignUp() {
    this.startFlow(async () => {
      this.actions.setCurrentModal("google-redirect");
      this.actions.setLoading(true);
      this.actions.setError(null);
      this.actions.setSignUpSource('google');

      const result = await signUpWithGoogle();
      if (!this.isFlowActive) return;

      if (result.success) {
        const userName = result.user?.name || "New User";
        this.actions.setNewUserName(userName);
        this.actions.setIsNewUser(true);
        this.actions.setLoading(false);
        
        // Skip feedback modal, go straight to welcome
        this.actions.setCurrentModal("welcome");
      } else {
        // Show error in auth error modal
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setLoading(false);
        this.actions.setCurrentModal("auth-error");
      }
    });
  }

  handleGoogleSignUpComplete() {
    this.startFlow(async () => {
      this.actions.setIsNewUser(true);
      this.actions.setLoading(false);
      this.actions.setSignUpSource('google');
      
      // Skip feedback, go straight to welcome
      this.actions.setCurrentModal("welcome");
    });
  }

  // Other Auth Flows
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
        // Show error in auth error modal
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
        // Show error in auth error modal
        const errorMessage = parseAuthError(result.error);
        const errorInfo = getAuthErrorInfo(errorMessage);
        
        this.actions.setAuthErrorInfo(errorInfo);
        this.actions.setCurrentModal("auth-error");
      }

      this.actions.setLoading(false);
    });
  }

  // Modal Navigation
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

  // Handle email verification completion (called when user clicks verification link)
  handleEmailVerificationComplete() {
    this.startFlow(async () => {
      this.actions.setSignUpSuccess(true);
      this.actions.setCurrentModal("signup-feedback");
      this.actions.setEmailSentData(null);

      const stillActive = await this.wait(AUTH_CONFIG.FEEDBACK_DELAYS.WELCOME_DISPLAY);
      if (!stillActive) return;

      this.actions.setCurrentModal("welcome");
    });
  }

  // Handle magic link sign in completion (called when user clicks magic link)  
  handleMagicLinkComplete() {
    const email = this.state.emailSentData?.email || "";

    this.startFlow(async () => {
      this.actions.setSignInSuccess(true);
      this.actions.setCurrentModal("signin-feedback");
      this.actions.setEmailSentData(null);

      const stillActive = await this.wait(AUTH_CONFIG.FEEDBACK_DELAYS.WELCOME_DISPLAY);
      if (!stillActive) return;

      this.callbacks.onSuccess?.({ 
        id: 'magic-link-user', 
        name: 'User',
        email,
      });
      this.handleCloseAll();
    });
  }

  handleWelcomeContinue() {
    this.cancelCurrentFlow();
    this.callbacks.onSuccess?.({ 
      id: 'temp-user-id', // Will be updated when real user data is available
      name: this.state.newUserName,
      email: '' // Will be populated from auth context
    });
    this.handleCloseAll();
  }

  // Handle error modal actions
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
        // Go back to sign in by default
        this.actions.setCurrentModal("signin");
        this.actions.setAuthErrorInfo(null);
        break;
      
      case "CONTACT_SUPPORT":
        // Close modal and let parent handle navigation
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

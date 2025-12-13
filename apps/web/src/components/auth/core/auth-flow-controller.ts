/**
 * Auth Flow Controller - Business Logic Coordinator
 * 
 * Coordinates authentication flows using handlers and state management
 * Pure business logic without direct UI dependencies
 */

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

export class AuthFlowController {
  constructor(
    private state: AuthState,
    private actions: AuthActions,
    private callbacks: AuthCallbacks = {}
  ) {}

  // Sign In Flows
  async handleSignIn(email: string, password: string) {
    // Immediately show feedback modal
    this.actions.setSignInSuccess(false);
    this.actions.setCurrentModal("signin-feedback");
    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await signInWithEmail(email, password);

    if (result.success) {
      // Show sign in feedback modal immediately
      this.actions.setSignInSuccess(true);
      this.actions.setLoading(false);
      this.actions.setCurrentModal("signin-feedback");
      
      // Auto-close and trigger callback after showing success state
      // Delay set to show welcome state for approximately 1 second
      setTimeout(() => {
        this.callbacks.onSuccess?.(result.user);
        this.handleCloseAll();
      }, 1000);
    } else {
      // Error state
      this.actions.setSignInSuccess(false);
      this.actions.setLoading(false);
      this.actions.setError(result.error || "Sign in failed");
      
      // Return to sign-in modal after showing error
      setTimeout(() => {
        this.actions.setCurrentModal("signin");
        this.actions.setError(null);
      }, 2000);
    }
  }

  async handleGoogleSignIn() {
    // Show Google redirect modal
    this.actions.setCurrentModal("google-redirect");
    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await signInWithGoogle();

    if (result.success) {
      // Show success feedback
      this.actions.setSignInSuccess(true);
      this.actions.setCurrentModal("signin-feedback");
      this.actions.setLoading(false);
      
      // Auto-close and trigger callback after showing success state
      setTimeout(() => {
        this.callbacks.onSuccess?.(result.user);
        this.handleCloseAll();
      }, 1000);
    } else {
      // Error state
      this.actions.setLoading(false);
      this.actions.setError(result.error || "Google sign in failed");
      
      setTimeout(() => {
        this.actions.setCurrentModal("signin");
        this.actions.setError(null);
      }, 2000);
    }
  }

  // Sign Up Flows
  async handleSignUp(name: string, email: string, password: string, confirmPassword: string) {
    // Validation
    if (password !== confirmPassword) {
      this.actions.setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      this.actions.setError("Password must be at least 8 characters long");
      return;
    }

    // Start loading
    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await signUpWithEmail(name, email, password);

    if (result.success) {
      // Show email sent modal immediately for verification
      this.actions.setNewUserName(name);
      this.actions.setIsNewUser(true);
      this.actions.setLoading(false);
      this.actions.setEmailSentData({ email, type: "verification" });
      this.actions.setCurrentModal("email-sent");
    } else {
      // Error state - stay on sign up modal
      this.actions.setLoading(false);
      this.actions.setError(result.error || "Sign up failed");
    }
  }

  async handleGoogleSignUp() {
    // Show Google redirect modal
    this.actions.setCurrentModal("google-redirect");
    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await signUpWithGoogle();

    if (result.success) {
      // Show signup feedback first
      const userName = result.user?.name || "New User";
      this.actions.setNewUserName(userName);
      this.actions.setIsNewUser(true);
      this.actions.setSignUpSuccess(true);
      this.actions.setCurrentModal("signup-feedback");
      this.actions.setLoading(false);
      
      // Then show welcome modal
      setTimeout(() => {
        this.actions.setCurrentModal("welcome");
      }, 3000);
    } else {
      // Error state
      this.actions.setLoading(false);
      this.actions.setError(result.error || "Google sign up failed");
      
      setTimeout(() => {
        this.actions.setCurrentModal("signup");
        this.actions.setError(null);
      }, 2000);
    }
  }

  // Other Auth Flows
  async handleForgotPassword(email: string) {
    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await requestPasswordReset(email);

    if (result.success) {
      this.actions.setEmailSentData({ email, type: "reset" });
      this.actions.setCurrentModal("email-sent");
    } else {
      // Show generic feedback modal with error
      this.actions.setFeedbackData({
        title: "Reset Failed",
        message: result.error || "Failed to send reset email",
        type: "error"
      });
      this.actions.setCurrentModal("feedback");
    }

    this.actions.setLoading(false);
  }

  async handleMagicLink(email: string) {
    this.actions.setLoading(true);
    this.actions.setError(null);

    const result = await sendMagicLink(email);

    if (result.success) {
      this.actions.setEmailSentData({ email, type: "magic-link" });
      this.actions.setCurrentModal("email-sent");
    } else {
      // Show generic feedback modal with error
      this.actions.setFeedbackData({
        title: "Magic Link Failed",
        message: result.error || "Failed to send magic link",
        type: "error"
      });
      this.actions.setCurrentModal("feedback");
    }

    this.actions.setLoading(false);
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
    // Show sign up feedback modal with success state
    this.actions.setSignUpSuccess(true);
    this.actions.setCurrentModal("signup-feedback");
    this.actions.setEmailSentData(null);
    
    // After 3 seconds, show welcome modal
    setTimeout(() => {
      this.actions.setCurrentModal("welcome");
    }, 3000);
  }

  // Handle magic link sign in completion (called when user clicks magic link)  
  handleMagicLinkComplete() {
    // Show sign in feedback modal with success state (3 second delay)
    this.actions.setSignInSuccess(true);
    this.actions.setCurrentModal("signin-feedback");
    this.actions.setEmailSentData(null);
    
    // After 3 seconds, close and trigger success callback
    setTimeout(() => {
      this.callbacks.onSuccess?.({ 
        id: 'magic-link-user', 
        name: 'User',
        email: this.state.emailSentData?.email || ''
      });
      this.handleCloseAll();
    }, 3000);
  }

  handleWelcomeContinue() {
    this.callbacks.onSuccess?.({ 
      id: 'temp-user-id', // Will be updated when real user data is available
      name: this.state.newUserName,
      email: '' // Will be populated from auth context
    });
    this.handleCloseAll();
  }

  handleCloseAll() {
    this.actions.resetState();
    this.callbacks.onClose?.();
  }
}
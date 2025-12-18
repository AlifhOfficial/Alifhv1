/**
 * Authentication Error Handling - Production
 * 
 * Centralized error mapping system for Better Auth integration.
 * Maps error codes to user-friendly messages with appropriate actions.
 * 
 * @module lib/auth/errors
 * @see {@link docs/Auth/AUTH_ERROR_HANDLING.md} for complete error flow documentation
 */

export type AuthErrorAction = "SIGN_IN" | "SIGN_UP" | "CONTACT_SUPPORT" | "RETRY" | "CLOSE";

export interface AuthErrorInfo {
  title: string;
  message: string;
  action?: AuthErrorAction;
  actionLabel?: string;
}

/** Better Auth error code to user-friendly content mapping */
export const AUTH_ERROR_MAP: Record<string, AuthErrorInfo> = {
  account_not_linked: {
    title: "Email Already in Use",
    message: "This email is already linked to a different sign-in method. Please try signing in with the provider you used before (Google/Apple), or use the same email method you originally used.",
    action: "SIGN_IN",
    actionLabel: "Go to Sign In",
  },
  
  account_already_linked: {
    title: "Account Already Linked",
    message: "This account is already linked to another provider. You cannot link it again.",
    action: "SIGN_IN",
    actionLabel: "Go to Sign In",
  },

  email_already_in_use: {
    title: "Email Already Registered",
    message: "An account with this email already exists. Please sign in instead, or use a different email address.",
    action: "SIGN_IN",
    actionLabel: "Go to Sign In",
  },

  invalid_callback: {
    title: "Sign-In Failed",
    message: "The sign-in callback was invalid or expired. Please try again.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  oauth_callback_error: {
    title: "Authentication Error",
    message: "There was a problem during the authentication process. Please try signing in again.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  state_mismatch: {
    title: "Security Check Failed",
    message: "The authentication state doesn't match. This can happen if you took too long to sign in. Please try again.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  session_expired: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again to continue.",
    action: "SIGN_IN",
    actionLabel: "Sign In Again",
  },

  invalid_session: {
    title: "Invalid Session",
    message: "Your session is no longer valid. Please sign in again.",
    action: "SIGN_IN",
    actionLabel: "Sign In Again",
  },

  invalid_verification_token: {
    title: "Invalid Verification Link",
    message: "This verification link is invalid or has expired. Please request a new verification email.",
    action: "SIGN_UP",
    actionLabel: "Request New Link",
  },

  verification_token_expired: {
    title: "Verification Link Expired",
    message: "Your verification link has expired. Please request a new one.",
    action: "SIGN_UP",
    actionLabel: "Request New Link",
  },

  email_not_verified: {
    title: "Email Not Verified",
    message: "Please verify your email address before signing in. Check your inbox for the verification link.",
    action: "CLOSE",
    actionLabel: "I'll Check My Email",
  },

  invalid_reset_token: {
    title: "Invalid Reset Link",
    message: "This password reset link is invalid or has expired. Please request a new one.",
    action: "SIGN_IN",
    actionLabel: "Go to Sign In",
  },

  reset_token_expired: {
    title: "Reset Link Expired",
    message: "Your password reset link has expired. Please request a new one.",
    action: "SIGN_IN",
    actionLabel: "Go to Sign In",
  },
  invalid_credentials: {
    title: "Invalid Credentials",
    message: "The email or password you entered is incorrect. Please try again.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  invalid_password: {
    title: "Incorrect Password",
    message: "The password you entered is incorrect. Please try again or reset your password.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  weak_password: {
    title: "Weak Password",
    message: "Your password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  // User errors
  user_not_found: {
    title: "Account Not Found",
    message: "No account exists with this email address. Please sign up instead.",
    action: "SIGN_UP",
    actionLabel: "Create Account",
  },

  user_banned: {
    title: "Account Suspended",
    message: "Your account has been suspended. Please contact support for more information.",
    action: "CONTACT_SUPPORT",
    actionLabel: "Contact Support",
  },

  too_many_requests: {
    title: "Too Many Attempts",
    message: "You've made too many attempts. Please wait a few minutes and try again.",
    action: "CLOSE",
    actionLabel: "Okay",
  },

  rate_limit_exceeded: {
    title: "Rate Limit Exceeded",
    message: "You've exceeded the rate limit. Please wait a moment before trying again.",
    action: "CLOSE",
    actionLabel: "Okay",
  },

  unknown_error: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    action: "CONTACT_SUPPORT",
    actionLabel: "Contact Support",
  },

  server_error: {
    title: "Server Error",
    message: "We're experiencing technical difficulties. Please try again in a few moments.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  network_error: {
    title: "Connection Error",
    message: "Unable to connect to the server. Please check your internet connection and try again.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  invalid_magic_link: {
    title: "Invalid Magic Link",
    message: "This magic link is invalid or has expired. Please request a new one.",
    action: "RETRY",
    actionLabel: "Request New Link",
  },

  magic_link_expired: {
    title: "Magic Link Expired",
    message: "Your magic link has expired. Please request a new one to sign in.",
    action: "RETRY",
    actionLabel: "Request New Link",
  },

  provider_error: {
    title: "Provider Error",
    message: "There was an error with the authentication provider. Please try again or use a different sign-in method.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  google_error: {
    title: "Google Sign-In Error",
    message: "There was a problem signing in with Google. Please try again or use email instead.",
    action: "RETRY",
    actionLabel: "Try Again",
  },

  request_timeout: {
    title: "Request Timeout",
    message: "The request took too long to complete. Please try again.",
    action: "RETRY",
    actionLabel: "Try Again",
  },
};

/**
 * Maps error codes/messages to user-friendly error information
 * Handles exact matches, partial matches, and pattern detection
 * 
 * @param errorCodeOrMessage - Error code or message from Better Auth
 * @returns User-friendly error information with title, message, and action
 */
export function getAuthErrorInfo(errorCodeOrMessage: string | null | undefined): AuthErrorInfo {
  if (!errorCodeOrMessage) {
    return AUTH_ERROR_MAP.unknown_error;
  }

  const errorCode = errorCodeOrMessage.toLowerCase().replace(/\s+/g, "_");
  
  if (AUTH_ERROR_MAP[errorCode]) {
    return AUTH_ERROR_MAP[errorCode];
  }

  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (errorCode.includes(key) || key.includes(errorCode)) {
      return value;
    }
  }

  const msg = errorCodeOrMessage.toLowerCase();
  if (msg.includes("already") && msg.includes("linked")) return AUTH_ERROR_MAP.account_already_linked;
  if (msg.includes("already") && msg.includes("use")) return AUTH_ERROR_MAP.email_already_in_use;
  if (msg.includes("expired")) return AUTH_ERROR_MAP.session_expired;
  if (msg.includes("invalid") && msg.includes("credential")) return AUTH_ERROR_MAP.invalid_credentials;
  if (msg.includes("not found")) return AUTH_ERROR_MAP.user_not_found;
  if (msg.includes("rate limit")) return AUTH_ERROR_MAP.rate_limit_exceeded;

  return {
    title: "Authentication Error",
    message: errorCodeOrMessage,
    action: "RETRY",
    actionLabel: "Try Again",
  };
}

/**
 * Extracts error message from Better Auth response object
 * 
 * @param error - Error object from Better Auth
 * @returns Extracted error message or null
 */
export function parseAuthError(error: any): string | null {
  if (!error) return null;
  if (typeof error === 'object') {
    return error.message || error.error || error.code || 'Unknown error';
  }
  return String(error);
}
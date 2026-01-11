/**
 * Auth State Manager - Pure State Management
 * 
 * Manages authentication state and modal flow without UI concerns
 * Provides clean separation between state and UI components
 */

import { useState } from "react";
import { AuthUser, AuthResult, EmailData } from "./auth-handlers";
import { AuthErrorInfo } from "@/lib/auth/errors";

export type AuthModalType = 
  | "signin" 
  | "signup" 
  | "forgot-password" 
  | "magic-link" 
  | "email-sent"
  | "otp-verification"
  | "signin-feedback"
  | "auth-error"
  | "feedback"
  | null;

export interface OtpData {
  email: string;
  type: "email-verification" | "sign-in" | "forget-password";
  /** Password for auto sign-in after email verification */
  password?: string;
}

export interface AuthState {
  currentModal: AuthModalType;
  isLoading: boolean;
  error: string | null;
  emailSentData: EmailData | null;
  otpData: OtpData | null;
  signInSuccess: boolean;
  // Auth error modal data
  authErrorInfo: AuthErrorInfo | null;
  // Generic feedback modal data
  feedbackData: {
    title?: string;
    message?: string;
    type?: 'success' | 'error' | 'info';
  } | null;
}

export interface AuthActions {
  setCurrentModal: (modal: AuthModalType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEmailSentData: (data: EmailData | null) => void;
  setOtpData: (data: OtpData | null) => void;
  setSignInSuccess: (success: boolean) => void;
  setAuthErrorInfo: (info: AuthErrorInfo | null) => void;
  setFeedbackData: (data: { title?: string; message?: string; type?: 'success' | 'error' | 'info' } | null) => void;
  resetState: () => void;
}

export interface AuthCallbacks {
  onSuccess?: (user?: AuthUser) => void;
  onClose?: () => void;
}

const initialState: AuthState = {
  currentModal: null,
  isLoading: false,
  error: null,
  emailSentData: null,
  otpData: null,
  signInSuccess: false,
  authErrorInfo: null,
  feedbackData: null,
};

export function useAuthState(
  initialModal: AuthModalType = null,
  externalCurrentModal?: AuthModalType,
  onModalChange?: (modal: AuthModalType) => void
) {
  const [internalState, setInternalState] = useState<AuthState>({
    ...initialState,
    currentModal: initialModal,
  });

  // Use external control if provided, otherwise use internal state
  const currentModal = externalCurrentModal !== undefined ? externalCurrentModal : internalState.currentModal;
  const setCurrentModal = onModalChange || ((modal: AuthModalType) => {
    setInternalState(prev => ({ ...prev, currentModal: modal }));
  });

  const actions: AuthActions = {
    setCurrentModal,
    setLoading: (isLoading: boolean) => {
      setInternalState(prev => ({ ...prev, isLoading }));
    },
    setError: (error: string | null) => {
      setInternalState(prev => ({ ...prev, error }));
    },
    setEmailSentData: (emailSentData: EmailData | null) => {
      setInternalState(prev => ({ ...prev, emailSentData }));
    },
    setOtpData: (otpData: OtpData | null) => {
      setInternalState(prev => ({ ...prev, otpData }));
    },
    setSignInSuccess: (signInSuccess: boolean) => {
      setInternalState(prev => ({ ...prev, signInSuccess }));
    },
    setAuthErrorInfo: (authErrorInfo: AuthErrorInfo | null) => {
      setInternalState(prev => ({ ...prev, authErrorInfo }));
    },
    setFeedbackData: (feedbackData: { title?: string; message?: string; type?: 'success' | 'error' | 'info' } | null) => {
      setInternalState(prev => ({ ...prev, feedbackData }));
    },
    resetState: () => {
      // Reset internal state
      setInternalState({ ...initialState, currentModal: null });
      // Also properly close external modal if controlled externally
      setCurrentModal(null);
    },
  };

  const state: AuthState = {
    currentModal,
    isLoading: internalState.isLoading,
    error: internalState.error,
    emailSentData: internalState.emailSentData,
    otpData: internalState.otpData,
    signInSuccess: internalState.signInSuccess,
    authErrorInfo: internalState.authErrorInfo,
    feedbackData: internalState.feedbackData,
  };

  return { state, actions };
}
/**
 * Auth State Manager - Pure State Management
 * 
 * Manages authentication state and modal flow without UI concerns
 * Provides clean separation between state and UI components
 */

import { useState } from "react";
import { AuthUser, AuthResult, EmailData } from "./auth-handlers";

export type AuthModalType = 
  | "signin" 
  | "signup" 
  | "forgot-password" 
  | "magic-link" 
  | "email-sent"
  | "signin-feedback"
  | "signup-feedback" 
  | "welcome"
  | "google-redirect"
  | null;

export interface AuthState {
  currentModal: AuthModalType;
  isLoading: boolean;
  error: string | null;
  emailSentData: EmailData | null;
  signInSuccess: boolean;
  signUpSuccess: boolean;
  newUserName: string;
  isNewUser: boolean;
}

export interface AuthActions {
  setCurrentModal: (modal: AuthModalType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEmailSentData: (data: EmailData | null) => void;
  setSignInSuccess: (success: boolean) => void;
  setSignUpSuccess: (success: boolean) => void;
  setNewUserName: (name: string) => void;
  setIsNewUser: (isNew: boolean) => void;
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
  signInSuccess: false,
  signUpSuccess: false,
  newUserName: "",
  isNewUser: false,
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
    setSignInSuccess: (signInSuccess: boolean) => {
      setInternalState(prev => ({ ...prev, signInSuccess }));
    },
    setSignUpSuccess: (signUpSuccess: boolean) => {
      setInternalState(prev => ({ ...prev, signUpSuccess }));
    },
    setNewUserName: (newUserName: string) => {
      setInternalState(prev => ({ ...prev, newUserName }));
    },
    setIsNewUser: (isNewUser: boolean) => {
      setInternalState(prev => ({ ...prev, isNewUser }));
    },
    resetState: () => {
      setInternalState({ ...initialState, currentModal: null });
    },
  };

  const state: AuthState = {
    currentModal,
    isLoading: internalState.isLoading,
    error: internalState.error,
    emailSentData: internalState.emailSentData,
    signInSuccess: internalState.signInSuccess,
    signUpSuccess: internalState.signUpSuccess,
    newUserName: internalState.newUserName,
    isNewUser: internalState.isNewUser,
  };

  return { state, actions };
}
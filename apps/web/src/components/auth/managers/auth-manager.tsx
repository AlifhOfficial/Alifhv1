/**
 * Auth Manager - Simplified Orchestrator
 * 
 * Clean orchestrator for authentication modals
 * Simplified sign-up flow - no welcome modal, Google sign-up = sign-in
 * Google auth uses popup window for better UX
 */

"use client";

import { SignInModal } from "../modals/signin-modal";
import { SignUpModal } from "../modals/signup-modal";
import { ForgotPasswordModal } from "../modals/forgot-password-modal";
import { MagicLinkModal } from "../modals/magic-link-modal";
import { EmailSentModal } from "../feedback/email-sent-modal";
import { SignInFeedbackModal } from "../feedback/sign-in-feedback-modal";
import { FeedbackModal } from "../feedback/feedback-modal";
import { AuthErrorModal } from "../feedback/auth-error-modal";

import { useAuthState, AuthModalType } from "../core/auth-state";
import { AuthFlowController } from "../core/auth-flow-controller";
import { AuthUser } from "../core/auth-handlers";
import { AUTH_ERROR_MAP } from "@/lib/auth/errors";

interface AuthManagerProps {
  initialModal?: AuthModalType;
  currentModal?: AuthModalType;
  onModalChange?: (modal: AuthModalType) => void;
  onSuccess?: (user?: AuthUser) => void;
  onClose?: () => void;
}

export function AuthManager({
  initialModal = null,
  currentModal: externalCurrentModal,
  onModalChange,
  onSuccess,
  onClose,
}: AuthManagerProps) {
  const { state, actions } = useAuthState(initialModal, externalCurrentModal, onModalChange);
  
  const flowController = new AuthFlowController(state, actions, { onSuccess, onClose });

  return (
    <>
      {/* Sign In Modal */}
      <SignInModal
        open={state.currentModal === "signin"}
        onOpenChange={(open) => !open && flowController.handleCloseAll()}
        onSwitchToSignUp={() => actions.setCurrentModal("signup")}
        onSwitchToForgotPassword={() => actions.setCurrentModal("forgot-password")}
        onSwitchToMagicLink={() => actions.setCurrentModal("magic-link")}
        onSubmit={(email, password) => flowController.handleSignIn(email, password)}
        onGoogleSignIn={() => flowController.handleGoogleSignIn()}
        isLoading={state.isLoading}
        error={state.error}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        open={state.currentModal === "signup"}
        onOpenChange={(open) => !open && flowController.handleCloseAll()}
        onSwitchToSignIn={() => actions.setCurrentModal("signin")}
        onSubmit={(name, email, password) => flowController.handleSignUp(name, email, password)}
        onGoogleSignUp={() => flowController.handleGoogleSignUp()}
        isLoading={state.isLoading}
        error={state.error}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={state.currentModal === "forgot-password"}
        onOpenChange={(open) => !open && flowController.handleCloseAll()}
        onBackToSignIn={() => actions.setCurrentModal("signin")}
        onSubmit={(email) => flowController.handleForgotPassword(email)}
        isLoading={state.isLoading}
        error={state.error}
        success={state.emailSentData?.type === "reset"}
        email={state.emailSentData?.email}
      />

      {/* Magic Link Modal */}
      <MagicLinkModal
        open={state.currentModal === "magic-link"}
        onOpenChange={(open) => !open && flowController.handleCloseAll()}
        onBackToSignIn={() => actions.setCurrentModal("signin")}
        onSubmit={(email) => flowController.handleMagicLink(email)}
        isLoading={state.isLoading}
        error={state.error}
        success={state.emailSentData?.type === "magic-link"}
        email={state.emailSentData?.email}
      />

      {/* Email Sent Modal */}
      <EmailSentModal
        open={state.currentModal === "email-sent"}
        onClose={() => flowController.handleEmailSentClose()}
        email={state.emailSentData?.email || ""}
        type={state.emailSentData?.type || "verification"}
        onResend={async () => await flowController.handleResendEmail()}
      />

      {/* Sign In Feedback Modal */}
      <SignInFeedbackModal
        open={state.currentModal === "signin-feedback"}
        success={state.signInSuccess}
        isLoading={state.isLoading}
        error={state.error}
      />

      {/* Generic Feedback Modal */}
      <FeedbackModal
        open={state.currentModal === "feedback"}
        onClose={() => flowController.handleCloseAll()}
        title={state.feedbackData?.title}
        message={state.feedbackData?.message}
        type={state.feedbackData?.type}
        isLoading={state.isLoading}
        error={state.feedbackData?.type === 'error' ? state.feedbackData.message : null}
        success={state.feedbackData?.type === 'success'}
      />

      {/* Auth Error Modal */}
      <AuthErrorModal
        open={state.currentModal === "auth-error"}
        onClose={() => flowController.handleCloseAll()}
        errorInfo={state.authErrorInfo || AUTH_ERROR_MAP.unknown_error}
        onAction={(action) => flowController.handleErrorAction(action)}
      />
    </>
  );
}

// Export types for external use
export type { AuthModalType };
export type { AuthUser };

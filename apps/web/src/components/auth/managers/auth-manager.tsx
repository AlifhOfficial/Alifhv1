/**
 * Auth Manager - Modular Orchestrator
 * 
 * Clean orchestrator that combines state management, flow control, and UI components
 * Follows props-based architecture with clear separation of concerns
 */

"use client";

import { SignInModal } from "../modals/signin-modal";
import { SignUpModal } from "../modals/signup-modal";
import { ForgotPasswordModal } from "../modals/forgot-password-modal";
import { MagicLinkModal } from "../modals/magic-link-modal";
import { EmailSentModal } from "../feedback/email-sent-modal";
import { SignInFeedbackModal } from "../feedback/sign-in-feedback-modal";
import { SignUpFeedbackModal } from "../feedback/sign-up-feedback-modal";
import { WelcomeModal } from "../feedback/welcome-modal";
import { GoogleRedirectModal } from "../feedback/google-redirect-modal";

import { useAuthState, AuthModalType } from "../core/auth-state";
import { AuthFlowController } from "../core/auth-flow-controller";
import { AuthUser } from "../core/auth-handlers";

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
  
  // Create flow controller instance
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
        onSubmit={(name, email, password, confirmPassword) => 
          flowController.handleSignUp(name, email, password, confirmPassword)
        }
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

      {/* Sign Up Feedback Modal */}
      <SignUpFeedbackModal
        open={state.currentModal === "signup-feedback"}
        success={state.signUpSuccess}
        isLoading={state.isLoading}
        error={state.error}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        open={state.currentModal === "welcome"}
        userName={state.newUserName}
        onContinue={() => flowController.handleWelcomeContinue()}
      />

      {/* Google Redirect Modal */}
      <GoogleRedirectModal
        open={state.currentModal === "google-redirect"}
        onClose={() => actions.setCurrentModal("signin")}
      />
    </>
  );
}

// Export types for external use
export type { AuthModalType };
export type { AuthUser };
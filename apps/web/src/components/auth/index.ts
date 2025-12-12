// Auth Form Modals
export { SignInModal } from './modals/signin-modal';
export { SignUpModal } from './modals/signup-modal';
export { ForgotPasswordModal } from './modals/forgot-password-modal';
export { MagicLinkModal } from './modals/magic-link-modal';

// Feedback & Status Modals
export { EmailSentModal } from './feedback/email-sent-modal';
export { SignInFeedbackModal } from './feedback/sign-in-feedback-modal';
export { SignUpFeedbackModal } from './feedback/sign-up-feedback-modal';
export { WelcomeModal } from './feedback/welcome-modal';
export { GoogleRedirectModal } from './feedback/google-redirect-modal';
export { FeedbackModal } from './feedback/feedback-modal';

// Auth Manager (Primary)
export { AuthManager } from './managers/auth-manager';
export type { AuthModalType, AuthUser } from './managers/auth-manager';

// Core Business Logic
export { AuthFlowController } from './core/auth-flow-controller';
export { useAuthState } from './core/auth-state';
export * from './core/auth-handlers';
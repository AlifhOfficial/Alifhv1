/**
 * Showcase Page - Alifh Modal Demonstrations
 * 
 * Development page to preview all authentication modals
 * Clean interface to test modal states and interactions
 */

"use client";

import { useState, useEffect } from "react";
import { 
  SignInFeedbackModal, 
  SignUpFeedbackModal, 
  WelcomeModal,
  MagicLinkModal,
  ForgotPasswordModal,
  EmailSentModal,
} from "@/components/auth";
import { getSentEmails, clearSentEmails, emailService } from "@/lib/email";

export default function ShowcasePage() {
  // Modal states
  const [showSignInLoading, setShowSignInLoading] = useState(false);
  const [showSignInSuccess, setShowSignInSuccess] = useState(false);
  const [showSignUpLoading, setShowSignUpLoading] = useState(false);
  const [showSignUpSuccess, setShowSignUpSuccess] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [emailSentType, setEmailSentType] = useState<'verification' | 'reset' | 'magic-link'>('verification');
  
  // Email preview states
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  // Load sent emails on mount
  useEffect(() => {
    refreshEmailLog();
  }, []);

  const handleShowcase = (modalType: string) => {
    // Reset all modals first
    closeAllModals();

    // Show the requested modal
    switch (modalType) {
      case 'signInLoading':
        setShowSignInLoading(true);
        break;
      case 'signInSuccess':
        setShowSignInSuccess(true);
        break;
      case 'signUpLoading':
        setShowSignUpLoading(true);
        break;
      case 'signUpSuccess':
        setShowSignUpSuccess(true);
        break;
      case 'welcome':
        setShowWelcome(true);
        break;
      case 'magicLink':
        setShowMagicLink(true);
        break;
      case 'forgotPassword':
        setShowForgotPassword(true);
        break;
      case 'emailSentVerification':
        setEmailSentType('verification');
        setShowEmailSent(true);
        break;
      case 'emailSentReset':
        setEmailSentType('reset');
        setShowEmailSent(true);
        break;
      case 'emailSentMagic':
        setEmailSentType('magic-link');
        setShowEmailSent(true);
        break;
    }
  };

  const closeAllModals = () => {
    setShowSignInLoading(false);
    setShowSignInSuccess(false);
    setShowSignUpLoading(false);
    setShowSignUpSuccess(false);
    setShowWelcome(false);
    setShowMagicLink(false);
    setShowForgotPassword(false);
    setShowEmailSent(false);
  };

  const handleMockEmailAction = async (email: string) => {
    // Mock email sending with actual email service
    const mockUser = { name: 'Ahmed Khaled', email };
    const mockUrl = `http://localhost:3000/verify?token=mock_token_${Date.now()}`;
    const mockToken = `mock_token_${Date.now()}`;
    
    try {
      await emailService.sendVerificationEmail({
        user: mockUser,
        url: mockUrl,
        token: mockToken,
      });
      
      // Refresh email log to show the new email
      setTimeout(refreshEmailLog, 100);
    } catch (error) {
      console.error('Mock email failed:', error);
    }
  };

  const handleMockPasswordReset = async (email: string) => {
    const mockUser = { name: 'Ahmed Khaled', email };
    const mockUrl = `http://localhost:3000/reset-password?token=mock_token_${Date.now()}`;
    const mockToken = `mock_token_${Date.now()}`;
    
    try {
      await emailService.sendPasswordReset({
        user: mockUser,
        url: mockUrl,
        token: mockToken,
      });
      
      setTimeout(refreshEmailLog, 100);
    } catch (error) {
      console.error('Mock email failed:', error);
    }
  };

  const handleMockMagicLink = async (email: string) => {
    const mockUser = { name: 'Ahmed Khaled', email };
    const mockUrl = `http://localhost:3000/auth/magic?token=mock_token_${Date.now()}`;
    const mockToken = `mock_token_${Date.now()}`;
    
    try {
      await emailService.sendMagicLink({
        user: mockUser,
        url: mockUrl,
        token: mockToken,
      });
      
      setTimeout(refreshEmailLog, 100);
    } catch (error) {
      console.error('Mock email failed:', error);
    }
  };

  const handleResendEmail = async () => {
    // Mock resend
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Mock email resend');
  };

  const refreshEmailLog = () => {
    setSentEmails(getSentEmails());
  };

  const clearEmailLog = () => {
    clearSentEmails();
    setSentEmails([]);
    setSelectedEmail(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Alifh Authentication Showcase
          </h1>
          <p className="text-muted-foreground">
            Preview all authentication modals and email designs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Modals */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Authentication Modals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sign In Feedback */}
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Sign In Feedback</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleShowcase('signInLoading')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    Loading State
                  </button>
                  <button
                    onClick={() => handleShowcase('signInSuccess')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    Success State
                  </button>
                </div>
              </div>

              {/* Sign Up Feedback */}
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Sign Up Feedback</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleShowcase('signUpLoading')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    "Setting you all up"
                  </button>
                  <button
                    onClick={() => handleShowcase('signUpSuccess')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    Success State
                  </button>
                </div>
              </div>

              {/* Welcome Modal */}
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Welcome Experience</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleShowcase('welcome')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    Welcome Modal
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Premium onboarding experience
                  </p>
                </div>
              </div>

              {/* Magic Link Modal */}
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Magic Link</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleShowcase('magicLink')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    Magic Link Request
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Passwordless authentication
                  </p>
                </div>
              </div>

              {/* Forgot Password Modal */}
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Password Reset</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleShowcase('forgotPassword')}
                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors"
                  >
                    Forgot Password
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Request password reset
                  </p>
                </div>
              </div>

              {/* Email Sent Modals */}
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Email Sent States</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleShowcase('emailSentVerification')}
                    className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-lg transition-colors"
                  >
                    Email Verification Sent
                  </button>
                  <button
                    onClick={() => handleShowcase('emailSentReset')}
                    className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-lg transition-colors"
                  >
                    Password Reset Sent
                  </button>
                  <button
                    onClick={() => handleShowcase('emailSentMagic')}
                    className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-lg transition-colors"
                  >
                    Magic Link Sent
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="text-center">
              <button
                onClick={closeAllModals}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Close All Modals
              </button>
            </div>
          </div>

          {/* Right Column - Email Preview */}
          <div className="space-y-6">
            
            {/* Email Log Controls */}
            <div className="bg-card border border-border/40 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Email Testing</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleMockEmailAction('test@example.com')}
                  className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-sm rounded-lg transition-colors border border-blue-500/20"
                >
                  Send Verification Email
                </button>
                <button
                  onClick={() => handleMockPasswordReset('test@example.com')}
                  className="w-full px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-sm rounded-lg transition-colors border border-orange-500/20"
                >
                  Send Password Reset
                </button>
                <button
                  onClick={() => handleMockMagicLink('test@example.com')}
                  className="w-full px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-sm rounded-lg transition-colors border border-purple-500/20"
                >
                  Send Magic Link
                </button>
              </div>
            </div>

            {/* Email Log Controls */}
            <div className="bg-card border border-border/40 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Email Log</h3>
              <div className="space-y-3">
                <button
                  onClick={refreshEmailLog}
                  className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 text-sm rounded-lg transition-colors border border-green-500/20"
                >
                  Refresh ({sentEmails.length} emails)
                </button>
                <button
                  onClick={clearEmailLog}
                  className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 text-sm rounded-lg transition-colors border border-red-500/20"
                >
                  Clear All Emails
                </button>
              </div>
            </div>

            {/* Email List */}
            {sentEmails.length > 0 && (
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Sent Emails</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sentEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedEmail?.id === email.id 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-muted/30 border-border/20 hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground truncate">
                        {email.subject}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        To: {email.to}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(email.timestamp).toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email Preview */}
            {selectedEmail && (
              <div className="bg-card border border-border/40 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Email Preview</h3>
                <div className="space-y-4">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Subject:</div>
                    <div className="font-medium text-foreground">{selectedEmail.subject}</div>
                  </div>
                  <div className="border-t border-border/40 pt-4">
                    <div 
                      className="text-sm bg-muted/20 rounded-lg p-4 max-h-80 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-12 bg-muted/20 rounded-lg p-6 border border-border/20">
          <h3 className="font-semibold text-foreground mb-3">Alifh Design Philosophy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Modal Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Clean, minimal interfaces (max-w-sm consistency)</li>
                <li>• Subtle colors without bombardment</li>
                <li>• Premium feel with smooth animations</li>
                <li>• Clear hierarchy and spacing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Email Design</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Branded templates with Alifh identity</li>
                <li>• Professional typography and layout</li>
                <li>• Clear call-to-action buttons</li>
                <li>• Responsive design for all devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <SignInFeedbackModal
        open={showSignInLoading}
        success={false}
        onClose={() => setShowSignInLoading(false)}
      />

      <SignInFeedbackModal
        open={showSignInSuccess}
        success={true}
        onClose={() => setShowSignInSuccess(false)}
      />

      <SignUpFeedbackModal
        open={showSignUpLoading}
        success={false}
        onClose={() => setShowSignUpLoading(false)}
      />

      <SignUpFeedbackModal
        open={showSignUpSuccess}
        success={true}
        onClose={() => setShowSignUpSuccess(false)}
      />

      <WelcomeModal
        open={showWelcome}
        userName="Ahmed"
        onContinue={() => setShowWelcome(false)}
      />

      <MagicLinkModal
        open={showMagicLink}
        onOpenChange={(open) => !open && setShowMagicLink(false)}
        onBackToSignIn={() => setShowMagicLink(false)}
        onSubmit={handleMockMagicLink}
      />

      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={(open) => !open && setShowForgotPassword(false)}
        onBackToSignIn={() => setShowForgotPassword(false)}
        onSubmit={handleMockPasswordReset}
      />

      <EmailSentModal
        open={showEmailSent}
        onClose={() => setShowEmailSent(false)}
        onResend={handleResendEmail}
        email="user@example.com"
        type={emailSentType}
      />
    </div>
  );
}
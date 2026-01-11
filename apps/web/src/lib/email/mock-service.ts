/**
 * Mock Email Service - Development Only
 * 
 * Simulates email sending for development/testing
 * Logs emails to console instead of actually sending
 */

import type { EmailData } from './service';

// Mock email store for development
const sentEmails: Array<EmailData & { timestamp: Date; id: string }> = [];

/**
 * Mock email sending function
 */
export async function sendEmailMock(emailData: EmailData) {
  const mockEmail = {
    ...emailData,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };

  // Store in memory
  sentEmails.push(mockEmail);

  // Log to console for development
  console.log('\n📧 MOCK EMAIL SENT 📧');
  console.log('═══════════════════════════════════════');
  console.log(`To: ${emailData.to}`);
  console.log(`Subject: ${emailData.subject}`);
  console.log('───────────────────────────────────────');
  console.log('HTML Content:');
  console.log(emailData.html);
  if (emailData.text) {
    console.log('───────────────────────────────────────');
    console.log('Text Content:');
    console.log(emailData.text);
  }
  console.log('═══════════════════════════════════════\n');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    data: {
      id: mockEmail.id,
    },
    error: null,
  };
}

/**
 * Get all sent emails for development/testing
 */
export function getSentEmails() {
  return [...sentEmails];
}

/**
 * Clear sent emails store
 */
export function clearSentEmails() {
  sentEmails.length = 0;
}

/**
 * Mock Better Auth email helpers for development
 */
export const mockEmailService = {
  /**
   * Mock OTP verification email
   */
  sendVerificationOTP: async (data: { email: string; otp: string; type: "sign-in" | "email-verification" | "forget-password" }) => {
    const { email, otp, type } = data;
    const userName = email.split('@')[0];
    
    const typeMessages = {
      "sign-in": "sign in to your Alifh account",
      "email-verification": "verify your email address",
      "forget-password": "reset your password",
    };
    
    const action = typeMessages[type];
    
    await sendEmailMock({
      to: email,
      subject: `[MOCK] Your Alifh verification code: ${otp}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
          <h2>Your verification code</h2>
          <p>Hi ${userName},</p>
          <p>Use the following code to ${action}:</p>
          <div style="margin: 32px 0; text-align: center;">
            <div style="
              background: #f4f4f5;
              border-radius: 12px;
              padding: 24px 32px;
              display: inline-block;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #000;
            ">
              ${otp}
            </div>
          </div>
          <p style="color: #71717a; font-size: 14px;">This code expires in 10 minutes.</p>
          <p><strong>Mock Mode:</strong> This is a development email.</p>
          <p>Best regards,<br>The Alifh Team (Dev Mode)</p>
        </div>
      `,
      text: `[MOCK] Your Alifh verification code is: ${otp}. Use this code to ${action}. Expires in 10 minutes.`,
    });
  },

  /**
   * Mock email verification
   */
  sendVerificationEmail: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;

    const verificationUrl = new URL(url);
    const token = verificationUrl.searchParams.get("token");
    const callbackURL = verificationUrl.searchParams.get("callbackURL") || "/";
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const appVerifyUrl = new URL("/verify-email", appBaseUrl);
    if (token) {
      appVerifyUrl.searchParams.set("token", token);
    }
    if (callbackURL) {
      appVerifyUrl.searchParams.set("callbackURL", callbackURL);
    }

    const finalUrl = appVerifyUrl.toString();
    
    await sendEmailMock({
      to: user.email,
      subject: '[MOCK] Verify your Alifh account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
          <h2>Welcome to Alifh</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address to complete your account setup.</p>
          <div style="margin: 32px 0;">
            <a href="${finalUrl}" style="
              background: #000;
              color: #fff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
            ">
              Verify Email Address
            </a>
          </div>
          <p><strong>Mock Mode:</strong> This is a development email. Click the link to verify.</p>
          <p>Best regards,<br>The Alifh Team (Dev Mode)</p>
        </div>
      `,
      text: `[MOCK] Welcome to Alifh! Please verify your email: ${finalUrl}`,
    });
  },

  /**
   * Mock password reset
   */
  sendPasswordReset: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    
    await sendEmailMock({
      to: user.email,
      subject: '[MOCK] Reset your Alifh password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
          <h2>Reset your password</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password for your Alifh account.</p>
          <div style="margin: 32px 0;">
            <a href="${url}" style="
              background: #000;
              color: #fff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
            ">
              Reset Password
            </a>
          </div>
          <p><strong>Mock Mode:</strong> This is a development email. Link expires in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>The Alifh Team (Dev Mode)</p>
        </div>
      `,
      text: `[MOCK] Reset your Alifh password: ${url}`,
    });
  },

  /**
   * Mock magic link
   */
  sendMagicLink: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    
    await sendEmailMock({
      to: user.email,
      subject: '[MOCK] Sign in to Alifh',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
          <h2>Sign in to Alifh</h2>
          <p>Hi ${user.name},</p>
          <p>Click the link below to sign in to your Alifh account:</p>
          <div style="margin: 32px 0;">
            <a href="${url}" style="
              background: #000;
              color: #fff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
            ">
              Sign In to Alifh
            </a>
          </div>
          <p><strong>Mock Mode:</strong> This is a development email. Link expires in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>The Alifh Team (Dev Mode)</p>
        </div>
      `,
      text: `[MOCK] Sign in to Alifh: ${url}`,
    });
  },
};
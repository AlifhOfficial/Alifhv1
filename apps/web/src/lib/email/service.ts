/**
 * Email Service Layer
 * 
 * Centralized email sending with Resend integration
 * Rate limiting and error handling for production use
 * Clean abstraction for Better Auth integration
 */

import { Resend } from 'resend';
import { mockEmailService, sendEmailMock } from './mock-service';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Resend client only in production
const resend = !isDevelopment ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration
const EMAIL_CONFIG = {
  from: `${process.env.EMAIL_FROM_NAME || 'Alifh'} <${process.env.EMAIL_FROM || 'noreply@alifh.ae'}>`,
  domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Email types for Better Auth integration
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend service or mock in development
 */
export async function sendEmail(emailData: EmailData) {
  // Use mock service in development
  if (isDevelopment) {
    return await sendEmailMock(emailData);
  }

  // Use real Resend in production
  if (!resend) {
    throw new Error('Resend not initialized');
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    console.log(`📧 Email sent successfully to ${emailData.to}`);
    return result;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}

/**
 * Better Auth integration helpers
 */
export const emailService = isDevelopment ? mockEmailService : {
  /**
   * Send email verification
   */
  sendVerificationEmail: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify your Alifh account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
          <h2>Welcome to Alifh!</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address to complete your account setup.</p>
          <div style="margin: 32px 0;">
            <a href="${url}" style="
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
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <p>Best regards,<br>The Alifh Team</p>
        </div>
      `,
      text: `Welcome to Alifh! Please verify your email: ${url}`,
    });
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    
    await sendEmail({
      to: user.email,
      subject: 'Reset your Alifh password',
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
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>The Alifh Team</p>
        </div>
      `,
      text: `Reset your Alifh password: ${url}`,
    });
  },

  /**
   * Send magic link email
   */
  sendMagicLink: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    
    await sendEmail({
      to: user.email,
      subject: 'Sign in to Alifh',
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
          <p>This link will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>The Alifh Team</p>
        </div>
      `,
      text: `Sign in to Alifh: ${url}`,
    });
  },
};

// Environment status function
export const getEmailServiceStatus = () => ({
  provider: isDevelopment ? "Mock" : "Resend",
  isProduction: !isDevelopment,
  hasResendKey: !!process.env.RESEND_API_KEY,
  environment: process.env.NODE_ENV || "development",
});
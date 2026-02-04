/**
 * Email Service Layer
 * 
 * Centralized email sending with Resend integration
 * Clean, minimal email templates matching Revvup brand
 */

import { Resend } from 'resend';
import { mockEmailService, sendEmailMock } from './mock-service';

// Check if we're in development mode
// USE_REAL_EMAIL=true allows using production email in development
const isDevelopment = process.env.NODE_ENV === 'development';
const useRealEmail = process.env.USE_REAL_EMAIL === 'true';
const shouldUseMockEmail = isDevelopment && !useRealEmail;

// Initialize Resend client when needed (production or when USE_REAL_EMAIL=true)
const resend = !shouldUseMockEmail && process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

// Email configuration
const EMAIL_CONFIG = {
  from: `${process.env.EMAIL_FROM_NAME || 'Revvup'} <${process.env.EMAIL_FROM || 'noreply@revvup.ae'}>`,

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
 * Clean email template - White background, minimal design
 */
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Revvup</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFFFF;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
          
          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 32px;">
              <span style="font-size: 24px; font-weight: 700; color: #18181B; letter-spacing: -0.5px;">Revvup</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding-bottom: 32px;">
              ${content}
            </td>
          </tr>
          
          <!-- Sign off -->
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 14px; color: #71717A; line-height: 1.6;">
                Best regards,<br>
                <span style="color: #18181B; font-weight: 500;">Team Revvup</span>
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #E4E4E7; padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #A1A1AA;">
                © ${new Date().getFullYear()} AISH CAPITALS FZCO · Dubai, UAE
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * OTP code block
 */
const otpBlock = (code: string) => `
<table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
  <tr>
    <td align="center">
      <table cellspacing="0" cellpadding="0" border="0" style="background: #F4F4F5; border-radius: 8px;">
        <tr>
          <td style="padding: 16px 28px;">
            <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #18181B; font-family: monospace;">
              ${code}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

/**
 * Primary button (brand blue)
 */
const button = (label: string, url: string) => `
<table cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
  <tr>
    <td style="background: #3B82F6; border-radius: 6px;">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none;">
        ${label}
      </a>
    </td>
  </tr>
</table>
`;

/**
 * Send email using Resend service or mock in development
 */
export async function sendEmail(emailData: EmailData) {
  // Use mock service only in development when USE_REAL_EMAIL is not set
  if (shouldUseMockEmail) {
    return await sendEmailMock(emailData);
  }

  // Use real Resend in production or when USE_REAL_EMAIL=true
  if (!resend) {
    throw new Error('Resend not initialized - check RESEND_API_KEY environment variable');
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    console.log(`📧 Email sent to ${emailData.to}`);
    return result;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}

/**
 * Better Auth integration helpers
 */
export const emailService = shouldUseMockEmail ? mockEmailService : {
  /**
   * Send OTP verification email
   */
  sendVerificationOTP: async (data: { email: string; otp: string; type: "sign-in" | "email-verification" | "forget-password" }) => {
    const { email, otp, type } = data;
    
    const config = {
      "sign-in": "Use this code to sign in to your account.",
      "email-verification": "Use this code to verify your email address.",
      "forget-password": "Use this code to reset your password.",
    };
    
    const content = `
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181B; line-height: 1.6;">
        Your verification code is:
      </p>
      ${otpBlock(otp)}
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #71717A; line-height: 1.6;">
        ${config[type]}
      </p>
      <p style="margin: 0; font-size: 13px; color: #A1A1AA; line-height: 1.6;">
        This code expires in 10 minutes. If you didn't request this, please ignore this email.
      </p>
    `;
    
    await sendEmail({
      to: email,
      subject: `${otp} is your Revvup verification code`,
      html: emailTemplate(content),
      text: `Your Revvup verification code is: ${otp}. ${config[type]} This code expires in 10 minutes.`,
    });
  },

  /**
   * Send email verification link
   */
  sendVerificationEmail: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;

    const verificationUrl = new URL(url);
    const token = verificationUrl.searchParams.get("token");
    const callbackURL = verificationUrl.searchParams.get("callbackURL") || "/";
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const appVerifyUrl = new URL("/verify-email", appBaseUrl);
    if (token) appVerifyUrl.searchParams.set("token", token);
    if (callbackURL) appVerifyUrl.searchParams.set("callbackURL", callbackURL);

    const finalUrl = appVerifyUrl.toString();
    const name = user.name || 'there';
    
    const content = `
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181B; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717A; line-height: 1.6;">
        Thanks for signing up. Please verify your email to complete your account setup.
      </p>
      ${button('Verify Email', finalUrl)}
      <p style="margin: 0; font-size: 13px; color: #A1A1AA; line-height: 1.6;">
        If you didn't create an account, please ignore this email.
      </p>
    `;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: emailTemplate(content),
      text: `Hi ${name}, thanks for signing up. Please verify your email: ${finalUrl}`,
    });
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    const name = user.name || 'there';
    
    const content = `
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181B; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717A; line-height: 1.6;">
        We received a request to reset your password. Click below to choose a new one.
      </p>
      ${button('Reset Password', url)}
      <p style="margin: 0; font-size: 13px; color: #A1A1AA; line-height: 1.6;">
        This link expires in 1 hour. If you didn't request this, please ignore this email.
      </p>
    `;
    
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: emailTemplate(content),
      text: `Hi ${name}, reset your password here: ${url}. This link expires in 1 hour.`,
    });
  },

  /**
   * Send magic link email
   */
  sendMagicLink: async (data: { user: any; url: string; token: string }) => {
    const { user, url } = data;
    const name = user.name || 'there';
    
    const content = `
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181B; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717A; line-height: 1.6;">
        Click the button below to sign in. No password needed.
      </p>
      ${button('Sign In', url)}
      <p style="margin: 0; font-size: 13px; color: #A1A1AA; line-height: 1.6;">
        This link expires in 10 minutes. If you didn't request this, please ignore this email.
      </p>
    `;
    
    await sendEmail({
      to: user.email,
      subject: 'Sign in to Revvup',
      html: emailTemplate(content),
      text: `Hi ${name}, sign in here: ${url}. This link expires in 10 minutes.`,
    });
  },
};

// Environment status function
export const getEmailServiceStatus = () => ({
  provider: shouldUseMockEmail ? "Mock" : "Resend",
  isProduction: !isDevelopment,
  useRealEmail: useRealEmail,
  hasResendKey: !!process.env.RESEND_API_KEY,
  environment: process.env.NODE_ENV || "development",
});
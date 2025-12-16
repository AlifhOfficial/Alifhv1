/**
 * Twilio SMS Service
 * Handles phone verification via SMS OTP
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Missing Twilio credentials');
}

const client = twilio(accountSid, authToken);

export interface SendOTPResult {
  success: boolean;
  sid?: string;
  error?: string;
}

/**
 * Send OTP via Twilio SMS
 * @param phoneNumber - E.164 format phone number (e.g., +971501234567)
 * @param otp - 6-digit OTP code
 * @returns Result with success status and message SID
 */
export async function sendOTPViaTwilio(
  phoneNumber: string,
  otp: string
): Promise<SendOTPResult> {
  try {
    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +971501234567)');
    }

    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your Alifh verification code is: ${otp}. This code expires in 10 minutes.`,
      to: phoneNumber,
      from: '+18509197444', // Your Twilio phone number - update this with your actual number
    });

    return {
      success: true,
      sid: message.sid,
    };
  } catch (error) {
    console.error('[Twilio] Failed to send OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate OTP format
 */
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Validate phone number format (basic E.164 check)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number]
  // Example: +971501234567
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

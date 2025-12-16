/**
 * OTP Service Factory
 * Automatically uses dev or production OTP service based on environment
 */

import { SendOTPResult } from './twilio';

// Dynamic import based on environment
const isDev = process.env.NODE_ENV === 'development';

export async function sendOTP(phoneNumber: string, otp: string): Promise<SendOTPResult> {
  if (isDev) {
    const devOTP = await import('./dev-otp');
    return devOTP.sendOTPViaDev(phoneNumber, otp);
  } else {
    const twilioOTP = await import('./twilio');
    return twilioOTP.sendOTPViaTwilio(phoneNumber, otp);
  }
}

export async function generateOTP(): Promise<string> {
  if (isDev) {
    const devOTP = await import('./dev-otp');
    return devOTP.generateOTP();
  } else {
    const twilioOTP = await import('./twilio');
    return twilioOTP.generateOTP();
  }
}

export async function isValidOTP(otp: string): Promise<boolean> {
  if (isDev) {
    const devOTP = await import('./dev-otp');
    return devOTP.isValidOTP(otp);
  } else {
    const twilioOTP = await import('./twilio');
    return twilioOTP.isValidOTP(otp);
  }
}

export async function isValidPhoneNumber(phone: string): Promise<boolean> {
  if (isDev) {
    const devOTP = await import('./dev-otp');
    return devOTP.isValidPhoneNumber(phone);
  } else {
    const twilioOTP = await import('./twilio');
    return twilioOTP.isValidPhoneNumber(phone);
  }
}

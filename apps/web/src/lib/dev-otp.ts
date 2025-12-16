/**
 * Dev OTP Service
 * For development/testing - logs OTP to console instead of sending SMS
 */

export interface SendOTPResult {
  success: boolean;
  sid?: string;
  error?: string;
}

/**
 * Send OTP in development mode (logs to console)
 * @param phoneNumber - Phone number (any format accepted in dev)
 * @param otp - 6-digit OTP code
 * @returns Result with success status
 */
export async function sendOTPViaDev(
  phoneNumber: string,
  otp: string
): Promise<SendOTPResult> {
  try {
    // In development, just log the OTP
    console.log('\n='.repeat(60));
    console.log('🔐 PHONE VERIFICATION OTP (DEVELOPMENT MODE)');
    console.log('='.repeat(60));
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Expires: 10 minutes`);
    console.log('='.repeat(60) + '\n');

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      sid: `DEV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    console.error('[Dev OTP] Failed:', error);
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
 * Validate phone number format (lenient in dev mode)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // In dev mode, accept any phone number with at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

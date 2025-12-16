/**
 * Shared OTP Store
 * In production, replace this with Redis or a database table
 */

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
  phoneNumber?: string;
}

class OTPStore {
  private store = new Map<string, OTPData>();

  constructor() {
    // Clean up expired OTPs every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: OTPData): void {
    this.store.set(key, data);
  }

  get(key: string): OTPData | undefined {
    return this.store.get(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  // Get OTP key for user
  getOTPKey(userId: string): string {
    return `otp_${userId}`;
  }

  // Get rate limit key for user
  getRateLimitKey(userId: string): string {
    return `rate_${userId}`;
  }
}

// Export singleton instance
export const otpStore = new OTPStore();

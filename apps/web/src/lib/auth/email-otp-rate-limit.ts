import { AUTH_CONFIG } from '@/lib/auth/config';

const resendCooldowns = new Map<string, number>();
const resendHistory = new Map<string, number[]>();
const verifyAttempts = new Map<string, number>();
const verifyLockouts = new Map<string, number>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function cleanupExpiredResends(now: number) {
  for (const [key, expiresAt] of resendCooldowns.entries()) {
    if (expiresAt <= now) {
      resendCooldowns.delete(key);
    }
  }

  for (const [key, timestamps] of resendHistory.entries()) {
    const filtered = timestamps.filter((ts) => ts > now - 60 * 60 * 1000);
    if (filtered.length === 0) {
      resendHistory.delete(key);
    } else {
      resendHistory.set(key, filtered);
    }
  }
}

function cleanupExpiredLockouts(now: number) {
  for (const [key, expiresAt] of verifyLockouts.entries()) {
    if (expiresAt <= now) {
      verifyLockouts.delete(key);
    }
  }
}

export function getAuthRateLimitSource(headers: Headers): string | null {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || null;

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  return null;
}

function buildResendKey(email: string): string {
  return normalizeEmail(email);
}

export function getOtpResendStatus(email: string, _source: string | null) {
  const now = Date.now();
  cleanupExpiredResends(now);
  cleanupExpiredLockouts(now);

  const lockoutUntil = verifyLockouts.get(normalizeEmail(email));
  const lockoutRetryAfterMs = (lockoutUntil || 0) - now;
  if (lockoutRetryAfterMs > 0) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(lockoutRetryAfterMs / 1000),
    };
  }

  const key = buildResendKey(email);
  const cooldownUntil = resendCooldowns.get(key);
  const retryAfterMs = (cooldownUntil || 0) - now;

  if (retryAfterMs > 0) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      code: 'OTP_RESEND_COOLDOWN' as const,
    };
  }

  const hourlyHistory = resendHistory.get(key) || [];
  if (hourlyHistory.length >= AUTH_CONFIG.EMAIL_OTP.RESEND_MAX_REQUESTS_PER_HOUR) {
    const oldest = hourlyHistory[0];
    const hourlyRetryAfterMs = oldest + 60 * 60 * 1000 - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(hourlyRetryAfterMs / 1000),
      code: 'OTP_RESEND_HOURLY_LIMIT' as const,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    code: null,
  };
}

export function recordOtpResend(email: string, _source: string | null) {
  const now = Date.now();
  const key = buildResendKey(email);
  const cooldownMs = AUTH_CONFIG.EMAIL_OTP.RESEND_COOLDOWN_SECONDS * 1000;
  resendCooldowns.set(key, now + cooldownMs);

  const history = resendHistory.get(key) || [];
  const filtered = history.filter((ts) => ts > now - 60 * 60 * 1000);
  filtered.push(now);
  resendHistory.set(key, filtered);

  clearOtpVerifyAttempts(email);
}

export function getOtpVerifyStatus(email: string) {
  const now = Date.now();
  cleanupExpiredLockouts(now);

  const lockoutUntil = verifyLockouts.get(normalizeEmail(email));
  const lockoutRetryAfterMs = (lockoutUntil || 0) - now;
  if (lockoutRetryAfterMs > 0) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfterSeconds: Math.ceil(lockoutRetryAfterMs / 1000),
    };
  }

  const failedAttempts = verifyAttempts.get(normalizeEmail(email)) || 0;
  const attemptsRemaining = Math.max(0, AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS - failedAttempts);

  return {
    allowed: failedAttempts < AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS,
    attemptsRemaining,
    retryAfterSeconds: 0,
  };
}

export function recordFailedOtpVerifyAttempt(email: string) {
  const key = normalizeEmail(email);
  const nextCount = Math.min(
    AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS,
    (verifyAttempts.get(key) || 0) + 1
  );

  verifyAttempts.set(key, nextCount);

  if (nextCount >= AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS) {
    verifyLockouts.set(
      key,
      Date.now() + AUTH_CONFIG.EMAIL_OTP.LOCKOUT_SECONDS_AFTER_MAX_ATTEMPTS * 1000
    );
  }

  return {
    attemptsRemaining: Math.max(0, AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS - nextCount),
    blocked: nextCount >= AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS,
    retryAfterSeconds: nextCount >= AUTH_CONFIG.EMAIL_OTP.VERIFY_MAX_ATTEMPTS
      ? AUTH_CONFIG.EMAIL_OTP.LOCKOUT_SECONDS_AFTER_MAX_ATTEMPTS
      : 0,
  };
}

export function clearOtpVerifyAttempts(email: string) {
  const key = normalizeEmail(email);
  verifyAttempts.delete(key);
  verifyLockouts.delete(key);
}
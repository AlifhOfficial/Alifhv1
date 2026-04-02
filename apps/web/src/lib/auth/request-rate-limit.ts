import { AUTH_CONFIG } from '@/lib/auth/config';

const actionHistory = new Map<string, number[]>();
const actionCooldowns = new Map<string, number>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildKey(action: string, email: string, source: string | null): string {
  return `${action}:${normalizeEmail(email)}:${source || 'unknown'}`;
}

function cleanup(action: string, key: string, now: number, windowSeconds: number) {
  const timestamps = actionHistory.get(key) || [];
  const filtered = timestamps.filter((ts) => ts > now - windowSeconds * 1000);
  if (filtered.length === 0) {
    actionHistory.delete(key);
  } else {
    actionHistory.set(key, filtered);
  }

  const cooldownUntil = actionCooldowns.get(key);
  if (cooldownUntil && cooldownUntil <= now) {
    actionCooldowns.delete(key);
  }
}

export function getActionRateLimitStatus(
  action: 'password-reset' | 'magic-link',
  email: string,
  source: string | null
) {
  const now = Date.now();
  const config = action === 'password-reset' ? AUTH_CONFIG.PASSWORD_RESET : AUTH_CONFIG.MAGIC_LINK;
  const key = buildKey(action, email, source);

  cleanup(action, key, now, 60 * 60);

  const cooldownUntil = actionCooldowns.get(key);
  const cooldownRetryAfterMs = (cooldownUntil || 0) - now;
  if (cooldownRetryAfterMs > 0) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(cooldownRetryAfterMs / 1000),
      code: action === 'password-reset' ? 'PASSWORD_RESET_COOLDOWN' : 'MAGIC_LINK_COOLDOWN',
    } as const;
  }

  const history = actionHistory.get(key) || [];
  if (history.length >= config.MAX_REQUESTS_PER_HOUR) {
    const oldest = history[0];
    const retryAfterMs = oldest + 60 * 60 * 1000 - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      code: action === 'password-reset' ? 'PASSWORD_RESET_RATE_LIMITED' : 'MAGIC_LINK_RATE_LIMITED',
    } as const;
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    code: null,
  } as const;
}

export function recordActionRequest(
  action: 'password-reset' | 'magic-link',
  email: string,
  source: string | null
) {
  const now = Date.now();
  const config = action === 'password-reset' ? AUTH_CONFIG.PASSWORD_RESET : AUTH_CONFIG.MAGIC_LINK;
  const key = buildKey(action, email, source);

  const history = actionHistory.get(key) || [];
  const filtered = history.filter((ts) => ts > now - 60 * 60 * 1000);
  filtered.push(now);
  actionHistory.set(key, filtered);

  actionCooldowns.set(key, now + config.COOLDOWN_SECONDS * 1000);
}

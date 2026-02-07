/**
 * Auth API Client - Mobile
 * 
 * Connects to the web API for authentication.
 * Uses Better Auth endpoints directly.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, AUTH_ENDPOINTS } from './config';

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'auth:session',
  USER: 'auth:user',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  // Profile fields from customSession enrichment
  role?: 'user' | 'admin' | 'super_admin';
  banned?: boolean;
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  avatar?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  useGeneratedAvatar?: boolean;
  partnerMemberships?: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    partnerLogo?: string | null;
    partnerTier?: string | null;
    subscriptionTier?: string | null;
    staffRole: string;
  }>;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  code?: string;
  needsVerification?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Make an authenticated request to the API
 * Must include Origin header for Better Auth CSRF protection
 */
async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getStoredSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Better Auth requires Origin header for CSRF protection
    // Use the API base URL as origin (it's in trustedOrigins)
    'Origin': API_BASE,
    ...options.headers,
  };

  // Add session token if available
  if (session?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
  }

  console.log(`[Auth] Fetching ${API_BASE}${endpoint}`);
  
  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Store session in AsyncStorage
 */
async function storeSession(session: AuthSession | null, user: AuthUser | null): Promise<void> {
  try {
    if (session) {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('[Auth] Failed to store session:', error);
  }
}

/**
 * Get stored session from AsyncStorage
 */
export async function getStoredSession(): Promise<AuthSession | null> {
  try {
    const sessionData = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as AuthSession;
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      await storeSession(null, null);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('[Auth] Failed to get session:', error);
    return null;
  }
}

/**
 * Get stored user from AsyncStorage
 */
export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('[Auth] Failed to get user:', error);
    return null;
  }
}

/**
 * Normalize email address
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize name
 */
function normalizeName(name: string): string {
  return name.trim();
}

// ============================================================================
// AUTH OPERATIONS
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.SIGN_IN, {
      method: 'POST',
      body: JSON.stringify({
        email: normalizeEmail(email),
        password,
      }),
    });

    const data = await response.json();
    
    console.log('[Auth] Sign in response status:', response.status);
    console.log('[Auth] Sign in response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      const errorMessage = data?.message?.toLowerCase() || data?.error?.toLowerCase() || '';
      
      // Check for banned/suspended users
      if (errorMessage.includes('banned') || errorMessage.includes('suspended') || errorMessage.includes('blocked')) {
        return {
          success: false,
          error: 'Your account has been suspended. Please contact support.',
        };
      }
      
      // Check specifically for unverified email
      // Better Auth typically returns a message like "Email is not verified" or similar
      if (errorMessage.includes('not verified') || errorMessage.includes('verify your email') || errorMessage.includes('email verification')) {
        return {
          success: false,
          error: 'Please verify your email first.',
          needsVerification: true,
        };
      }
      
      // For other 403 errors, return the actual message
      if (response.status === 403) {
        return {
          success: false,
          error: data?.message || data?.error || 'Access denied. Please try again.',
        };
      }

      // For 401 (unauthorized) - wrong credentials
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password.',
        };
      }

      return {
        success: false,
        error: data?.message || data?.error || 'Sign in failed. Please try again.',
      };
    }

    // Extract user from response - Better Auth may nest it differently
    const user = data.user || data.data?.user || (data.id ? data : null);
    
    // Better Auth returns session info in response or via set-cookie header
    let session: AuthSession | null = null;
    
    if (data.session?.token) {
      session = {
        token: data.session.token,
        expiresAt: data.session.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } else if (data.token) {
      session = {
        token: data.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } else {
      // Try to extract from Set-Cookie header
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const sessionMatch = setCookie.match(/better-auth\.session_token=([^;]+)/);
        if (sessionMatch) {
          session = {
            token: sessionMatch[1],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }
      }
    }

    // Store session if we have it
    if (session) {
      await storeSession(session, user);
    } else if (user) {
      // Store user even without session token (can refresh later)
      await storeSession(null, user);
    }

    // Return success - user might be undefined but sign-in worked
    return {
      success: true,
      user: user ? {
        id: user.id,
        name: user.name || email.split('@')[0],
        email: user.email || email,
        image: user.image,
        emailVerified: user.emailVerified,
      } : {
        // Fallback user if not returned
        id: 'temp-id',
        name: email.split('@')[0],
        email: normalizeEmail(email),
      },
      session: session || undefined,
    };
  } catch (error: any) {
    console.error('[Auth] Sign in error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to sign in. Please try again.',
    };
  }
}

/**
 * Sign up with email, password, and name
 * Uses custom signup endpoint that handles unverified user cleanup
 */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.SIGN_UP, {
      method: 'POST',
      body: JSON.stringify({
        name: normalizeName(name),
        email: normalizeEmail(email),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (data.code === 'EMAIL_ALREADY_VERIFIED' || data.code === 'EMAIL_EXISTS') {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in.',
          code: data.code,
        };
      }

      return {
        success: false,
        error: data?.error || 'Failed to create account',
      };
    }

    // Don't store session yet - user needs to verify email first
    return {
      success: true,
      user: data.user,
      needsVerification: true, // Always need OTP after signup
    };
  } catch (error: any) {
    console.error('[Auth] Sign up error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to create account. Please try again.',
    };
  }
}

/**
 * Verify email with OTP code
 * Also creates Stripe customer on success
 */
export async function verifyEmailOTP(
  email: string,
  otp: string
): Promise<AuthResult> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({
        email: normalizeEmail(email),
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (data.code === 'INVALID_OTP') {
        return {
          success: false,
          error: 'Invalid or expired code. Please try again.',
          code: 'INVALID_OTP',
        };
      }

      if (data.code === 'TOO_MANY_ATTEMPTS' || response.status === 429) {
        return {
          success: false,
          error: 'Too many attempts. Please request a new code.',
          code: 'TOO_MANY_ATTEMPTS',
        };
      }

      return {
        success: false,
        error: data?.error || 'Verification failed',
      };
    }

    // After verification, sign in automatically
    // The user now needs to sign in to get a session
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Auth] Verify OTP error:', error);
    return {
      success: false,
      error: error?.message || 'Verification failed. Please try again.',
    };
  }
}

/**
 * Resend OTP verification code
 */
export async function resendVerificationOTP(
  email: string,
  type: 'email-verification' | 'sign-in' | 'forget-password' = 'email-verification'
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.RESEND_OTP, {
      method: 'POST',
      body: JSON.stringify({
        email: normalizeEmail(email),
        type,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to resend code',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Auth] Resend OTP error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to resend code. Please try again.',
    };
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.PASSWORD_RESET, {
      method: 'POST',
      body: JSON.stringify({
        email: normalizeEmail(email),
        // Mobile users will reset password on web
        redirectTo: '/reset-password',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || 'Failed to send reset email',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Auth] Password reset error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send reset email. Please try again.',
    };
  }
}

/**
 * Sign out - clear local session and all cookies
 * Mirrors the web app's handleSignOut which clears cookies, localStorage, and query cache.
 *
 * Cookie strategy: The global fetch interceptor in config.ts adds credentials:'omit'
 * to all API requests, so the native cookie jar is never populated. We still call the sign-out API to invalidate the session
 * server-side, then wipe AsyncStorage.
 */
export async function signOut(): Promise<{ success: boolean }> {
  try {
    // Call API to invalidate session on server
    // Must send empty JSON object to avoid parse errors
    await authFetch(AUTH_ENDPOINTS.SIGN_OUT, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.error('[Auth] Sign out API error:', error);
    // Continue with local cleanup even if API fails
  }

  // Clear local AsyncStorage (session + user)
  await storeSession(null, null);

  return { success: true };
}

/**
 * Get current session (check if user is logged in)
 */
export async function getSession(): Promise<{ user: AuthUser | null; session: AuthSession | null }> {
  const session = await getStoredSession();
  const user = await getStoredUser();
  
  if (!session || !user) {
    return { user: null, session: null };
  }
  
  // Optionally validate session with server
  // For now, trust local storage if not expired
  return { user, session };
}

/**
 * Refresh session from server
 * Fetches enriched user data including avatarUrl, partnerMemberships, etc.
 */
export async function refreshSession(): Promise<AuthResult> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.GET_SESSION, {
      method: 'GET',
    });

    const data = await response.json();
    
    console.log('[Auth] Get session response:', JSON.stringify(data, null, 2));

    if (!response.ok || !data?.user) {
      // Server couldn't enrich the session (e.g. token not recognized).
      // DON'T wipe AsyncStorage here — the stored token may still be valid
      // for other API calls (profile, listings, etc.). Only signOut should clear.
      console.warn('[Auth] get-session returned no user, keeping local session');
      return { success: false };
    }

    // Enrich user with admin convenience flags
    const enrichedUser: AuthUser = {
      ...data.user,
      isAdmin: data.user.role === 'admin' || data.user.role === 'super_admin',
      isSuperAdmin: data.user.role === 'super_admin',
      isAlifhAdmin: ['admin', 'super_admin'].includes(data.user.role || 'user'),
    };

    // Update local storage with fresh enriched data
    const session = data.session ? {
      token: data.session.token,
      expiresAt: data.session.expiresAt,
    } : await getStoredSession();

    if (session) {
      await storeSession(session, enrichedUser);
    }

    return {
      success: true,
      user: enrichedUser,
      session: session || undefined,
    };
  } catch (error) {
    console.error('[Auth] Refresh session error:', error);
    return { success: false };
  }
}

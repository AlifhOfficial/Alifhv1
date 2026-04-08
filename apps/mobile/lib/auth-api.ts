/**
 * Auth API Client - Mobile
 * 
 * Connects to the web API for authentication.
 * Uses Better Auth endpoints directly.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Passkey as NativePasskey } from 'react-native-passkey';
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
  partnerMemberships?: {
    staffId: string;
    partnerId: string;
    partnerName: string;
    partnerLogo?: string | null;
    partnerTier?: string | null;
    staffRole: string;
  }[];
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
  attemptsRemaining?: number;
  retryAfterSeconds?: number;
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
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const session = await getStoredSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Better Auth requires Origin header for CSRF protection
    // Use the API base URL as origin (it's in trustedOrigins)
    'Origin': API_BASE,
    ...fetchOptions.headers,
  };

  // Add session token if available
  if (session?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
  }

  console.log(`[Auth] Fetching ${API_BASE}${endpoint}`);
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
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
          attemptsRemaining: typeof data.attemptsRemaining === 'number' ? data.attemptsRemaining : undefined,
        };
      }

      if (data.code === 'TOO_MANY_ATTEMPTS' || response.status === 429) {
        return {
          success: false,
          error: data?.error || 'Too many attempts. Please request a new code.',
          code: 'TOO_MANY_ATTEMPTS',
          attemptsRemaining: typeof data.attemptsRemaining === 'number' ? data.attemptsRemaining : 0,
          retryAfterSeconds: typeof data.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
        };
      }

      return {
        success: false,
        error: data?.error || 'Verification failed',
        code: data?.code,
        attemptsRemaining: typeof data?.attemptsRemaining === 'number' ? data.attemptsRemaining : undefined,
        retryAfterSeconds: typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
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
): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
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
        retryAfterSeconds: typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
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
): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
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
        retryAfterSeconds: typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
      };
    }

    return {
      success: true,
      retryAfterSeconds: typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
    };
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
      // Bypass any HTTP cache (iOS NSURLSession respects Cache-Control: max-age).
      // The server now sends Cache-Control: private, max-age=300 + Vary: Cookie on
      // this endpoint. Since mobile sends no Cookie, all mobile requests share the
      // same Vary bucket — without this header iOS could return another user's
      // cached session data within the 5-min TTL.
      headers: { 'Cache-Control': 'no-cache' },
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

// ============================================================================
// PASSKEY OPERATIONS
// ============================================================================

export interface PasskeyResult {
  success: boolean;
  error?: string;
}

/**
 * Safely parse a JSON response, returning null for empty/non-JSON bodies
 */
async function safeParseJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Add a new passkey for the authenticated user
 * 
 * Full WebAuthn registration flow:
 * 1. GET /passkey/generate-register-options — get challenge from server
 * 2. Native Passkey.create() — device biometric credential creation
 * 3. POST /passkey/verify-registration — send attestation to server
 */
export async function addPasskey(name: string): Promise<PasskeyResult> {
  try {
    // Check if passkeys are supported on this device
    if (!NativePasskey.isSupported()) {
      return {
        success: false,
        error: 'Passkeys are not supported on this device.',
      };
    }

    // Step 1: Get registration options from server
    console.log('[Auth] Requesting passkey registration options...');
    const optionsResponse = await authFetch(
      `${AUTH_ENDPOINTS.PASSKEY_REGISTER_OPTIONS}?name=${encodeURIComponent(name)}`,
      { method: 'GET' }
    );

    const options = await safeParseJson(optionsResponse);

    if (!optionsResponse.ok || !options) {
      console.error('[Auth] Generate register options failed:', options);
      return {
        success: false,
        error: options?.message || options?.error || 'Failed to get registration options',
      };
    }

    console.log('[Auth] Got registration options, starting native passkey creation...');
    console.log('[Auth] Registration options:', JSON.stringify({
      challenge: options.challenge?.substring(0, 20) + '...',
      rp: options.rp,
      user: { id: options.user?.id?.substring(0, 20) + '...', name: options.user?.name, displayName: options.user?.displayName },
      pubKeyCredParams: options.pubKeyCredParams,
      authenticatorSelection: options.authenticatorSelection,
    }, null, 2));

    // Step 2: Create credential using native passkey API
    // The server returns SimpleWebAuthn-format options which are WebAuthn-compatible
    const registrationResult = await NativePasskey.create({
      challenge: options.challenge,
      rp: options.rp,
      user: options.user,
      pubKeyCredParams: options.pubKeyCredParams,
      timeout: options.timeout,
      excludeCredentials: options.excludeCredentials,
      authenticatorSelection: options.authenticatorSelection,
      attestation: options.attestation || 'none',
    });

    console.log('[Auth] Native passkey created, verifying with server...');

    // Step 3: Send attestation to server for verification
    const verifyResponse = await authFetch(AUTH_ENDPOINTS.PASSKEY_VERIFY_REGISTRATION, {
      method: 'POST',
      body: JSON.stringify({
        response: registrationResult,
        name,
      }),
    });

    const verifyData = await safeParseJson(verifyResponse);

    if (!verifyResponse.ok) {
      console.error('[Auth] Verify registration failed:', verifyData);
      return {
        success: false,
        error: verifyData?.message || verifyData?.error || 'Failed to verify passkey registration',
      };
    }

    console.log('[Auth] Passkey registered successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('[Auth] Add passkey error:', error);

    // Handle user cancellation gracefully
    const msg = error?.message?.toLowerCase() || '';
    if (msg.includes('cancel') || msg.includes('abort') || msg.includes('dismissed')) {
      return {
        success: false,
        error: 'Passkey registration was cancelled.',
      };
    }

    return {
      success: false,
      error: error?.message || 'Failed to add passkey. Please try again.',
    };
  }
}

/**
 * Delete a passkey by ID
 * Uses Better Auth passkey plugin endpoint: POST /api/auth/passkey/delete-passkey
 */
export async function deletePasskey(id: string): Promise<PasskeyResult> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.PASSKEY_DELETE, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    const data = await safeParseJson(response);

    if (!response.ok) {
      console.error('[Auth] Delete passkey failed:', data);
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to delete passkey',
      };
    }

    console.log('[Auth] Passkey deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Delete passkey error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * List all passkeys for the authenticated user
 * Uses Better Auth passkey plugin endpoint: GET /api/auth/passkey/list-user-passkeys
 */
export async function listPasskeys(): Promise<{ success: boolean; passkeys: { id: string; name: string | null; createdAt: string }[]; error?: string }> {
  try {
    const response = await authFetch(AUTH_ENDPOINTS.PASSKEY_LIST, {
      method: 'GET',
    });

    const data = await safeParseJson(response);

    if (!response.ok) {
      console.error('[Auth] List passkeys failed:', data);
      return {
        success: false,
        passkeys: [],
        error: data?.message || data?.error || 'Failed to list passkeys',
      };
    }

    console.log('[Auth] Passkeys listed:', data?.length ?? 0);
    return {
      success: true,
      passkeys: Array.isArray(data) ? data : (data?.passkeys || []),
    };
  } catch (error) {
    console.error('[Auth] List passkeys error:', error);
    return {
      success: false,
      passkeys: [],
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Sign in with Passkey (Face ID / Touch ID / Fingerprint)
 * 
 * Full WebAuthn authentication flow:
 * 1. POST /passkey/generate-authenticate-options — get challenge from server
 * 2. Native Passkey.get() — device biometric credential assertion
 * 3. POST /passkey/verify-authentication — send assertion to server, get session
 */
export async function signInWithPasskey(): Promise<AuthResult> {
  try {
    // Check if passkeys are supported on this device
    if (!NativePasskey.isSupported()) {
      return {
        success: false,
        error: 'Passkeys are not supported on this device.',
      };
    }

    // Step 1: Get authentication options from server
    console.log('[Auth] Requesting passkey authentication options...');
    const optionsResponse = await fetch(`${API_BASE}${AUTH_ENDPOINTS.PASSKEY_AUTHENTICATE_OPTIONS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
      },
      body: JSON.stringify({}),
    });

    const options = await safeParseJson(optionsResponse);

    if (!optionsResponse.ok || !options) {
      console.error('[Auth] Generate authenticate options failed:', options);
      // Check if user has no passkeys registered
      if (options?.code === 'USER_NOT_FOUND' || options?.message?.includes('no passkey')) {
        return {
          success: false,
          error: 'No passkeys found. Please sign in with your email first and register a passkey.',
        };
      }
      return {
        success: false,
        error: options?.message || options?.error || 'Failed to get authentication options',
      };
    }

    console.log('[Auth] Got authentication options, starting native passkey assertion...');

    // Step 2: Get credential using native passkey API
    const assertionResult = await NativePasskey.get({
      challenge: options.challenge,
      rpId: options.rpId,
      timeout: options.timeout,
      allowCredentials: options.allowCredentials,
      userVerification: options.userVerification || 'preferred',
    });

    console.log('[Auth] Native passkey assertion complete, verifying with server...');

    // Step 3: Send assertion to server for verification
    const verifyResponse = await fetch(`${API_BASE}${AUTH_ENDPOINTS.PASSKEY_VERIFY_AUTHENTICATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
      },
      body: JSON.stringify({
        response: assertionResult,
      }),
    });

    // Extract session token from Set-Cookie header (Better Auth sets it there)
    const setCookie = verifyResponse.headers.get('set-cookie') || '';
    const sessionMatch = setCookie.match(/better-auth\.session_token=([^;]+)/);

    const verifyData = await safeParseJson(verifyResponse);

    if (!verifyResponse.ok) {
      console.error('[Auth] Verify authentication failed:', verifyData);
      return {
        success: false,
        error: verifyData?.message || verifyData?.error || 'Passkey verification failed',
      };
    }

    console.log('[Auth] Passkey authentication successful!');

    // Build session from response
    // Better Auth passkey returns user and session data
    const token = sessionMatch?.[1] || verifyData?.session?.token || verifyData?.token;
    const user = verifyData?.user;
    const sessionData = verifyData?.session;

    if (!token || !user) {
      // Try to get session via GET /api/auth/get-session if we have a token
      if (token) {
        const sessionResponse = await fetch(`${API_BASE}${AUTH_ENDPOINTS.GET_SESSION}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': API_BASE,
          },
        });
        const sessionResult = await safeParseJson(sessionResponse);
        if (sessionResponse.ok && sessionResult?.user) {
          const session: AuthSession = {
            token,
            expiresAt: sessionResult.session?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          await storeSession(session, sessionResult.user);
          return {
            success: true,
            user: sessionResult.user,
            session,
          };
        }
      }
      return {
        success: false,
        error: 'Authentication succeeded but failed to get session data',
      };
    }

    // Store session
    const session: AuthSession = {
      token,
      expiresAt: sessionData?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await storeSession(session, user);

    return {
      success: true,
      user,
      session,
    };
  } catch (error: any) {
    console.error('[Auth] Sign in with passkey error:', error);

    // Handle user cancellation gracefully
    const msg = error?.message?.toLowerCase() || '';
    if (msg.includes('cancel') || msg.includes('abort') || msg.includes('dismissed')) {
      return {
        success: false,
        error: 'Passkey sign in was cancelled.',
      };
    }

    // Handle no credentials available
    if (msg.includes('no credentials') || msg.includes('not found')) {
      return {
        success: false,
        error: 'No passkeys found for this account. Please sign in with email first.',
      };
    }

    return {
      success: false,
      error: error?.message || 'Failed to sign in with passkey. Please try again.',
    };
  }
}

// ============================================================================
// SOCIAL AUTH (Google)
// ============================================================================

/**
 * Start Google OAuth flow using expo-web-browser.
 * Web and mobile share the same backend social endpoint; sign-up and sign-in
 * are both handled by the provider flow with account auto-link/create rules.
 * Opens a browser window to complete Google OAuth, then redirects back to the app
 */
async function startGoogleOAuthFlow(mode: 'signin' | 'signup'): Promise<AuthResult> {
  try {
    // Import expo-web-browser dynamically to avoid issues if not installed
    const WebBrowser = await import('expo-web-browser');
    const { makeRedirectUri } = await import('expo-auth-session');
    
    // Ensure browser redirect session is warmed up (improves UX on iOS)
    await WebBrowser.warmUpAsync();
    
    // The redirect URI that the browser will return to
    // Using expo's scheme-based redirect
    const redirectUri = makeRedirectUri({
      scheme: 'revvup',
      path: 'auth/callback',
    });
    
    // Build the auth URL using the web app's dedicated mobile Google start route.
    const authUrl = `${API_BASE}${AUTH_ENDPOINTS.GOOGLE_SIGN_IN}?redirect=${encodeURIComponent(redirectUri)}&mode=${mode}`;
    
    console.log('[Auth] Starting Google OAuth:', mode);
    console.log('[Auth] Auth URL:', authUrl);
    console.log('[Auth] Redirect URI:', redirectUri);
    
    // Open the browser and wait for it to return
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    // Clean up browser session
    await WebBrowser.coolDownAsync();
    
    console.log('[Auth] Browser result:', result.type);
    
    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, error: `${mode === 'signup' ? 'Sign up' : 'Sign in'} was cancelled` };
    }
    
    if (result.type !== 'success' || !result.url) {
      return { success: false, error: `Google ${mode === 'signup' ? 'sign up' : 'sign in'} failed` };
    }
    
    // Parse the callback URL to get session data
    const url = new URL(result.url);
    const params = new URLSearchParams(url.search);
    
    // Check for errors
    const error = params.get('error');
    if (error) {
      return { success: false, error: error === 'cancelled' ? 'Sign in was cancelled' : error };
    }
    
    // Check for success
    const success = params.get('success');
    if (success !== 'true') {
      return { success: false, error: 'Google sign in failed' };
    }
    
    // Extract session data
    const token = params.get('token');
    const expiresAt = params.get('expiresAt');
    const userId = params.get('userId');
    const userName = params.get('userName');
    const userEmail = params.get('userEmail');
    const userImage = params.get('userImage');
    
    if (!token || !expiresAt || !userId || !userEmail) {
      return { success: false, error: 'Invalid session data received' };
    }
    
    // Build user and session objects
    const user: AuthUser = {
      id: userId,
      name: userName || '',
      email: userEmail,
      image: userImage || null,
      emailVerified: true, // Google emails are verified
    };
    
    const session: AuthSession = {
      token,
      expiresAt,
    };
    
    // Store the session
    await storeSession(session, user);
    
    console.log('[Auth] Google OAuth successful:', mode);
    return { success: true, user, session };
  } catch (error: any) {
    console.error('[Auth] Google OAuth error:', mode, error);
    return {
      success: false,
      error: error?.message || `Google ${mode === 'signup' ? 'sign up' : 'sign in'} failed. Please try again.`,
    };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  return startGoogleOAuthFlow('signin');
}

export async function signUpWithGoogle(): Promise<AuthResult> {
  return startGoogleOAuthFlow('signup');
}

// ============================================================================
// APPLE SIGN IN (Native iOS)
// ============================================================================

/**
 * Sign in with Apple using native iOS authentication
 * Uses expo-apple-authentication for the native sign-in flow
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    // Dynamic import to avoid issues on Android
    const AppleAuthentication = await import('expo-apple-authentication');
    const { Platform } = await import('react-native');
    
    // Apple Sign In is only available on iOS
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign In is only available on iOS' };
    }
    
    // Check if Apple Sign In is available on this device
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'Apple Sign In is not available on this device' };
    }
    
    console.log('[Auth] Starting Apple Sign In');
    
    // Request sign in with Apple
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    console.log('[Auth] Apple credential received');
    
    // identityToken is the JWT we send to our backend
    if (!credential.identityToken) {
      return { success: false, error: 'No identity token received from Apple' };
    }
    
    // Send the token to our backend for verification
    const response = await fetch(`${API_BASE}${AUTH_ENDPOINTS.APPLE_SIGN_IN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        // Apple only returns name/email on FIRST sign in - backend must store these
        fullName: credential.fullName ? {
          givenName: credential.fullName.givenName,
          familyName: credential.fullName.familyName,
        } : null,
        email: credential.email, // May be null on subsequent logins
        user: credential.user, // Apple user ID
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: error.message || 'Apple sign in failed on server' 
      };
    }
    
    const data = await response.json();
    
    if (!data.success || !data.token || !data.user) {
      return { 
        success: false, 
        error: data.error || 'Invalid response from server' 
      };
    }
    
    // Build session and user objects
    const user: AuthUser = {
      id: data.user.id,
      name: data.user.name || '',
      email: data.user.email,
      image: data.user.image || null,
      emailVerified: true, // Apple emails are verified
    };
    
    const session: AuthSession = {
      token: data.token,
      expiresAt: data.expiresAt,
    };
    
    // Store the session
    await storeSession(session, user);
    
    console.log('[Auth] Apple sign in successful');
    return { success: true, user, session };
  } catch (error: any) {
    console.error('[Auth] Apple sign in error:', error);
    
    // Handle user cancellation
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
      return { success: false, error: 'Sign in was cancelled' };
    }
    
    return {
      success: false,
      error: error?.message || 'Apple sign in failed. Please try again.',
    };
  }
}
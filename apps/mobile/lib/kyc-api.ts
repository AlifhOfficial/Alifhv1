/**
 * KYC API Client - Mobile
 * 
 * Connects to the web API for KYC/identity verification.
 * Endpoints:
 * - POST /api/kyc/didit/session - Start verification session
 * - POST /api/kyc/cancel - Cancel pending verification
 */

import { getStoredSession } from './auth-api';
import { API_BASE } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface KycSessionResult {
  success: boolean;
  sessionId?: string;
  verificationUrl?: string;
  status?: 'pending' | 'approved';
  isExisting?: boolean;
  error?: string;
}

export interface KycCancelResult {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Make an authenticated request to the KYC API
 */
async function kycFetch(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const session = await getStoredSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Origin': API_BASE,
    ...fetchOptions.headers,
  };

  // Add session token if available
  if (session?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
  }

  console.log(`[KYC API] ${fetchOptions.method || 'GET'} ${API_BASE}${endpoint}`);
  
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
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// API OPERATIONS
// ============================================================================

/**
 * Start a KYC verification session
 * Returns a verification URL to load in WebView
 */
export async function startVerificationSession(): Promise<KycSessionResult> {
  try {
    const response = await kycFetch('/api/kyc/didit/session', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[KYC API] Session start failed:', data);
      
      if (response.status === 401) {
        return {
          success: false,
          error: 'Please sign in to verify your identity',
        };
      }

      if (response.status === 400 && data.status === 'approved') {
        return {
          success: false,
          error: 'Your identity is already verified',
          status: 'approved',
        };
      }
      
      return {
        success: false,
        error: data?.error || 'Failed to start verification',
      };
    }

    console.log('[KYC API] Session started:', {
      sessionId: data.sessionId,
      isExisting: data.isExisting,
    });
    
    // Build verification URL with skip params for smoother UX
    let verificationUrl = data.verificationUrl;
    if (verificationUrl) {
      try {
        const url = new URL(verificationUrl);
        url.searchParams.set('skip_intro', 'true');
        url.searchParams.set('skip_welcome', 'true');
        url.searchParams.set('auto_start', 'true');
        verificationUrl = url.toString();
      } catch {
        // If URL parsing fails, use as-is
      }
    }

    return {
      success: true,
      sessionId: data.sessionId,
      verificationUrl,
      status: data.status,
      isExisting: data.isExisting,
    };
  } catch (error: any) {
    console.error('[KYC API] Session start error:', error);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. Please check your connection.',
      };
    }
    
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Cancel a pending KYC verification session
 */
export async function cancelVerification(): Promise<KycCancelResult> {
  try {
    const response = await kycFetch('/api/kyc/cancel', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[KYC API] Cancel failed:', data);
      return {
        success: false,
        error: data?.error || 'Failed to cancel verification',
      };
    }

    console.log('[KYC API] Verification cancelled');
    
    return {
      success: true,
      message: data.message,
    };
  } catch (error: any) {
    console.error('[KYC API] Cancel error:', error);
    
    // Silent fail - next session start will clean up anyway
    return {
      success: false,
      error: 'Failed to cancel verification',
    };
  }
}

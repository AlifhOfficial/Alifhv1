/**
 * Profile API Client - Mobile
 * 
 * Connects to the web API for user profile operations.
 * Endpoint: /api/profile/user/user-profile
 */

import { getStoredSession } from './auth-api';
import { API_BASE, AUTH_ENDPOINTS, PROFILE_ENDPOINTS } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  description: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  tags: string[];
  consignmentMode: boolean;
  kycStatus: 'none' | 'pending' | 'rejected' | 'verified';
  kycVerified: boolean;
  kycExpiresAt: string | null;
  phoneNumberVerified: boolean;
  privacySettings: {
    showPhone?: boolean;
  } | null;
  preferences: {
    theme?: string;
    language?: string;
    distanceUnit?: string;
    useGeneratedAvatar?: boolean;
  } | null;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  totalFavorites: number;
  avgResponseTime: number | null;
  responseRate: number | null;
  avgRating: number | null;
  totalReviews: number;
}

export interface Passkey {
  id: string;
  name: string | null;
  createdAt: string;
}

export interface ProfileData {
  profile: UserProfile;
  stats: UserStats;
  passkeys: Passkey[];
}

export interface ProfileUpdatePayload {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  description?: string | null;
  tags?: string[];
  consignmentMode?: boolean;
  privacySettings?: { showPhone?: boolean };
  preferences?: {
    theme?: string;
    language?: string;
    distanceUnit?: string;
    useGeneratedAvatar?: boolean;
  };
  avatar?: string | null;
}

export interface ProfileResult {
  success: boolean;
  data?: ProfileData;
  error?: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Make an authenticated request to the profile API
 */
async function profileFetch(
  method: 'GET' | 'PATCH',
  body?: ProfileUpdatePayload
): Promise<Response> {
  const session = await getStoredSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Origin': API_BASE,
  };

  if (session?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
  }

  const endpoint = '/api/profile/user/user-profile';
  console.log(`[Profile API] ${method} ${API_BASE}${endpoint}`);
  
  return fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ============================================================================
// API OPERATIONS
// ============================================================================

/**
 * Fetch user profile data
 * Returns profile, stats, and passkeys
 */
export async function fetchProfile(): Promise<ProfileResult> {
  try {
    const response = await profileFetch('GET');
    const data = await response.json();

    if (!response.ok) {
      console.error('[Profile API] Fetch failed:', data);
      
      if (response.status === 401) {
        return {
          success: false,
          error: 'Please sign in to view your profile',
        };
      }
      
      return {
        success: false,
        error: data?.error || 'Failed to load profile',
      };
    }

    console.log('[Profile API] Fetch success');
    
    return {
      success: true,
      data: {
        profile: data.profile,
        stats: data.stats,
        passkeys: data.passkeys || [],
      },
    };
  } catch (error) {
    console.error('[Profile API] Fetch error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: ProfileUpdatePayload
): Promise<ProfileUpdateResult> {
  try {
    const response = await profileFetch('PATCH', updates);
    const data = await response.json();

    if (!response.ok) {
      console.error('[Profile API] Update failed:', data);
      
      if (response.status === 401) {
        return {
          success: false,
          error: 'Please sign in to update your profile',
        };
      }
      
      if (response.status === 400 && data?.details) {
        // Validation error
        return {
          success: false,
          error: 'Invalid input. Please check your entries.',
        };
      }
      
      return {
        success: false,
        error: data?.error || 'Failed to update profile',
      };
    }

    console.log('[Profile API] Update success');
    
    return {
      success: true,
      profile: data.profile,
    };
  } catch (error) {
    console.error('[Profile API] Update error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Update a single field
 * Convenience wrapper for updateProfile
 */
export async function updateProfileField(
  field: keyof ProfileUpdatePayload,
  value: ProfileUpdatePayload[keyof ProfileUpdatePayload]
): Promise<ProfileUpdateResult> {
  return updateProfile({ [field]: value });
}

// ============================================================================
// PHONE VERIFICATION
// ============================================================================

export interface PhoneVerifyResult {
  success: boolean;
  error?: string;
}

/**
 * Send OTP to phone number for verification
 * @param phoneNumber - Full phone number with country code (e.g., +971501234567)
 */
export async function sendPhoneOTP(
  phoneNumber: string
): Promise<PhoneVerifyResult> {
  try {
    const session = await getStoredSession();
    
    const response = await fetch(`${API_BASE}${AUTH_ENDPOINTS.PHONE_SEND_OTP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
        ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Profile API] Send phone OTP failed:', data);
      
      const errorMsg = data?.message?.toLowerCase() || data?.error?.toLowerCase() || '';
      
      // Check for Twilio fraud block
      if (errorMsg.includes('blocked') || errorMsg.includes('fraud') || errorMsg.includes('60410')) {
        return {
          success: false,
          error: 'This phone number has been temporarily blocked. Please try a different number or contact support.',
        };
      }
      
      return {
        success: false,
        error: data?.message || data?.error || 'Failed to send verification code',
      };
    }

    console.log('[Profile API] Phone OTP sent');
    return { success: true };
  } catch (error) {
    console.error('[Profile API] Send phone OTP error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Verify phone number with OTP code
 * @param phoneNumber - Full phone number with country code
 * @param code - 6-digit OTP code
 */
export async function verifyPhoneOTP(
  phoneNumber: string,
  code: string
): Promise<PhoneVerifyResult> {
  try {
    const session = await getStoredSession();
    
    const response = await fetch(`${API_BASE}${AUTH_ENDPOINTS.PHONE_VERIFY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
        ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ 
        phoneNumber, 
        code,
        updatePhoneNumber: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Profile API] Verify phone failed:', data);
      
      const errorMsg = (data?.message || data?.error || '').toLowerCase();
      
      // Handle specific error cases gracefully
      if (errorMsg.includes('already exists') || errorMsg.includes('already in use')) {
        return {
          success: false,
          error: 'This phone number is already linked to another account.',
        };
      }
      
      if (errorMsg.includes('invalid') || errorMsg.includes('incorrect')) {
        return {
          success: false,
          error: 'Invalid verification code. Please try again.',
        };
      }
      
      if (errorMsg.includes('expired')) {
        return {
          success: false,
          error: 'Code expired. Please request a new one.',
        };
      }
      
      return {
        success: false,
        error: data?.message || data?.error || 'Verification failed. Please try again.',
      };
    }

    console.log('[Profile API] Phone verified');
    return { success: true };
  } catch (error) {
    console.error('[Profile API] Verify phone error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

// ============================================================================
// AVATAR UPLOAD (Presigned URL Pipeline)
// ============================================================================

export interface AvatarUploadResult {
  success: boolean;
  key?: string;
  error?: string;
}

/**
 * Upload avatar image using presigned URL pipeline
 * @param uri - Local file URI
 * @param previousKey - Optional key of previous avatar (unused, kept for backwards compat)
 */
export async function uploadAvatar(
  uri: string,
  previousKey?: string | null
): Promise<AvatarUploadResult> {
  try {
    const session = await getStoredSession();
    
    // Get file info from URI
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'heif': 'image/heif',
    };
    const contentType = mimeTypes[ext] || 'image/jpeg';
    
    // Step 1: Get presigned URL
    const presignedRes = await fetch(`${API_BASE}/api/storage/presigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ type: 'avatar', contentType }),
    });
    
    if (!presignedRes.ok) {
      const err = await presignedRes.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to get upload URL' };
    }
    
    const { uploadUrl, rawKey } = await presignedRes.json();
    
    // Step 2: Upload directly to R2
    const fileBlob = await fetch(uri).then(r => r.blob());
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: fileBlob,
    });
    
    if (!uploadRes.ok) {
      return { success: false, error: 'Upload failed. Please try again.' };
    }
    
    // Step 3: Process the uploaded image
    const processRes = await fetch(`${API_BASE}/api/storage/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ rawKey }),
    });
    
    if (!processRes.ok) {
      const err = await processRes.json().catch(() => ({}));
      return { success: false, error: err.error || 'Processing failed' };
    }
    
    const data = await processRes.json();
    console.log('[Profile API] Avatar uploaded:', data.key);
    
    return { success: true, key: data.key };
  } catch (error) {
    console.error('[Profile API] Avatar upload error:', error);
    return {
      success: false,
      error: 'Failed to upload photo. Please try again.',
    };
  }
}

/**
 * Remove avatar - sets avatar to null
 */
export async function removeAvatar(): Promise<ProfileUpdateResult> {
  return updateProfile({ avatar: null });
}

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

export interface AccountActionResult {
  success: boolean;
  error?: string;
}

/**
 * Request account deletion
 * Account will be marked for deletion after 6 months grace period
 */
export async function requestAccountDeletion(): Promise<AccountActionResult> {
  try {
    const session = await getStoredSession();
    
    const response = await fetch(`${API_BASE}${PROFILE_ENDPOINTS.DELETE_ACCOUNT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
        ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Profile API] Delete account failed:', data);
      return {
        success: false,
        error: data?.error || 'Failed to request account deletion',
      };
    }

    console.log('[Profile API] Account deletion requested');
    return { success: true };
  } catch (error) {
    console.error('[Profile API] Delete account error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

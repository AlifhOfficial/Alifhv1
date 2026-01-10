/**
 * Didit KYC Client
 * 
 * Integration with Didit's free KYC verification service.
 * Docs: https://docs.didit.me
 * 
 * @module lib/kyc/didit-client
 */

const DIDIT_API_URL = process.env.DIDIT_API_URL || 'https://verification.didit.me/v2';
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;
const DIDIT_WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET;

// ============================================================================
// Types - Matching Didit's actual API response structure
// ============================================================================

export type DiditSessionStatus = 
  | 'Not Started'
  | 'In Progress'
  | 'In Review'
  | 'Approved'
  | 'Declined'
  | 'Abandoned'
  | 'Expired';

export interface DiditCreateSessionParams {
  /** Your internal user ID to track this verification */
  userId: string;
  /** Optional callback URL (overrides default) */
  callbackUrl?: string;
  /** Optional metadata to attach to the session */
  metadata?: Record<string, string>;
}

export interface DiditSession {
  /** Didit session ID */
  id: string;
  /** URL to redirect user to for verification */
  url: string;
  /** Session status */
  status: DiditSessionStatus | string;
  /** When the session expires */
  expires_at?: string;
}

/** ID Verification data from Didit */
export interface DiditIdVerification {
  status: string;
  document_type: string;
  document_number?: string;
  personal_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  issuing_state?: string;
  issuing_state_name?: string;
  expiration_date?: string;
  date_of_issue?: string;
  place_of_birth?: string;
  address?: string;
  formatted_address?: string;
  marital_status?: string;
  // Images
  front_image?: string;
  back_image?: string;
  full_front_image?: string;
  full_back_image?: string;
  portrait_image?: string;
  front_video?: string;
  back_video?: string;
  // Extra
  extra_fields?: Record<string, string>;
  warnings?: Array<{ risk: string; short_description: string; long_description?: string }>;
}

/** Face Match data from Didit */
export interface DiditFaceMatch {
  status: string;
  score: number;
  source_image?: string;
  target_image?: string;
  source_image_session_id?: string;
  warnings?: Array<{ risk: string; short_description: string }>;
}

/** Liveness data from Didit */
export interface DiditLiveness {
  status: string;
  score: number;
  method: 'PASSIVE' | 'ACTIVE';
  age_estimation?: number;
  reference_image?: string;
  video_url?: string;
  matches?: any[];
  warnings?: Array<{ risk: string; short_description: string }>;
}

/** IP Analysis data from Didit */
export interface DiditIpAnalysis {
  status: string;
  ip_address: string;
  ip_city?: string;
  ip_state?: string;
  ip_country?: string;
  ip_country_code?: string;
  latitude?: number;
  longitude?: number;
  time_zone?: string;
  time_zone_offset?: string;
  isp?: string;
  organization?: string;
  is_vpn_or_tor: boolean;
  is_data_center: boolean;
  platform?: string;
  device_brand?: string;
  device_model?: string;
  os_family?: string;
  browser_family?: string;
  warnings?: Array<{ risk: string; short_description: string }>;
}

/** Complete session details from Didit API or webhook */
export interface DiditSessionDetails {
  session_id: string;
  session_number?: number;
  session_url?: string;
  status: DiditSessionStatus | string;
  vendor_data: string;
  workflow_id: string;
  features?: string[];
  metadata?: Record<string, string>;
  callback?: string;
  created_at: string;
  // Verification results
  id_verification?: DiditIdVerification;
  face_match?: DiditFaceMatch;
  liveness?: DiditLiveness;
  ip_analysis?: DiditIpAnalysis;
  // Other features (nullable)
  aml?: any;
  nfc?: any;
  poa?: any;
  phone?: any;
  email?: any;
  questionnaire?: any;
  database_validation?: any;
  contact_details?: any;
  expected_details?: any;
  reviews?: any[];
}

/** Webhook payload from Didit - contains decision with all verification data */
export interface DiditWebhookPayload {
  webhook_type: 'status.updated' | 'data.updated';
  session_id: string;
  status: string;
  vendor_data: string;
  workflow_id?: string;
  metadata?: Record<string, string>;
  created_at?: number;
  timestamp?: number;
  // Decision contains all verification data when status is Approved/Declined
  decision?: DiditSessionDetails;
}

// ============================================================================
// Configuration Check
// ============================================================================

export function isDiditConfigured(): boolean {
  return Boolean(DIDIT_API_KEY && DIDIT_WORKFLOW_ID);
}

// ============================================================================
// API Client
// ============================================================================

async function diditFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!DIDIT_API_KEY) {
    throw new Error('DIDIT_API_KEY is not configured');
  }

  const url = `${DIDIT_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'x-api-key': DIDIT_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Didit API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Create a new verification session
 * User will be redirected to the returned URL to complete verification
 */
export async function createVerificationSession(
  params: DiditCreateSessionParams
): Promise<DiditSession> {
  if (!DIDIT_WORKFLOW_ID) {
    throw new Error('DIDIT_WORKFLOW_ID is not configured');
  }

  const callbackUrl = params.callbackUrl || process.env.NEXT_PUBLIC_DIDIT_CALLBACK_URL;

  const requestBody = {
    workflow_id: DIDIT_WORKFLOW_ID,
    vendor_data: params.userId,
    callback: callbackUrl,
    metadata: params.metadata,
    features: {
      skip_intro: true,
      skip_welcome: true,
      auto_start: true,
    },
  };

  const response = await diditFetch<any>('/session/', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  const sessionId = response.session_id || response.id;
  const sessionUrl = response.url || response.verification_url;
  
  return {
    id: sessionId,
    url: sessionUrl,
    status: response.status || 'created',
    expires_at: response.expires_at,
  };
}

/**
 * Get session details by ID
 * Endpoint: GET /session/{sessionId}/decision/
 */
export async function getSessionDetails(sessionId: string): Promise<DiditSessionDetails> {
  return diditFetch<DiditSessionDetails>(`/session/${sessionId}/decision/`);
}

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verify webhook signature from Didit
 * Didit uses X-Signature header with HMAC-SHA256 of the raw body
 * Also validates X-Timestamp to prevent replay attacks
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp?: string
): Promise<boolean> {
  if (!DIDIT_WEBHOOK_SECRET) {
    // In production this is a security risk - log as error
    if (process.env.NODE_ENV === 'production') {
      console.error('[Didit] DIDIT_WEBHOOK_SECRET not configured in production!');
      return false;
    }
    return true; // Allow in development only
  }

  // Validate timestamp (within 5 minutes)
  if (timestamp) {
    const currentTime = Math.floor(Date.now() / 1000);
    const incomingTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - incomingTime) > 300) return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(DIDIT_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const expectedSignature = Buffer.from(signatureBuffer).toString('hex');
    
    // Constant-time comparison
    if (signature.length !== expectedSignature.length) return false;
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    return result === 0;
  } catch {
    return false;
  }
}

/**
 * Parse and validate a webhook payload (Didit v2 format)
 */
export function parseWebhookPayload(body: unknown): DiditWebhookPayload | null {
  const payload = body as DiditWebhookPayload;
  if (!payload?.session_id || !payload?.status) return null;
  return payload;
}

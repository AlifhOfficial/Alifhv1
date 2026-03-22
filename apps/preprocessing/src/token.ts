/**
 * HMAC token validation.
 *
 * Vercel generates a token:  `${base64url_payload}.${hmac-sha256-hex}`
 * Payload: base64url(JSON.stringify({ userId, exp, ctx }))
 *
 * ctx shapes:
 *   { kind: 'listing';  vin: string }
 *   { kind: 'avatar' }
 *   { kind: 'partner';  partnerId: string; imageType: 'logo' | 'hero' }
 *   { kind: 'showroom'; partnerId: string; assetType: string }
 *
 * The shared secret (PREPROCESSING_SECRET) never leaves the server.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { SECRET } from './config.ts';

export type TokenContext =
  | { kind: 'listing';  vin: string }
  | { kind: 'avatar' }
  | { kind: 'partner';  partnerId: string; imageType: 'logo' | 'hero' }
  | { kind: 'showroom'; partnerId: string; assetType: string };

export interface TokenPayload {
  userId: string;
  exp: number; // unix seconds
  ctx: TokenContext;
}

/**
 * Validate a preprocessing token.
 * Throws on any validation failure (expired, tampered, malformed).
 */
export function validateToken(token: string): TokenPayload {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) throw new Error('Invalid token format');

  const payloadB64 = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  // Verify HMAC before decoding payload (timing-safe)
  const expected = createHmac('sha256', SECRET).update(payloadB64).digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid token signature');
  }

  // Safe to decode now that signature is verified
  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid token payload');
  }

  if (!payload.userId || !payload.exp || !payload.ctx?.kind) {
    throw new Error('Malformed token payload');
  }

  if (Date.now() / 1000 > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

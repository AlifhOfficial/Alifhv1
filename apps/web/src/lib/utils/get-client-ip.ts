/**
 * Extract client IP address from request headers
 * V1: Shared utility for admin audit logging
 */

import { NextRequest } from 'next/server';

export function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || null;
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

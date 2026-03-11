/**
 * Health Check Endpoint
 * 
 * Checks status of all critical services:
 * - Database (Neon)
 * - WebSocket Server
 * - Bun Runtime
 */

import { NextResponse } from 'next/server';
import { getHealthCheckResponse } from '@/lib/health';

/**
 * GET /api/health
 */
export async function GET() {
  const response = await getHealthCheckResponse();
  // Return 200 for healthy and degraded, 503 only for unhealthy
  const statusCode = response.status === 'unhealthy' ? 503 : 200;
  
  return NextResponse.json(response, { status: statusCode });
}

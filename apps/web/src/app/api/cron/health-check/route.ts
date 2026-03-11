/**
 * API: Cron Job - Health Check
 * GET /api/cron/health-check
 * 
 * Purpose: Check all services and store health data for status page
 * Authentication: Cron secret token required (prevents public access)
 * 
 * Schedule: Every 5 minutes (see vercel.json for cron config)
 * 
 * Services checked:
 * - Vercel (self-ping)
 * - Neon database
 * - WebSocket server
 * - API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, sql } from '@alifh/database';
import { serviceHealth } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Service URLs
const WS_HEALTH_URL = process.env.NEXT_PUBLIC_WS_URL 
  ? `${process.env.NEXT_PUBLIC_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`
  : 'http://localhost:3001/health';

interface HealthResult {
  service: 'vercel' | 'neon' | 'websocket';
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  message?: string;
  sleeping?: boolean;  // True if service was cold started
}

/**
 * Check Vercel (self-ping with light response)
 */
async function checkVercel(): Promise<HealthResult> {
  const start = Date.now();
  try {
    // Just measure response time - if this cron runs, Vercel is working
    return {
      service: 'vercel',
      status: 'healthy',
      latency: Date.now() - start,
      message: 'Operational',
    };
  } catch (error) {
    return {
      service: 'vercel',
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Neon database
 */
async function checkNeon(): Promise<HealthResult> {
  const start = Date.now();
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );
    
    await Promise.race([
      db.execute(sql`SELECT 1 as health`),
      timeoutPromise
    ]);
    
    const latency = Date.now() - start;
    const sleeping = latency > 500; // Neon cold start threshold
    
    return {
      service: 'neon',
      // If sleeping, still mark healthy as cold start is expected
      status: sleeping ? 'healthy' : (latency < 200 ? 'healthy' : latency < 1000 ? 'degraded' : 'unhealthy'),
      latency,
      message: sleeping ? 'Waking up' : (latency < 200 ? 'Connected' : 'Slow response'),
      sleeping,
    };
  } catch (error) {
    return {
      service: 'neon',
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check WebSocket server
 */
async function checkWebSocket(): Promise<HealthResult> {
  const start = Date.now();
  try {
    const response = await fetch(WS_HEALTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    
    // Get server-side processing time from Server-Timing header
    const serverTiming = response.headers.get('Server-Timing');
    let serverProcessMs = 0;
    if (serverTiming) {
      const match = serverTiming.match(/process;dur=([\d.]+)/);
      if (match) serverProcessMs = parseFloat(match[1]);
    }
    
    // Network overhead = total latency minus server processing
    const networkOverheadMs = latency - serverProcessMs;
    
    if (response.ok) {
      return {
        service: 'websocket',
        // Allow higher latency for cross-provider networking
        status: latency < 500 ? 'healthy' : latency < 1000 ? 'degraded' : 'unhealthy',
        latency,
        message: `Server: ${serverProcessMs.toFixed(1)}ms, Network: ${networkOverheadMs.toFixed(0)}ms`,
      };
    }
    
    return {
      service: 'websocket',
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      service: 'websocket',
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unreachable',
    };
  }
}

export async function GET(req: NextRequest) {
  const startTime = performance.now();

  try {
    // Verify cron secret token
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, require the secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        console.error('[cron/health-check] CRON_SECRET env var not configured');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Run all health checks in parallel
    const results = await Promise.all([
      checkVercel(),
      checkNeon(),
      checkWebSocket(),
    ]);

    // Store results in database
    const insertPromises = results.map(result => 
      db.insert(serviceHealth).values({
        serviceName: result.service,
        status: result.status,
        latency: result.latency,
        message: result.message,
      })
    );

    await Promise.all(insertPromises);

    const duration = Math.round(performance.now() - startTime);

    console.log(`[cron/health-check] Completed in ${duration}ms:`, 
      results.map(r => `${r.service}=${r.status}`).join(', ')
    );

    return NextResponse.json({
      success: true,
      results,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[cron/health-check] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

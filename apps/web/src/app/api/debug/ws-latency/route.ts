/**
 * Debug: Measure Vercel → Fly.io WebSocket server latency
 * GET /api/debug/ws-latency
 * 
 * This helps diagnose cross-provider networking overhead.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WS_BROADCAST_URL = process.env.WS_BROADCAST_URL || 'http://localhost:3001/broadcast';
const WS_HEALTH_URL = process.env.NEXT_PUBLIC_WS_URL 
  ? `${process.env.NEXT_PUBLIC_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`
  : 'http://localhost:3001/health';

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
  };

  // Test 1: Health endpoint (GET)
  const healthStart = performance.now();
  try {
    const healthRes = await fetch(WS_HEALTH_URL, { 
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    const healthData = await healthRes.json();
    results.healthCheck = {
      latencyMs: Math.round(performance.now() - healthStart),
      flyRegion: healthData.fly?.region,
      serverProcessMs: healthData.timing?.processTimeMs,
      dbLatencyMs: healthData.timing?.dbLatencyMs,
    };
  } catch (e) {
    results.healthCheck = { 
      error: e instanceof Error ? e.message : 'Failed',
      latencyMs: Math.round(performance.now() - healthStart),
    };
  }

  // Test 2: Broadcast endpoint (POST) - simulates message sending
  const broadcastStart = performance.now();
  try {
    const broadcastRes = await fetch(WS_BROADCAST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'debug:latency-test',
        message: { type: 'ping', t: Date.now() },
      }),
      signal: AbortSignal.timeout(5000),
    });
    const broadcastData = await broadcastRes.json();
    results.broadcast = {
      latencyMs: Math.round(performance.now() - broadcastStart),
      success: broadcastData.success,
    };
  } catch (e) {
    results.broadcast = { 
      error: e instanceof Error ? e.message : 'Failed',
      latencyMs: Math.round(performance.now() - broadcastStart),
    };
  }

  // Test 3: Multiple broadcasts (simulate burst)
  const burstResults: number[] = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    try {
      await fetch(WS_BROADCAST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'debug:burst-test',
          message: { type: 'ping', i, t: Date.now() },
        }),
        signal: AbortSignal.timeout(5000),
      });
      burstResults.push(Math.round(performance.now() - start));
    } catch {
      burstResults.push(-1);
    }
  }
  results.burstBroadcast = {
    latenciesMs: burstResults,
    avgMs: Math.round(burstResults.filter(x => x > 0).reduce((a, b) => a + b, 0) / burstResults.filter(x => x > 0).length),
  };

  // Analysis
  const healthLatency = typeof results.healthCheck === 'object' && 'latencyMs' in results.healthCheck 
    ? (results.healthCheck as { latencyMs: number }).latencyMs : 0;
  const _broadcastLatency = typeof results.broadcast === 'object' && 'latencyMs' in results.broadcast
    ? (results.broadcast as { latencyMs: number }).latencyMs : 0;
  
  results.analysis = {
    estimatedTlsOverheadMs: Math.max(0, healthLatency - 10), // Assuming ~10ms for actual processing
    suggestion: healthLatency > 100 
      ? 'High latency - consider Redis pub/sub bridge or same-provider deployment'
      : 'Latency acceptable for real-time messaging',
  };

  return NextResponse.json(results);
}

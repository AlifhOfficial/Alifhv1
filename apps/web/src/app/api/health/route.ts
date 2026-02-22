/**
 * Health Check Endpoint
 * 
 * Checks status of all critical services:
 * - Database (Neon)
 * - WebSocket Server
 * - Bun Runtime
 */

import { NextResponse } from 'next/server';
import { db, sql } from '@alifh/database';

// WebSocket health check URL
const WS_HEALTH_URL = process.env.NEXT_PUBLIC_WS_URL 
  ? `${process.env.NEXT_PUBLIC_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`
  : 'http://localhost:3001/health';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    websocket: ServiceStatus;
    runtime: ServiceStatus;
  };
}

/**
 * Check database health
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    // Simple query to check connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 3000)
    );
    
    await Promise.race([
      db.execute(sql`SELECT 1 as health`),
      timeoutPromise
    ]);
    
    const latency = Date.now() - start;
    
    return {
      status: latency < 200 ? 'healthy' : latency < 1000 ? 'degraded' : 'unhealthy',
      latency,
      message: latency < 200 ? 'Connected' : latency < 1000 ? 'Slow response' : 'High latency',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Check WebSocket server health
 */
async function checkWebSocket(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const response = await fetch(WS_HEALTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    
    if (response.ok) {
      // Thresholds adjusted for Cloudflare proxy (adds ~50ms overhead)
      return {
        status: latency < 200 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
        latency,
        message: 'Connected',
      };
    }
    
    return {
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unreachable',
    };
  }
}

/**
 * Check runtime health (Node.js or Bun)
 * Note: Always returns healthy - memory usage is monitored but not flagged as unhealthy
 */
function checkRuntime(): ServiceStatus {
  try {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memPercent = Math.round((memUsedMB / memTotalMB) * 100);
    
    // Detect runtime (Bun or Node)
    const isBun = typeof (globalThis as any).Bun !== 'undefined';
    const runtimeVersion = isBun ? (globalThis as any).Bun.version : process.version;
    const runtimeName = isBun ? 'Bun' : 'Node.js';
    
    return {
      status: 'healthy',
      message: `${runtimeName} ${runtimeVersion} · ${memUsedMB}MB / ${memTotalMB}MB (${memPercent}%)`,
      details: {
        runtime: runtimeName,
        version: runtimeVersion,
        memoryUsed: memUsedMB,
        memoryTotal: memTotalMB,
        memoryPercent: memPercent,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Runtime check failed',
    };
  }
}



/**
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  
  // Run all health checks in parallel
  const [database, websocket, runtime] = await Promise.all([
    checkDatabase(),
    checkWebSocket(),
    checkRuntime(),
  ]);
  
  // Determine overall status
  // Only database and runtime are critical - WebSocket is supplementary
  const services = { database, websocket, runtime };
  const criticalServices = [database, runtime];
  const criticalStatuses = criticalServices.map(s => s.status);
  
  // Overall is healthy if critical services are healthy or degraded
  const overallStatus = criticalStatuses.includes('unhealthy') 
    ? 'unhealthy' 
    : criticalStatuses.includes('degraded') 
    ? 'degraded' 
    : 'healthy';
  
  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services,
  };
  
  // Return 200 for healthy and degraded, 503 only for unhealthy
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  
  return NextResponse.json(response, { status: statusCode });
}

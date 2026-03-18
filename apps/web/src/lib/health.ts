import { db, sql } from '@alifh/database';

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    websocket: ServiceStatus;
    runtime: ServiceStatus;
  };
}

const healthResponseCache = new Map<
  number,
  {
    result: HealthCheckResponse;
    expiresAt: number;
  }
>();

const WS_HEALTH_URL = process.env.NEXT_PUBLIC_WS_URL
  ? `${process.env.NEXT_PUBLIC_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')}/health`
  : 'http://localhost:3001/health';

let wsHealthCache: { result: ServiceStatus; timestamp: number } | null = null;
const WS_CACHE_TTL = 30_000;

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 3000)
    );

    await Promise.race([
      db.execute(sql`SELECT 1 as health`),
      timeoutPromise,
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

async function checkWebSocket(): Promise<ServiceStatus> {
  if (wsHealthCache && Date.now() - wsHealthCache.timestamp < WS_CACHE_TTL) {
    return {
      ...wsHealthCache.result,
      details: {
        ...wsHealthCache.result.details,
        cached: true,
        cacheAge: Math.round((Date.now() - wsHealthCache.timestamp) / 1000),
      },
    };
  }

  const start = Date.now();
  try {
    const response = await fetch(WS_HEALTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    const flyRequestId = response.headers.get('fly-request-id');
    const flyRegion = flyRequestId?.split('-').pop() ?? 'unknown';
    const vercelRegion = process.env.VERCEL_REGION ?? 'local';

    if (response.ok) {
      const result: ServiceStatus = {
        status: 'healthy',
        latency,
        message: 'Connected',
        details: {
          route: `${vercelRegion} -> ${flyRegion}`,
          vercelRegion,
          flyRegion,
          cached: false,
        },
      };
      wsHealthCache = { result, timestamp: Date.now() };
      return result;
    }

    const result: ServiceStatus = {
      status: 'unhealthy',
      latency,
      message: `HTTP ${response.status}`,
      details: { vercelRegion, flyRegion, cached: false },
    };
    wsHealthCache = { result, timestamp: Date.now() };
    return result;
  } catch (error) {
    const result: ServiceStatus = {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unreachable',
      details: { vercelRegion: process.env.VERCEL_REGION ?? 'local', cached: false },
    };
    wsHealthCache = { result, timestamp: Date.now() - WS_CACHE_TTL + 10_000 };
    return result;
  }
}

function checkRuntime(): ServiceStatus {
  try {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memPercent = Math.round((memUsedMB / memTotalMB) * 100);
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

export async function getHealthCheckResponse(): Promise<HealthCheckResponse> {
  const [database, websocket, runtime] = await Promise.all([
    checkDatabase(),
    checkWebSocket(),
    Promise.resolve(checkRuntime()),
  ]);

  const criticalStatuses = [database, runtime].map((service) => service.status);
  const overallStatus = criticalStatuses.includes('unhealthy')
    ? 'unhealthy'
    : criticalStatuses.includes('degraded')
      ? 'degraded'
      : 'healthy';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: { database, websocket, runtime },
  };
}

export async function getCachedHealthCheckResponse(ttlMs: number): Promise<HealthCheckResponse> {
  const now = Date.now();
  const cached = healthResponseCache.get(ttlMs);

  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  const result = await getHealthCheckResponse();

  healthResponseCache.set(ttlMs, {
    result,
    expiresAt: now + ttlMs,
  });

  return result;
}

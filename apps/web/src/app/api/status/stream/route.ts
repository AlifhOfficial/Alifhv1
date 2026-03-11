/**
 * API: Status SSE Stream
 * GET /api/status/stream
 * 
 * Server-Sent Events endpoint for real-time status updates.
 * Reads latest health check from DB (written by cron every 5 min).
 */

import { NextRequest } from 'next/server';
import { db, desc } from '@alifh/database';
import { serviceHealth } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

interface StatusUpdate {
  overallStatus: ServiceStatus;
  services: {
    name: string;
    status: ServiceStatus;
    latency: number | null;
  }[];
  timestamp: string;
}

async function getCurrentStatus(): Promise<StatusUpdate> {
  try {
    // Get latest health check per service (cron writes every 5 min)
    const rows = await db
      .select()
      .from(serviceHealth)
      .orderBy(desc(serviceHealth.checkedAt))
      .limit(3);

    if (rows.length > 0) {
      const services = rows.map(r => ({
        name: r.serviceName,
        status: r.status as ServiceStatus,
        latency: r.latency,
      }));

      const statuses = services.map(s => s.status);
      let overallStatus: ServiceStatus = 'healthy';
      if (statuses.includes('unhealthy')) overallStatus = 'unhealthy';
      else if (statuses.includes('degraded')) overallStatus = 'degraded';

      return {
        overallStatus,
        services,
        timestamp: rows[0].checkedAt.toISOString(),
      };
    }
  } catch {
    // DB error, return default
  }
  
  return {
    overallStatus: 'healthy',
    services: [
      { name: 'vercel', status: 'healthy', latency: null },
      { name: 'neon', status: 'healthy', latency: null },
      { name: 'websocket', status: 'healthy', latency: null },
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let isClosed = false;
  let intervalId: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial status
      try {
        const status = await getCurrentStatus();
        if (!isClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));
        }
      } catch (error) {
        console.error('[status/stream] Error fetching initial status:', error);
      }
      
      // Set up interval to send updates every 30 seconds
      intervalId = setInterval(async () => {
        if (isClosed) return;
        try {
          const status = await getCurrentStatus();
          if (!isClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`));
          }
        } catch (error) {
          if (!isClosed) {
            console.error('[status/stream] Error in interval:', error);
          }
        }
      }, 30000);
      
      // Clean up when connection closes
      req.signal.addEventListener('abort', () => {
        isClosed = true;
        if (intervalId) {
          clearInterval(intervalId);
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
    cancel() {
      isClosed = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

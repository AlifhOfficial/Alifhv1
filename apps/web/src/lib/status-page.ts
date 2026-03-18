import { getCachedHealthCheckResponse } from '@/lib/health';

export type StatusPageServiceName = 'vercel' | 'neon' | 'websocket';
export type StatusPageServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface StatusPageDayStatus {
  date: string;
  status: StatusPageServiceStatus;
  uptimePercent: number;
}

export interface StatusPageServiceData {
  name: StatusPageServiceName;
  displayName: string;
  currentStatus: StatusPageServiceStatus;
  currentLatency: number | null;
  currentMessage: string | null;
  uptimePercent90d: number;
  history: StatusPageDayStatus[];
}

export interface StatusPageResponse {
  overallStatus: StatusPageServiceStatus;
  services: StatusPageServiceData[];
  incidents: [];
  lastUpdated: string;
}

const SERVICE_DISPLAY_NAMES: Record<StatusPageServiceName, string> = {
  vercel: 'Web Application',
  neon: 'Database',
  websocket: 'WebSocket Server',
};

export const STATUS_PAGE_CACHE_TTL_MS = 60 * 60 * 1000;

function buildServiceData(
  name: StatusPageServiceName,
  status: {
    status: StatusPageServiceStatus;
    latency?: number;
    message?: string;
  },
): StatusPageServiceData {
  return {
    name,
    displayName: SERVICE_DISPLAY_NAMES[name],
    currentStatus: status.status,
    currentLatency: status.latency ?? null,
    currentMessage: status.message ?? null,
    uptimePercent90d: 100,
    history: [],
  };
}

export async function getCachedStatusPageData(): Promise<StatusPageResponse> {
  const health = await getCachedHealthCheckResponse(STATUS_PAGE_CACHE_TTL_MS);

  return {
    overallStatus: health.status,
    services: [
      buildServiceData('vercel', health.services.runtime),
      buildServiceData('neon', health.services.database),
      buildServiceData('websocket', health.services.websocket),
    ],
    incidents: [],
    lastUpdated: health.timestamp,
  };
}

export function getStatusPageFallbackData(): StatusPageResponse {
  return {
    overallStatus: 'healthy',
    services: [
      {
        name: 'vercel',
        displayName: 'Web Application',
        currentStatus: 'healthy',
        currentLatency: 0,
        currentMessage: 'Operational',
        uptimePercent90d: 100,
        history: [],
      },
      {
        name: 'neon',
        displayName: 'Database',
        currentStatus: 'healthy',
        currentLatency: 0,
        currentMessage: 'Operational',
        uptimePercent90d: 100,
        history: [],
      },
      {
        name: 'websocket',
        displayName: 'WebSocket Server',
        currentStatus: 'healthy',
        currentLatency: 0,
        currentMessage: 'Operational',
        uptimePercent90d: 100,
        history: [],
      },
    ],
    incidents: [],
    lastUpdated: new Date().toISOString(),
  };
}

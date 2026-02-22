/**
 * API: Status Page Data
 * GET /api/status
 * 
 * Returns aggregated health data for status page:
 * - Current status of all services
 * - 90-day history for bar charts
 * - Active incidents
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, sql, desc, and, gte } from '@alifh/database';
import { serviceHealth, statusIncident, incidentUpdate } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ServiceName = 'vercel' | 'neon' | 'websocket' | 'api';
type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

interface DayStatus {
  date: string;
  status: ServiceStatus;
  uptimePercent: number;
}

interface ServiceData {
  name: ServiceName;
  displayName: string;
  currentStatus: ServiceStatus;
  currentLatency: number | null;
  currentMessage: string | null;
  uptimePercent90d: number;
  history: DayStatus[];
}

interface IncidentData {
  id: number;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  affectedServices: string[];
  startedAt: string;
  resolvedAt: string | null;
  updates: {
    status: string;
    message: string;
    createdAt: string;
  }[];
}

const SERVICE_DISPLAY_NAMES: Record<ServiceName, string> = {
  vercel: 'Web Application',
  neon: 'Database',
  websocket: 'WebSocket Server',
  api: 'API Services',
};

/**
 * Get the latest status for each service
 */
async function getCurrentStatus(): Promise<Map<ServiceName, { status: ServiceStatus; latency: number | null; message: string | null }>> {
  const results = new Map<ServiceName, { status: ServiceStatus; latency: number | null; message: string | null }>();
  
  const services: ServiceName[] = ['vercel', 'neon', 'websocket', 'api'];
  
  for (const service of services) {
    const latest = await db
      .select()
      .from(serviceHealth)
      .where(sql`${serviceHealth.serviceName} = ${service}`)
      .orderBy(desc(serviceHealth.checkedAt))
      .limit(1);
    
    if (latest.length > 0) {
      results.set(service, {
        status: latest[0].status as ServiceStatus,
        latency: latest[0].latency,
        message: latest[0].message,
      });
    } else {
      results.set(service, {
        status: 'unhealthy',
        latency: null,
        message: 'No data',
      });
    }
  }
  
  return results;
}

/**
 * Get 90-day history for a service, aggregated by day
 */
async function get90DayHistory(service: ServiceName): Promise<{ history: DayStatus[]; uptimePercent: number }> {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  // Get all checks in the last 90 days
  const checks = await db
    .select()
    .from(serviceHealth)
    .where(and(
      sql`${serviceHealth.serviceName} = ${service}`,
      gte(serviceHealth.checkedAt, ninetyDaysAgo)
    ))
    .orderBy(serviceHealth.checkedAt);
  
  // Group by day
  const dayMap = new Map<string, { healthy: number; degraded: number; unhealthy: number; total: number }>();
  
  for (const check of checks) {
    const date = check.checkedAt.toISOString().split('T')[0];
    const existing = dayMap.get(date) || { healthy: 0, degraded: 0, unhealthy: 0, total: 0 };
    existing[check.status as ServiceStatus]++;
    existing.total++;
    dayMap.set(date, existing);
  }
  
  // Generate array for all 90 days
  const history: DayStatus[] = [];
  let totalHealthy = 0;
  let totalChecks = 0;
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dayMap.get(dateStr);
    
    if (dayData) {
      totalHealthy += dayData.healthy;
      totalChecks += dayData.total;
      
      // Determine day status based on majority
      let status: ServiceStatus;
      const healthyPercent = (dayData.healthy / dayData.total) * 100;
      const unhealthyPercent = (dayData.unhealthy / dayData.total) * 100;
      
      if (unhealthyPercent > 10) {
        status = 'unhealthy';
      } else if (healthyPercent >= 90) {
        status = 'healthy';
      } else {
        status = 'degraded';
      }
      
      history.push({
        date: dateStr,
        status,
        uptimePercent: Math.round(healthyPercent * 10) / 10,
      });
    } else {
      // No data for this day - show as unknown/healthy (no incidents)
      history.push({
        date: dateStr,
        status: 'healthy',
        uptimePercent: 100,
      });
    }
  }
  
  const uptimePercent = totalChecks > 0 
    ? Math.round((totalHealthy / totalChecks) * 10000) / 100 
    : 100;
  
  return { history, uptimePercent };
}

/**
 * Get active incidents
 */
async function getActiveIncidents(): Promise<IncidentData[]> {
  const incidents = await db
    .select()
    .from(statusIncident)
    .where(sql`${statusIncident.status} != 'resolved'`)
    .orderBy(desc(statusIncident.startedAt));
  
  const result: IncidentData[] = [];
  
  for (const incident of incidents) {
    const updates = await db
      .select()
      .from(incidentUpdate)
      .where(sql`${incidentUpdate.incidentId} = ${incident.id}`)
      .orderBy(desc(incidentUpdate.createdAt));
    
    result.push({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      severity: incident.severity,
      affectedServices: incident.affectedServices || [],
      startedAt: incident.startedAt.toISOString(),
      resolvedAt: incident.resolvedAt?.toISOString() || null,
      updates: updates.map(u => ({
        status: u.status,
        message: u.message,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  }
  
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const currentStatus = await getCurrentStatus();
    
    // Build service data with history
    const services: ServiceData[] = [];
    const serviceNames: ServiceName[] = ['vercel', 'neon', 'websocket', 'api'];
    
    for (const name of serviceNames) {
      const current = currentStatus.get(name)!;
      const { history, uptimePercent } = await get90DayHistory(name);
      
      services.push({
        name,
        displayName: SERVICE_DISPLAY_NAMES[name],
        currentStatus: current.status,
        currentLatency: current.latency,
        currentMessage: current.message,
        uptimePercent90d: uptimePercent,
        history,
      });
    }
    
    // Determine overall status
    const statuses = services.map(s => s.currentStatus);
    let overallStatus: ServiceStatus;
    
    if (statuses.some(s => s === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.some(s => s === 'degraded')) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    // Get active incidents
    const incidents = await getActiveIncidents();
    
    return NextResponse.json({
      overallStatus,
      services,
      incidents,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[api/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

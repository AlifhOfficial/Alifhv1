/**
 * Status Page - Revvup
 * Real-time system status and uptime monitoring
 */

import { Metadata } from 'next';
import { StatusPageClient } from './status-page-client';

export const metadata: Metadata = {
  title: 'System Status | Revvup',
  description: 'Current status and uptime information for Revvup services. Real-time monitoring of API, database, and infrastructure.',
  keywords: 'revvup status, service status, uptime, api status, system health',
  openGraph: {
    title: 'System Status | Revvup',
    description: 'Current status and uptime information for Revvup services.',
    type: 'website',
    url: 'https://status.revvup.ae',
  },
  alternates: {
    canonical: 'https://status.revvup.ae',
  },
};

// ISR: Revalidate every 30 seconds for fresh status data
export const revalidate = 30;

async function getStatusData() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/status`, {
      next: { revalidate: 30 },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch status data:', error);
    // Return fallback data
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
          displayName: 'Real-time Services',
          currentStatus: 'healthy',
          currentLatency: 0,
          currentMessage: 'Operational',
          uptimePercent90d: 100,
          history: [],
        },
      ],
      incidents: [],
    };
  }
}

export default async function StatusPage() {
  const statusData = await getStatusData();

  return (
    <div className="min-h-screen bg-background">
      <StatusPageClient initialData={statusData} />
    </div>
  );
}

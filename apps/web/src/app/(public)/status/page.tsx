/**
 * Status Page - Revvup
 * On-demand system status and uptime monitoring
 */

import { Metadata } from 'next';
import { StatusPageClient } from './status-page-client';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';
import {
  getCachedStatusPageData,
  getStatusPageFallbackData,
} from '@/lib/status-page';

export const metadata: Metadata = {
  title: 'System Status | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'revvup status, service status, uptime, api status, system health',
  openGraph: {
    title: 'System Status | Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
    url: 'https://status.revvup.ae',
  },
  alternates: {
    canonical: 'https://status.revvup.ae',
  },
};


async function getStatusData() {
  try {
    return await getCachedStatusPageData();
  } catch (error) {
    console.error('Failed to fetch status data:', error);
    return getStatusPageFallbackData();
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

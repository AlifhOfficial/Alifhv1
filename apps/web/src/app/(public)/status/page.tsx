/**
 * Status Page - Revvup
 * On-demand system status and uptime monitoring
 */

import { Metadata } from 'next';
import { StatusPageClient } from './status-page-client';
const STATUS_META_DESCRIPTION =
  'Revvup system status and uptime. Check service health, incidents, and maintenance updates.';
import {
  getCachedStatusPageData,
  getStatusPageFallbackData,
} from '@/lib/status-page';

export const metadata: Metadata = {
  title: 'System Status | Revvup',
  description: STATUS_META_DESCRIPTION,
  keywords: 'revvup status, service status, uptime, api status, system health',
  openGraph: {
    title: 'System Status | Revvup',
    description: STATUS_META_DESCRIPTION,
    type: 'website',
    url: 'https://status.revvup.ae',
  },
  alternates: {
    canonical: 'https://status.revvup.ae',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System Status | Revvup',
    description: STATUS_META_DESCRIPTION,
    images: ['/twitter-image'],
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

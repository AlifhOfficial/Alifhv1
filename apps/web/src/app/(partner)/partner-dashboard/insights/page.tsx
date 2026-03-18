/**
 * Partner Insights Page
 * Shows business metrics and actionable insights
 */

import { redirect } from 'next/navigation';
import { getPartnerDescriptiveStats } from '@alifh/database';
import { PartnerInsightsView } from '@/components/partner/insights';
import { getSessionUser } from '@/lib/auth/session-context';
import { getCachedHealthCheckResponse } from '@/lib/health';

const DASHBOARD_HEALTH_CACHE_TTL_MS = 60 * 60 * 1000;

export default async function PartnerInsightsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/insights');
  }

  const partnerMembership = (user as any).partnerMemberships?.find(
    (membership: any) =>
      membership.staffRole === 'owner' ||
      membership.staffRole === 'admin' ||
      membership.staffRole === 'manager'
  );

  if (!partnerMembership) {
    redirect('/access-denied?reason=not-partner-manager');
  }

  const [stats, health] = await Promise.all([
    getPartnerDescriptiveStats(partnerMembership.partnerId),
    getCachedHealthCheckResponse(DASHBOARD_HEALTH_CACHE_TTL_MS),
  ]);

  return (
    <PartnerInsightsView
      user={user}
      initialStats={stats as any}
      initialHealth={health}
    />
  );
}

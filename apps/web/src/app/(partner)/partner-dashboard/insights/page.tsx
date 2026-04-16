/**
 * Partner Insights Page
 * Shows business metrics and actionable insights
 */

import { redirect } from 'next/navigation';
import { PartnerInsightsView } from '@/components/partner/insights';
import { getSessionUser } from '@/lib/auth/session-context';
import { getCachedPartnerDescriptiveStats } from '@/lib/partner-stats-cache';

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

  const stats = await getCachedPartnerDescriptiveStats(partnerMembership.partnerId);

  return (
    <PartnerInsightsView
      user={user}
      initialStats={stats as any}
    />
  );
}

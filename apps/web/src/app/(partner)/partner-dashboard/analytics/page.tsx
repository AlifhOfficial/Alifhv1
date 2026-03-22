/**
 * Partner Analytics Page
 * 
 * Advanced insights with detailed composition and performance metrics.
 */

import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getSessionUser } from '@/lib/auth/session-context';
import { getCachedPartnerDescriptiveStats } from '@/lib/partner-stats-cache';

const AdvancedStatsView = dynamic(
  () => import('@/components/partner/insights/advanced-stats-view').then(mod => mod.AdvancedStatsView)
);

export default async function PartnerAnalyticsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/analytics');
  }

  const membership = (user as any).partnerMemberships?.find((m: any) =>
    m.staffRole === 'owner' || m.staffRole === 'admin' || m.staffRole === 'manager'
  );
  if (!membership) {
    redirect('/access-denied?reason=not-partner-manager');
  }

  const stats = await getCachedPartnerDescriptiveStats(membership.partnerId);
  return <AdvancedStatsView initialStats={stats as any} />;
}

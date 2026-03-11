/**
 * Partner Showroom Editor Page
 * Black tier exclusive - premium brand manifesto editor
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { PartnerShowroomForm } from '@/components/partner/car-dealer/partner-showroom-form';

export default async function PartnerShowroomPage() {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  // Get the first active Black tier partner membership
  const membership = (user as any).partnerMemberships?.find(
    (m: any) => m.partnerTier === 'black' && ['owner', 'admin'].includes(m.staffRole)
  );

  if (!membership) {
    redirect('/partner-dashboard');
  }

  return <PartnerShowroomForm partnerId={membership.partnerId} />;
}

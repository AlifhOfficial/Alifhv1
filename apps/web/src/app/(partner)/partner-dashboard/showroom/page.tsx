/**
 * Partner Showroom Editor Page
 * Black tier exclusive - premium brand manifesto editor
 */

'use client';

import { PartnerShowroomForm } from '@/components/partner/car-dealer/partner-showroom-form';
import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';

export default function PartnerShowroomPage() {
  const { session } = useAuth();
  
  if (!session) redirect('/');

  // Get the first active Black tier partner membership
  const membership = (session as any).partnerMemberships?.find(
    (m: any) => m.partnerTier === 'black' && ['owner', 'admin'].includes(m.staffRole)
  );

  if (!membership) {
    // Not a Black tier partner with proper permissions
    redirect('/partner-dashboard');
  }

  return <PartnerShowroomForm partnerId={membership.partnerId} />;
}

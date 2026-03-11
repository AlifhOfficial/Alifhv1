/**
 * Partner Bookings Dashboard Page
 * Shows all bookings for the partner's dealership with staff filtering
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { PartnerBookingsClient } from '@/components/features/bookings/partner/partner-bookings-client';

export default async function PartnerBookingsPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/bookings');
  }

  const partnerMembership = (user as any).partnerMemberships?.[0];
  
  if (!partnerMembership) {
    redirect('/partner-dashboard');
  }

  return (
    <PartnerBookingsClient
      partnerId={partnerMembership.partnerId}
      partnerName={partnerMembership.partnerName}
    />
  );
}

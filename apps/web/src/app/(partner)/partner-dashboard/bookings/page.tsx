/**
 * Partner Bookings Dashboard Page
 * Shows all bookings for the partner's dealership with staff filtering
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { PartnerBookingsClient } from '@/components/features/bookings/partner/partner-bookings-client';

export const runtime = 'nodejs';

export default async function PartnerBookingsPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/auth/sign-in?redirect=/partner-dashboard/bookings');
  }

  // Get partner membership
  const partnerMembership = user.partnerMemberships?.[0];
  
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

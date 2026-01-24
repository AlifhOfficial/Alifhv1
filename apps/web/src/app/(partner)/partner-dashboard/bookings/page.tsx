/**
 * Partner Bookings Dashboard Page
 * Shows all bookings for the partner's dealership with staff filtering
 */

'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { PartnerBookingsClient } from '@/components/features/bookings/partner/partner-bookings-client';

export default function PartnerBookingsPage() {
  const { session } = useAuth();
  
  if (!session) {
    redirect('/?auth=signin&redirect=/partner-dashboard/bookings');
  }

  // Get partner membership
  const partnerMembership = (session as any).partnerMemberships?.[0];
  
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

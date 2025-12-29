/**
 * Partner Application Status Component
 * 
 * Displays the user's partner application status in their dashboard
 * Used by UserRequestsHub when user has an existing application
 * Parent component handles loading/no-application states
 * 
 * Note: Only shows pending/approved status. Rejected status is hidden from overview.
 */

'use client';

import { PartnerRequestStatusCard } from '@/components/partner';
import { usePartnerRequest } from '@/hooks/partner';

export function PartnerApplicationStatus() {
  const { data: request } = usePartnerRequest();
  
  // Don't show rejected applications on the overview page
  // They should only appear in the requests page
  if (!request || request.status === 'rejected') {
    return null;
  }
  
  return <PartnerRequestStatusCard />;
}

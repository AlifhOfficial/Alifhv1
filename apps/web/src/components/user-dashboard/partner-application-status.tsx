/**
 * Partner Application Status Component
 * 
 * Displays the user's partner application status in their dashboard
 * Used by UserRequestsHub when user has an existing application
 * Parent component handles loading/no-application states
 */

'use client';

import { PartnerRequestStatusCard } from '@/components/partner';

export function PartnerApplicationStatus() {
  // Simply render the status card - parent handles loading state
  return <PartnerRequestStatusCard />;
}

/**
 * Partner Staff Management Page
 */

import { StaffOverview } from '@/components/partner/staff-overview';

export const dynamic = 'force-dynamic';

export default function PartnerStaffPage() {
  return (
    <div className="space-y-6">
      <StaffOverview />
    </div>
  );
}

/**
 * Staff Profile Page
 * Edit work identity settings
 */

import { StaffProfile } from '@/components/partner/staff-profile';

export const dynamic = 'force-dynamic';

export default function StaffProfilePage() {
  return (
    <div className="space-y-6">
      <StaffProfile />
    </div>
  );
}

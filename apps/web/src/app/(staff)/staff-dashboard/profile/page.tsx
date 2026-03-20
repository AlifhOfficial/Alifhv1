import { getSessionUser } from '@/lib/auth/session-context';
import { getStaffProfileWithPartnerById } from '@alifh/database';
import { getCurrentUserProfileBundle } from '@/lib/current-user-profile';
import { StaffProfileForm } from "@/components/staff/staff-profile-form";

export default async function StaffProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;
  const staffId = user.partnerMemberships?.[0]?.staffId;
  if (!staffId) return null;

  const [staffProfile, initialUserProfile] = await Promise.all([
    getStaffProfileWithPartnerById(staffId),
    getCurrentUserProfileBundle(user),
  ]);

  return <StaffProfileForm initialProfile={staffProfile as any} initialUserProfile={initialUserProfile} />;
}

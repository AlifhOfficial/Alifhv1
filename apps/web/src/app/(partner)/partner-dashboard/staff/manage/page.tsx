/**
 * Partner Staff Management Page
 * Full team management with invite and operations
 */

import { redirect } from 'next/navigation';
import { getPartnerStaff } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { PartnerStaffManagement } from '@/components/partner/staff-management';

const INVITE_EXPIRY_DAYS = 7;
const INVITE_EXPIRY_MS = INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export default async function PartnerStaffManagePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/staff/manage');
  }

  const membership = user.partnerMemberships?.[0];
  if (!membership) {
    redirect('/partner-dashboard');
  }

  const staff = await getPartnerStaff(membership.partnerId);
  const invites = staff
    .filter((member) => member.status === 'invited')
    .map((member) => ({
      id: member.id,
      email: member.userEmail || '',
      role: member.role,
      expiresAt: new Date(
        new Date(member.invitedAt ?? member.joinedAt ?? member.leftAt ?? '1970-01-01').getTime() + INVITE_EXPIRY_MS
      ).toISOString(),
    }));

  return <PartnerStaffManagement initialTeamData={{ data: staff, invites }} />;
}

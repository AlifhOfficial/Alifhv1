import { redirect } from 'next/navigation';
import { getPartnerStaff } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { StaffOverview } from '@/components/partner/staff-overview';

const INVITE_EXPIRY_DAYS = 7;

export default async function PartnerStaffPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/staff');
  }

  const membership = user.partnerMemberships?.[0];
  if (!membership) {
    redirect('/partner-dashboard');
  }

  const staff = await getPartnerStaff(membership.partnerId);
  let totalStaff = 0;
  let activeStaff = 0;
  let pendingInvites = 0;
  let managers = 0;
  const invites: Array<{ id: string; email: string; role: string; expiresAt: string }> = [];

  for (const member of staff) {
    if (member.status === 'invited') {
      pendingInvites++;
      const expiresAt = member.invitedAt
        ? new Date(new Date(member.invitedAt).getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
      invites.push({
        id: member.id,
        email: member.userEmail || '',
        role: member.role,
        expiresAt,
      });
      continue;
    }

    totalStaff++;
    if (member.status === 'active') {
      activeStaff++;
      if (['owner', 'admin', 'manager'].includes(member.role)) managers++;
    }
  }

  return (
    <div className="space-y-6">
      <StaffOverview
        initialData={{
          data: staff as any,
          stats: { totalStaff, activeStaff, pendingInvites, managers },
          invites,
        }}
      />
    </div>
  );
}

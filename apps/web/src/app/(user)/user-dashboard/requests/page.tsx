/**
 * User Requests Page
 * Combines Partner Application and Staff Invites in one place
 */

import { getSessionUser } from '@/lib/auth/session-context';
import { getPartnerRequestByUserId, getUserStaffInvites } from '@alifh/database';
import { UserRequestsHub } from '@/components/dashboards/user/user-requests-hub';

export default async function UserRequestsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [partnerRequest, invites] = await Promise.all([
    getPartnerRequestByUserId(user.id),
    getUserStaffInvites(user.id),
  ]);

  return <UserRequestsHub initialPartnerRequest={partnerRequest} initialInvites={invites} />;
}

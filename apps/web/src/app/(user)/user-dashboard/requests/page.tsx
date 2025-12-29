/**
 * User Requests Page
 * Combines Partner Application and Staff Invites in one place
 */

import { UserRequestsHub } from '@/components/dashboards/user/user-requests-hub';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Requests - User Dashboard',
  description: 'Manage your partner applications and staff invitations',
};

export default async function UserRequestsPage() {
  return <UserRequestsHub />;
}

/**
 * User Requests Page
 * Combines Partner Application and Staff Invites in one place
 */

import { DashboardPageLayout } from '@/components/layout';
import { UserRequestsHub } from '@/components/user-dashboard/user-requests-hub';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Requests - User Dashboard',
  description: 'Manage your partner applications and staff invitations',
};

export default async function UserRequestsPage() {
  return (
    <DashboardPageLayout title="Requests">
      <div className="p-6">
        <UserRequestsHub />
      </div>
    </DashboardPageLayout>
  );
}

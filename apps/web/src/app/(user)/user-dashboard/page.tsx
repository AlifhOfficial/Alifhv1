import { UserDashboardOverview } from '@/components/user-dashboard/user-dashboard-overview';
import { getSessionUser } from '@/lib/auth/session-context';

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  const user = await getSessionUser();

  return <UserDashboardOverview user={user} />;
}

import { UserDashboardOverview } from '@/components/dashboards/user/user-dashboard-overview';
import { getSessionUser } from '@/lib/auth/session-context';

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  const user = await getSessionUser();

  return <UserDashboardOverview user={user} />;
}

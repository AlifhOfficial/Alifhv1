import { getSessionUser } from '@/lib/auth/session-context';
import { UserDashboardOverview } from '@/components/dashboards/user/user-dashboard-overview';
import { getCachedUserDashboardStats } from '@/lib/dashboard-cache';

export default async function UserDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const stats = await getCachedUserDashboardStats(user.id);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toISOString()
    : null;

  return (
    <UserDashboardOverview
      user={user}
      initialStats={{ ...stats, memberSince }}
    />
  );
}

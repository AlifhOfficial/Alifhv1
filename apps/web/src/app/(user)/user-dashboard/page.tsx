import { getSessionUser } from '@/lib/auth/session-context';
import { getUserDashboardStats, getTotalUnreadCount } from '@alifh/database';
import { UserDashboardOverview } from '@/components/dashboards/user/user-dashboard-overview';
import { getHealthCheckResponse } from '@/lib/health';

export default async function UserDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const [stats, unreadCount, health] = await Promise.all([
    getUserDashboardStats(user.id),
    getTotalUnreadCount(user.id),
    getHealthCheckResponse(),
  ]);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toISOString()
    : null;

  return (
    <UserDashboardOverview
      user={user}
      initialStats={{ ...stats, memberSince }}
      initialUnreadCount={unreadCount}
      initialHealth={health}
    />
  );
}

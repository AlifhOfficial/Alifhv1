import { getSessionUser } from '@/lib/auth/session-context';
import { getTotalUnreadCount, getUserDashboardStats } from '@alifh/database';
import { UserDashboardOverview } from '@/components/dashboards/user/user-dashboard-overview';
import { getCachedHealthCheckResponse } from '@/lib/health';

const DASHBOARD_HEALTH_CACHE_TTL_MS = 60 * 60 * 1000;

export default async function UserDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const [stats, unreadCount, health] = await Promise.all([
    getUserDashboardStats(user.id),
    getTotalUnreadCount(user.id),
    getCachedHealthCheckResponse(DASHBOARD_HEALTH_CACHE_TTL_MS),
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

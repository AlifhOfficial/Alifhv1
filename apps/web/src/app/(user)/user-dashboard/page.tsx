import { getSessionUser } from '@/lib/auth/session-context';
import { UserDashboardOverview } from '@/components/dashboards/user/user-dashboard-overview';
import { getCachedHealthCheckResponse } from '@/lib/health';
import { getCachedUserDashboardStats } from '@/lib/dashboard-cache';

const DASHBOARD_HEALTH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default async function UserDashboard() {
  const user = await getSessionUser();
  if (!user) return null;

  const [stats, health] = await Promise.all([
    getCachedUserDashboardStats(user.id),
    getCachedHealthCheckResponse(DASHBOARD_HEALTH_CACHE_TTL_MS),
  ]);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toISOString()
    : null;

  return (
    <UserDashboardOverview
      user={user}
      initialStats={{ ...stats, memberSince }}
      initialHealth={health}
    />
  );
}

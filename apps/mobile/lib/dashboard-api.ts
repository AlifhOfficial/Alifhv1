/**
 * User Dashboard API Client - Mobile
 *
 * Fetches stats used on the user dashboard.
 * Endpoint: /api/user/dashboard
 */

import { API_BASE } from './config';
import { getStoredSession } from './auth-api';

// ============================================================================
// TYPES
// ============================================================================

export interface UserDashboardStats {
  // Listings
  activeListings: number;
  totalListings: number;
  expiringSoon: number;

  // Engagement
  totalViews: number;
  totalSaves: number;
  avgViewsPerListing: number;
  saveRate: number;

  // Sales
  soldCount: number;

  // User activity
  mySaves: number;
  superlikesUsed: number;
  superlikesRemaining: number;

  // Member info
  memberSince: string | null;

  // Trend data
  viewsTrend: Array<{ date: string; views: number }>;
}

export interface DashboardResult {
  success: boolean;
  data?: UserDashboardStats;
  error?: string;
}

// ============================================================================
// API
// ============================================================================

/**
 * Fetch user dashboard stats
 */
export async function fetchUserDashboardStats(): Promise<UserDashboardStats> {
  const session = await getStoredSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Origin': API_BASE,
  };

  if (session?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
  }

  const endpoint = '/api/user/dashboard';

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please sign in to view your dashboard stats');
    }

    throw new Error(data?.error || 'Failed to load dashboard stats');
  }

  return data as UserDashboardStats;
}

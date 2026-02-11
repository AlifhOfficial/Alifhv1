/**
 * Notifications API Client
 * Fetches in-app notifications from the API
 */

import { API_BASE } from './config';
import { getSession } from './auth-api';

// ============================================================================
// TYPES
// ============================================================================

export interface AppNotification {
  id: string;
  userId: string;
  type: 
    | 'new_message'
    | 'listing_approved'
    | 'listing_rejected'
    | 'listing_viewed'
    | 'listing_saved'
    | 'new_enquiry'
    | 'price_drop'
    | 'booking_request'
    | 'booking_confirmed'
    | 'booking_reminder'
    | 'promotion'
    | 'system';
  title: string;
  body: string;
  imageUrl: string | null;
  actionUrl: string | null;
  actionData: Record<string, string> | null;
  isRead: boolean;
  readAt: string | null;
  actorId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { session } = await getSession();
  if (!session?.token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.token}`,
  };
}

/**
 * Fetch paginated notifications
 */
export async function fetchNotifications(options?: {
  limit?: number;
  cursor?: string;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> {
  const headers = await getAuthHeaders();

  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.cursor) params.set('cursor', options.cursor);
  if (options?.unreadOnly) params.set('unreadOnly', 'true');

  const url = `${API_BASE}/api/notifications${params.toString() ? `?${params}` : ''}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch only the unread count (lightweight)
 */
export async function fetchUnreadCount(): Promise<number> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/api/notifications?limit=0`,
    { headers }
  );

  if (!response.ok) return 0;

  const data = await response.json();
  return data.unreadCount ?? 0;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<number> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/notifications`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ notificationId }),
  });

  if (!response.ok) throw new Error('Failed to mark notification read');

  const data = await response.json();
  return data.unreadCount ?? 0;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<number> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}/api/notifications`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) throw new Error('Failed to mark all notifications read');

  const data = await response.json();
  return data.unreadCount ?? 0;
}

/**
 * Delete a single notification
 */
export async function deleteNotificationById(notificationId: string): Promise<void> {
  const headers = await getAuthHeaders();

  await fetch(`${API_BASE}/api/notifications`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ notificationId }),
  });
}

/**
 * Delete all notifications
 */
export async function deleteAllNotificationsApi(): Promise<void> {
  const headers = await getAuthHeaders();

  await fetch(`${API_BASE}/api/notifications`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({}),
  });
}

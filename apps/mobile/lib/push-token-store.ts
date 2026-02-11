/**
 * Push Token Store
 * 
 * Module-level storage for the current push token.
 * Extracted to its own file to avoid circular dependency between
 * auth-context and notification-context.
 */

import { API_BASE } from './config';

let _currentPushToken: string | null = null;

/** Store the current push token (called by notification-context) */
export function setCurrentPushToken(token: string | null) {
  _currentPushToken = token;
}

/** Get the current push token */
export function getCurrentPushToken(): string | null {
  return _currentPushToken;
}

/**
 * Unregister push token on logout.
 * Called from auth-context.signOut() without importing notification-context.
 */
export async function unregisterPushTokenOnLogout(): Promise<void> {
  if (!_currentPushToken) return;

  try {
    const response = await fetch(`${API_BASE}/api/push-tokens`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: _currentPushToken }),
    });

    if (response.ok) {
      console.log('[Notifications] Token unregistered on logout');
    }
  } catch (error) {
    console.error('[Notifications] Error unregistering token on logout:', error);
  }

  _currentPushToken = null;
}

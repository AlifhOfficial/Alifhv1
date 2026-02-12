/**
 * Push Notification Service
 * Handles sending push notifications via Expo Push API
 */

import { 
  getUserPushTokens, 
  getMultipleUsersPushTokens, 
  markTokenFailed,
  touchPushToken,
  shouldSendPushNotification,
  createNotification,
} from '../queries/notifications';

// ============================================================================
// TYPES
// ============================================================================

interface PushMessage {
  to: string;
  title?: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  categoryId?: string;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
}

interface PushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

type NotificationType = 
  | 'newMessage'
  | 'listingApproved'
  | 'listingRejected'
  | 'listingViewed'
  | 'listingSaved'
  | 'newEnquiry'
  | 'priceDrops'
  | 'bookingRequest'
  | 'bookingConfirmed'
  | 'bookingReminder'
  | 'promotions';

// ============================================================================
// EXPO PUSH API
// ============================================================================

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notifications to Expo Push API
 */
async function sendToExpoPush(messages: PushMessage[]): Promise<PushTicket[]> {
  if (messages.length === 0) return [];

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    };

    // Access token for enhanced push security (optional but recommended)
    const accessToken = process.env.EXPO_ACCESS_TOKEN;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log(`[Push] Sending ${messages.length} push notification(s) to Expo API`);

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'unable to read body');
      console.error(`[Push] Expo API error: ${response.status} — ${errorBody}`);
      return [];
    }

    const result = await response.json();
    const tickets = result.data || [];
    
    const okCount = tickets.filter((t: PushTicket) => t.status === 'ok').length;
    const errCount = tickets.filter((t: PushTicket) => t.status === 'error').length;
    console.log(`[Push] Expo API response: ${okCount} ok, ${errCount} errors`);
    
    if (errCount > 0) {
      tickets.filter((t: PushTicket) => t.status === 'error').forEach((t: PushTicket) => {
        console.error(`[Push] Ticket error: ${t.details?.error || t.message}`);
      });
    }

    return tickets;
  } catch (error) {
    console.error('[Push] Failed to send to Expo:', error);
    return [];
  }
}

/**
 * Process push tickets and handle failures
 */
async function processPushTickets(messages: PushMessage[], tickets: PushTicket[]): Promise<void> {
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const message = messages[i];

    if (ticket.status === 'ok' && message?.to) {
      // Success - update last used
      await touchPushToken(message.to).catch(() => {});
    } else if (ticket.status === 'error') {
      // Handle error
      const error = ticket.details?.error || ticket.message || 'Unknown error';
      console.error(`[Push] Delivery error for ${message?.to}: ${error}`);

      if (message?.to) {
        // Mark token as failed
        await markTokenFailed(message.to, error).catch(() => {});

        // If token is invalid, it should be deactivated
        if (error === 'DeviceNotRegistered' || error === 'InvalidCredentials') {
          // Token is permanently invalid
          console.log(`[Push] Deactivating invalid token: ${message.to}`);
        }
      }
    }
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Send a push notification to a single user
 */
export async function sendPushToUser(
  userId: string,
  notification: {
    title?: string;
    body: string;
    data?: Record<string, unknown>;
    type?: NotificationType;
  }
): Promise<{ sent: number; failed: number }> {
  // Check if user wants this notification type
  if (notification.type) {
    const shouldSend = await shouldSendPushNotification(userId, notification.type);
    if (!shouldSend) {
      console.log(`[Push] User ${userId} has disabled ${notification.type} notifications`);
      return { sent: 0, failed: 0 };
    }
  }

  // Get user's push tokens
  const tokens = await getUserPushTokens(userId);
  if (tokens.length === 0) {
    console.log(`[Push] No active tokens for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  // Build messages
  const messages: PushMessage[] = tokens.map(token => ({
    to: token,
    title: notification.title,
    body: notification.body,
    data: {
      ...notification.data,
      type: notification.type,
    },
    sound: 'default',
    priority: 'high',
  }));

  // Send to Expo
  const tickets = await sendToExpoPush(messages);
  await processPushTickets(messages, tickets);

  const sent = tickets.filter(t => t.status === 'ok').length;
  const failed = tickets.filter(t => t.status === 'error').length;

  return { sent, failed };
}

/**
 * Send a push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  notification: {
    title?: string;
    body: string;
    data?: Record<string, unknown>;
    type?: NotificationType;
  }
): Promise<{ sent: number; failed: number; skipped: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0, skipped: 0 };

  // Get all tokens for all users
  const tokenMap = await getMultipleUsersPushTokens(userIds);
  
  // Check preferences for each user and build messages
  const messages: PushMessage[] = [];
  let skipped = 0;

  for (const userId of userIds) {
    // Check notification preference
    if (notification.type) {
      const shouldSend = await shouldSendPushNotification(userId, notification.type);
      if (!shouldSend) {
        skipped++;
        continue;
      }
    }

    const tokens = tokenMap.get(userId) || [];
    for (const token of tokens) {
      messages.push({
        to: token,
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data,
          type: notification.type,
          userId,
        },
        sound: 'default',
        priority: 'high',
      });
    }
  }

  if (messages.length === 0) {
    return { sent: 0, failed: 0, skipped };
  }

  // Send to Expo (in batches of 100)
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const tickets = await sendToExpoPush(batch);
    await processPushTickets(batch, tickets);

    totalSent += tickets.filter(t => t.status === 'ok').length;
    totalFailed += tickets.filter(t => t.status === 'error').length;
  }

  return { sent: totalSent, failed: totalFailed, skipped };
}

/**
 * Send a new message notification
 */
export async function sendNewMessageNotification(
  recipientUserId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string,
  listingTitle?: string,
  senderAvatarUrl?: string
): Promise<void> {
  const body = messagePreview.length > 100 
    ? messagePreview.substring(0, 97) + '...' 
    : messagePreview;

  // Send push notification
  await sendPushToUser(recipientUserId, {
    title: senderName,
    body,
    type: 'newMessage',
    data: {
      conversationId,
      listingTitle,
      action: 'open_chat',
    },
  });

  // Create in-app notification
  await createNotification({
    userId: recipientUserId,
    type: 'new_message',
    title: senderName,
    body,
    actionUrl: `/chat/${conversationId}`,
    actionData: { conversationId, action: 'open_chat' },
    actorName: senderName,
    actorAvatarUrl: senderAvatarUrl ?? null,
  }).catch(err => console.error('[Push] Failed to create in-app notification:', err));
}

/**
 * Send a listing status notification
 */
export async function sendListingStatusNotification(
  userId: string,
  status: 'approved' | 'rejected',
  listingId: string,
  listingTitle: string,
  reason?: string
): Promise<void> {
  const type = status === 'approved' ? 'listingApproved' : 'listingRejected';
  const title = status === 'approved' ? 'Listing Approved! 🎉' : 'Listing Needs Changes';
  const body = status === 'approved'
    ? `Your listing "${listingTitle}" is now live!`
    : `Your listing "${listingTitle}" was not approved. ${reason || 'Please review and resubmit.'}`;

  // Send push notification
  await sendPushToUser(userId, {
    title,
    body,
    type,
    data: {
      listingId,
      action: 'open_listing',
    },
  });

  // Create in-app notification
  await createNotification({
    userId,
    type: status === 'approved' ? 'listing_approved' : 'listing_rejected',
    title,
    body,
    actionUrl: `/listing/${listingId}`,
    actionData: { listingId, action: 'open_listing' },
  }).catch(err => console.error('[Push] Failed to create in-app notification:', err));
}

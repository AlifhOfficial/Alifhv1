/**
 * Messaging API Client - Mobile
 * 
 * Connects to the web API for messaging operations.
 * Endpoints: /api/conversations, /api/conversations/:id/messages
 */

import { getStoredSession } from './auth-api';
import { API_BASE } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'audio' | 'video' | 'document' | 'location' | null;
  mediaThumbnail: string | null;
  mediaMetadata: Record<string, unknown> | null;
  isSystemMessage: boolean;
  systemMessageType: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  sender: { id: string; name: string | null; avatarUrl: string | null };
}

export interface Conversation {
  id: string;
  type: string;
  status: string;
  listingId: string | null;
  partnerId: string | null;
  subject: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  myLastReadAt?: string | null;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  otherParticipant: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    lastReadAt?: string | null;
    lastSeenAt?: string | null;
    isOnline?: boolean;
  } | null;
  listing: { id: string; title: string; thumbnail: string | null } | null;
  partner: { id: string; name: string; logo: string | null } | null;
}

interface ConversationsResponse {
  conversations: Conversation[];
  totalUnread: number;
  hasMore: boolean;
}

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
  otherParticipantLastReadAt?: string | null;
}

interface SendMessageResponse {
  message: Message;
}

interface CreateConversationResponse {
  conversationId: string;
  created: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Make an authenticated request to the messaging API
 */
async function messagingFetch(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH';
    body?: unknown;
  }
): Promise<Response> {
  const session = await getStoredSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Origin': API_BASE,
  };

  if (session?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.token}`;
  }

  console.log(`[Messaging API] ${options?.method || 'GET'} ${API_BASE}${endpoint}`);
  
  return fetch(`${API_BASE}${endpoint}`, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
}

// ============================================================================
// API OPERATIONS
// ============================================================================

/**
 * Fetch conversations list
 */
export async function fetchConversations(options?: {
  scope?: 'personal' | 'staff';
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}): Promise<ConversationsResponse> {
  const params = new URLSearchParams();
  if (options?.scope) params.set('scope', options.scope);
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  if (options?.includeArchived) params.set('includeArchived', 'true');

  const endpoint = `/api/conversations${params.toString() ? `?${params}` : ''}`;
  const response = await messagingFetch(endpoint);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch conversations' }));
    throw new Error(error.error || 'Failed to fetch conversations');
  }

  return response.json();
}

/**
 * Fetch a single conversation by ID (for newly created convos not yet in list)
 */
export async function fetchConversation(conversationId: string): Promise<Conversation> {
  const endpoint = `/api/conversations/${conversationId}`;
  const response = await messagingFetch(endpoint);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch conversation' }));
    throw new Error(error.error || 'Failed to fetch conversation');
  }

  // API returns { conversation } - extract the conversation object
  const data = await response.json();
  return data.conversation;
}

/**
 * Fetch messages for a conversation
 */
export async function fetchMessages(
  conversationId: string,
  options?: {
    limit?: number;
    cursor?: string;
  }
): Promise<MessagesResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.cursor) params.set('cursor', options.cursor);

  const endpoint = `/api/conversations/${conversationId}/messages${params.toString() ? `?${params}` : ''}`;
  const response = await messagingFetch(endpoint);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch messages' }));
    throw new Error(error.error || 'Failed to fetch messages');
  }

  return response.json();
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  data: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video' | 'document' | 'location';
    mediaThumbnail?: string;
    mediaMetadata?: Record<string, unknown>;
  }
): Promise<SendMessageResponse> {
  const endpoint = `/api/conversations/${conversationId}/messages`;
  const response = await messagingFetch(endpoint, {
    method: 'POST',
    body: data,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to send message' }));
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  const endpoint = `/api/conversations/${conversationId}/read`;
  const response = await messagingFetch(endpoint, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to mark as read' }));
    throw new Error(error.error || 'Failed to mark as read');
  }
}

/**
 * Create or get existing conversation
 */
export async function createConversation(data: {
  otherUserId: string;
  listingId?: string;
  partnerId?: string;
  type?: string;
  subject?: string;
}): Promise<CreateConversationResponse> {
  const endpoint = '/api/conversations';
  const response = await messagingFetch(endpoint, {
    method: 'POST',
    body: data,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create conversation' }));
    throw new Error(error.error || 'Failed to create conversation');
  }

  return response.json();
}

/**
 * Get total unread count
 */
export async function getUnreadCount(): Promise<number> {
  const endpoint = '/api/conversations/unread-count';
  const response = await messagingFetch(endpoint);
  
  if (!response.ok) {
    console.error('[Messaging API] Failed to fetch unread count');
    return 0;
  }

  const data = await response.json();
  return data.totalUnread || 0;
}

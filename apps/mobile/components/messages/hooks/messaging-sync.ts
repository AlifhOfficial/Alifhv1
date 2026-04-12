import type { Conversation } from '@/lib/messaging-api';
import {
  MESSAGING_CACHE_GC_TIME_MS,
  MESSAGING_CONVERSATIONS_CACHE_STALE_TIME_MS,
} from '@alifh/shared';

type ConversationUpdater = (prev: Conversation[]) => Conversation[];
type ConversationListener = (updater: ConversationUpdater) => void;
type RefreshListener = () => void;
type SendFn = (payload: { type: 'watch_user' | 'unwatch_user'; targetUserId: string }) => void;
type ConversationsCacheEntry = {
  conversations: Conversation[];
  updatedAt: number;
};

const conversationListeners = new Set<ConversationListener>();
const refreshListeners = new Set<RefreshListener>();
const watchedUserCounts = new Map<string, number>();
const conversationsCache = new Map<string, ConversationsCacheEntry>();
const processedConversationWsEvents = new Map<string, number>();
const WS_EVENT_DEDUPE_WINDOW_MS = 15_000;

function getTimestamp(value: string | null | undefined) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortConversationsByLastMessage(conversations: Conversation[]) {
  return [...conversations].sort(
    (a, b) => getTimestamp(b.lastMessageAt) - getTimestamp(a.lastMessageAt)
  );
}

export function readConversationListCache(cacheKey: string) {
  pruneConversationsCache();

  const cached = conversationsCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  return {
    ...cached,
    isFresh:
      Date.now() - cached.updatedAt < MESSAGING_CONVERSATIONS_CACHE_STALE_TIME_MS,
  };
}

export function writeConversationListCache(
  cacheKey: string,
  conversations: Conversation[]
) {
  pruneConversationsCache();
  conversationsCache.set(cacheKey, {
    conversations,
    updatedAt: Date.now(),
  });
}

export function shouldProcessConversationWsEvent(eventKey: string) {
  const now = Date.now();

  for (const [key, timestamp] of processedConversationWsEvents) {
    if (now - timestamp > WS_EVENT_DEDUPE_WINDOW_MS) {
      processedConversationWsEvents.delete(key);
    }
  }

  if (processedConversationWsEvents.has(eventKey)) {
    return false;
  }

  processedConversationWsEvents.set(eventKey, now);
  return true;
}

export function subscribeToConversationMutations(listener: ConversationListener) {
  conversationListeners.add(listener);
  return () => {
    conversationListeners.delete(listener);
  };
}

export function applyConversationMutation(updater: ConversationUpdater) {
  for (const listener of conversationListeners) {
    listener(updater);
  }
}

export function subscribeToConversationRefresh(listener: RefreshListener) {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

export function requestConversationRefresh() {
  for (const listener of refreshListeners) {
    listener();
  }
}

export function applyMessageActivityToConversations(
  conversations: Conversation[],
  params: {
    conversationId: string;
    createdAt: string;
    preview: string | null;
    isOwnMessage: boolean;
    isActiveConversation: boolean;
  }
) {
  let found = false;

  const next = conversations.map((conversation) => {
    if (conversation.id !== params.conversationId) {
      return conversation;
    }

    found = true;

    const previousUnread = conversation.unreadCount || 0;
    const shouldClearUnread = params.isOwnMessage || params.isActiveConversation;

    return {
      ...conversation,
      lastMessageAt: params.createdAt,
      lastMessagePreview:
        params.preview ?? conversation.lastMessagePreview ?? 'New message',
      messageCount: (conversation.messageCount || 0) + 1,
      unreadCount: shouldClearUnread ? 0 : previousUnread + 1,
      myLastReadAt:
        params.isActiveConversation && !params.isOwnMessage
          ? params.createdAt
          : params.isOwnMessage
            ? params.createdAt
            : conversation.myLastReadAt,
    };
  });

  return {
    found,
    conversations: found ? sortConversationsByLastMessage(next) : conversations,
  };
}

export function applyReadReceiptToConversations(
  conversations: Conversation[],
  params: {
    conversationId: string;
    lastReadAt?: string | null;
    isSelfReceipt: boolean;
  }
) {
  return conversations.map((conversation) => {
    if (conversation.id !== params.conversationId) {
      return conversation;
    }

    if (params.isSelfReceipt) {
      return {
        ...conversation,
        unreadCount: 0,
        myLastReadAt: params.lastReadAt || conversation.myLastReadAt,
      };
    }

    return {
      ...conversation,
      otherParticipant: conversation.otherParticipant
        ? {
            ...conversation.otherParticipant,
            lastReadAt:
              params.lastReadAt || conversation.otherParticipant.lastReadAt,
          }
        : null,
    };
  });
}

export function retainWatchedUser(userId: string, send: SendFn) {
  const nextCount = (watchedUserCounts.get(userId) || 0) + 1;
  watchedUserCounts.set(userId, nextCount);

  if (nextCount === 1) {
    send({ type: 'watch_user', targetUserId: userId });
  }
}

export function releaseWatchedUser(userId: string, send: SendFn) {
  const currentCount = watchedUserCounts.get(userId) || 0;
  if (currentCount <= 1) {
    watchedUserCounts.delete(userId);
    send({ type: 'unwatch_user', targetUserId: userId });
    return;
  }

  watchedUserCounts.set(userId, currentCount - 1);
}

export function resetWatchedUsers() {
  watchedUserCounts.clear();
}

function pruneConversationsCache() {
  const now = Date.now();
  for (const [key, entry] of conversationsCache) {
    if (now - entry.updatedAt > MESSAGING_CACHE_GC_TIME_MS) {
      conversationsCache.delete(key);
    }
  }
}

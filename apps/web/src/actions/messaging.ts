'use server';

import { getSessionUser } from '@/lib/auth/session-context';
import {
  getSerializedConversationsForUser,
  getSerializedMessagesPageForUser,
} from '@/lib/messaging/server';

export async function getConversationsAction(
  scope?: 'personal' | 'staff',
  limit = 50,
  offset = 0
) {
  const user = await getSessionUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  return getSerializedConversationsForUser(user, {
    scope,
    limit,
    offset,
  });
}

export async function getMessagesPageAction(
  conversationId: string,
  cursor?: string,
  limit = 50
) {
  const user = await getSessionUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  return getSerializedMessagesPageForUser(user.id, conversationId, {
    cursor,
    limit,
  });
}

export interface MessagingReadStateMessage {
  id: string;
  senderId: string;
  createdAt: Date | string | number | null | undefined;
}

function getTimestamp(value: Date | string | number | null | undefined): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
  }

  return null;
}

/**
 * Messages are expected in newest-first order.
 */
export function getLastReadOwnMessageId<T extends MessagingReadStateMessage>(
  messages: readonly T[],
  userId: string,
  otherLastReadAt: Date | string | number | null | undefined
): string | null {
  const otherLastReadTime = getTimestamp(otherLastReadAt);
  if (otherLastReadTime === null) return null;

  for (const message of messages) {
    if (message.senderId !== userId) continue;

    const createdAt = getTimestamp(message.createdAt);
    if (createdAt !== null && createdAt <= otherLastReadTime) {
      return message.id;
    }
  }

  return null;
}

/**
 * Messages are expected in newest-first order.
 */
export function getNewestUnreadIncomingMessageId<T extends MessagingReadStateMessage>(
  messages: readonly T[],
  userId: string,
  myLastReadAt: Date | string | number | null | undefined
): string | null {
  const newestIncomingMessage = messages.find((message) => message.senderId !== userId);
  if (!newestIncomingMessage) return null;

  const newestIncomingTime = getTimestamp(newestIncomingMessage.createdAt);
  if (newestIncomingTime === null) return null;

  const myLastReadTime = getTimestamp(myLastReadAt);
  if (myLastReadTime !== null && newestIncomingTime <= myLastReadTime) {
    return null;
  }

  return newestIncomingMessage.id;
}

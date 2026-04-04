export interface MessagingReadStateMessage {
  id: string;
  senderId: string;
  createdAt: Date | string | number | null | undefined;
}

const READ_RECEIPT_SKEW_TOLERANCE_MS = 5000;

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

  const ownMessages = messages.filter(
    (message) => message.senderId === userId && !message.id.startsWith('temp-')
  );

  if (ownMessages.length === 0) return null;

  const newestOwnMessage = ownMessages[0];
  const newestOwnTime = getTimestamp(newestOwnMessage.createdAt);

  // Read receipts can be slightly behind message createdAt due to server/client clock skew.
  if (
    newestOwnTime !== null &&
    newestOwnTime > otherLastReadTime &&
    newestOwnTime - otherLastReadTime <= READ_RECEIPT_SKEW_TOLERANCE_MS
  ) {
    return newestOwnMessage.id;
  }

  for (const message of ownMessages) {

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

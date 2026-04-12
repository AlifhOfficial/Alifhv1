const activeConversations = new Map<string, number>();

export function markConversationActive(conversationId: string) {
  activeConversations.set(
    conversationId,
    (activeConversations.get(conversationId) || 0) + 1
  );
}

export function markConversationInactive(conversationId: string) {
  const currentCount = activeConversations.get(conversationId) || 0;
  if (currentCount <= 1) {
    activeConversations.delete(conversationId);
    return;
  }

  activeConversations.set(conversationId, currentCount - 1);
}

export function isConversationActive(conversationId: string) {
  return (activeConversations.get(conversationId) || 0) > 0;
}

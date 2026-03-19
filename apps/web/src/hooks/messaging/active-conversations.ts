const activeConversations = new Set<string>();

export function markConversationActive(conversationId: string) {
  activeConversations.add(conversationId);
}

export function markConversationInactive(conversationId: string) {
  activeConversations.delete(conversationId);
}

export function isConversationActive(conversationId: string) {
  return activeConversations.has(conversationId);
}

/**
 * Message Queries
 * Handles message sending, retrieval, and status updates
 */

import { db } from '../index';
import { message, conversation, conversationParticipant, user, userProfile } from '../schema';
import { eq, and, desc, lt, sql, isNull } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// Types
// ============================================================================

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'audio' | 'video' | 'document' | 'location' | null;
  mediaThumbnail: string | null;
  mediaMetadata: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
  } | null;
  isSystemMessage: boolean;
  systemMessageType: string | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface SendMessageParams {
  conversationId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'document' | 'location';
  mediaThumbnail?: string;
  mediaMetadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    width?: number;
    height?: number;
  };
  isSystemMessage?: boolean;
  systemMessageType?: string;
}

// ============================================================================
// Send Message
// ============================================================================

/**
 * Send a message in a conversation
 * Updates conversation metadata and participant unread counts
 * Optimized: All operations in single parallel batch
 */
export async function sendMessage(params: SendMessageParams): Promise<MessageWithSender> {
  const startTime = Date.now();
  const {
    conversationId,
    senderId,
    text,
    mediaUrl,
    mediaType,
    mediaThumbnail,
    mediaMetadata,
    isSystemMessage = false,
    systemMessageType,
  } = params;

  console.log(`📤 [DB] sendMessage - conversationId: ${conversationId}, senderId: ${senderId}, hasText: ${!!text}, hasMedia: ${!!mediaUrl}`);

  const messageId = createId();
  const now = new Date();

  // Message preview for conversation
  const messagePreview = text
    ? text.substring(0, 100)
    : mediaType
    ? `Sent a ${mediaType}`
    : 'Sent a message';

  // Execute ALL operations in parallel for maximum speed
  const [participantCheck, , senderInfo] = await Promise.all([
    // 1. Quick participant check (single query, indexed)
    db
      .select({ id: conversationParticipant.id })
      .from(conversationParticipant)
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, senderId),
          isNull(conversationParticipant.leftAt)
        )
      )
      .limit(1),
    
    // 2. Insert message (don't wait for participant check - will fail naturally if FK violated)
    db.insert(message).values({
      id: messageId,
      conversationId,
      senderId,
      text: text || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      mediaThumbnail: mediaThumbnail || null,
      mediaMetadata: mediaMetadata || null,
      isSystemMessage,
      systemMessageType: systemMessageType || null,
      deliveredAt: now,
      createdAt: now,
    }),
    
    // 3. Get sender info (with profile avatar fallback)
    db
      .select({
        id: user.id,
        name: user.name,
        image: userProfile.avatar,
      })
      .from(user)
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .where(eq(user.id, senderId)),
    
    // 4. Update conversation metadata
    db
      .update(conversation)
      .set({
        lastMessageAt: now,
        lastMessagePreview: messagePreview,
        lastMessageSenderId: senderId,
        messageCount: sql`${conversation.messageCount} + 1`,
      })
      .where(eq(conversation.id, conversationId)),
    
    // 5. Increment unread count for all participants except sender
    db
      .update(conversationParticipant)
      .set({
        unreadCount: sql`${conversationParticipant.unreadCount} + 1`,
      })
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          sql`${conversationParticipant.userId} != ${senderId}`
        )
      ),
    
    // 6. Mark conversation as read for sender (they're actively sending)
    db
      .update(conversationParticipant)
      .set({
        unreadCount: 0,
        lastReadAt: now,
      })
      .where(
        and(
          eq(conversationParticipant.conversationId, conversationId),
          eq(conversationParticipant.userId, senderId)
        )
      ),
  ]);

  // Validate after parallel execution
  if (participantCheck.length === 0) {
    throw new Error('User is not a participant in this conversation');
  }

  if (senderInfo.length === 0) {
    throw new Error('Sender not found');
  }

  const duration = Date.now() - startTime;
  console.log(`✅ [DB] sendMessage - Message sent: ${messageId}, ${duration}ms`);

  // Construct and return message
  return {
    id: messageId,
    conversationId,
    senderId,
    text: text || null,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    mediaThumbnail: mediaThumbnail || null,
    mediaMetadata: mediaMetadata || null,
    isSystemMessage,
    systemMessageType: systemMessageType || null,
    deliveredAt: now,
    readAt: null,
    isEdited: false,
    editedAt: null,
    isDeleted: false,
    createdAt: now,
    sender: {
      id: senderInfo[0].id,
      name: senderInfo[0].name,
      avatarUrl: senderInfo[0].image,
    },
  };
}

// ============================================================================
// Get Messages
// ============================================================================

/**
 * Get messages for a conversation with cursor-based pagination
 * Returns messages in descending order (newest first) for infinite scroll
 */
export async function getMessages(
  conversationId: string,
  options: {
    limit?: number;
    cursor?: string; // ISO timestamp to start from (createdAt)
    userId?: string; // To verify user is participant
  } = {}
): Promise<MessageWithSender[]> {
  const startTime = Date.now();
  const { limit = 50, cursor, userId } = options;

  console.log(`🔍 [DB] getMessages - conversationId: ${conversationId}, cursor: ${cursor || 'none'}, limit: ${limit}`);

  // Build messages query (join userProfile to get avatar)
  const messagesQuery = db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      text: message.text,
      mediaUrl: message.mediaUrl,
      mediaType: message.mediaType,
      mediaThumbnail: message.mediaThumbnail,
      mediaMetadata: message.mediaMetadata,
      isSystemMessage: message.isSystemMessage,
      systemMessageType: message.systemMessageType,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      senderName: user.name,
      senderImage: userProfile.avatar,
    })
    .from(message)
    .innerJoin(user, eq(user.id, message.senderId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(
      and(
        eq(message.conversationId, conversationId),
        eq(message.isDeleted, false),
        cursor ? lt(message.createdAt, new Date(cursor)) : undefined
      )
    )
    .orderBy(desc(message.createdAt))
    .limit(limit);

  // Run participant check and messages query in PARALLEL (~100ms savings)
  const [participantCheck, messages] = await Promise.all([
    userId
      ? db
          .select({ id: conversationParticipant.id })
          .from(conversationParticipant)
          .where(
            and(
              eq(conversationParticipant.conversationId, conversationId),
              eq(conversationParticipant.userId, userId)
            )
          )
          .limit(1)
      : Promise.resolve([{ id: 'skip' }]), // Skip check if no userId
    messagesQuery,
  ]);

  // Validate participant after parallel execution
  if (userId && participantCheck.length === 0) {
    throw new Error('User is not a participant in this conversation');
  }

  const duration = Date.now() - startTime;
  console.log(`✅ [DB] getMessages - ${messages.length} messages, ${duration}ms`);

  return messages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    text: msg.text,
    mediaUrl: msg.mediaUrl,
    mediaType: msg.mediaType,
    mediaThumbnail: msg.mediaThumbnail,
    mediaMetadata: msg.mediaMetadata,
    isSystemMessage: msg.isSystemMessage,
    systemMessageType: msg.systemMessageType,
    deliveredAt: msg.deliveredAt,
    readAt: msg.readAt,
    isEdited: msg.isEdited,
    editedAt: msg.editedAt,
    isDeleted: msg.isDeleted,
    createdAt: msg.createdAt,
    sender: {
      id: msg.senderId,
      name: msg.senderName,
      avatarUrl: msg.senderImage,
    },
  }));
}

/**
 * Get single message by ID
 */
export async function getMessage(messageId: string): Promise<MessageWithSender | null> {
  const messages = await db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      text: message.text,
      mediaUrl: message.mediaUrl,
      mediaType: message.mediaType,
      mediaThumbnail: message.mediaThumbnail,
      mediaMetadata: message.mediaMetadata,
      isSystemMessage: message.isSystemMessage,
      systemMessageType: message.systemMessageType,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      senderName: user.name,
      senderImage: userProfile.avatar,
    })
    .from(message)
    .innerJoin(user, eq(user.id, message.senderId))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(eq(message.id, messageId));

  if (messages.length === 0) return null;

  const msg = messages[0];
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    text: msg.text,
    mediaUrl: msg.mediaUrl,
    mediaType: msg.mediaType,
    mediaThumbnail: msg.mediaThumbnail,
    mediaMetadata: msg.mediaMetadata,
    isSystemMessage: msg.isSystemMessage,
    systemMessageType: msg.systemMessageType,
    deliveredAt: msg.deliveredAt,
    readAt: msg.readAt,
    isEdited: msg.isEdited,
    editedAt: msg.editedAt,
    isDeleted: msg.isDeleted,
    createdAt: msg.createdAt,
    sender: {
      id: msg.senderId,
      name: msg.senderName,
      avatarUrl: msg.senderImage,
    },
  };
}

// ============================================================================
// Update Message
// ============================================================================

/**
 * Mark message as read
 * Used for read receipts
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  // Verify user is recipient (not sender)
  const msg = await db
    .select({ senderId: message.senderId })
    .from(message)
    .where(eq(message.id, messageId));

  if (msg.length === 0 || msg[0].senderId === userId) {
    return; // Don't mark own messages as read
  }

  await db
    .update(message)
    .set({ readAt: new Date() })
    .where(eq(message.id, messageId));
}

/**
 * Edit message
 * Only sender can edit their own messages
 */
export async function editMessage(
  messageId: string,
  senderId: string,
  newText: string
): Promise<void> {
  await db
    .update(message)
    .set({
      text: newText,
      isEdited: true,
      editedAt: new Date(),
    })
    .where(
      and(
        eq(message.id, messageId),
        eq(message.senderId, senderId),
        eq(message.isDeleted, false)
      )
    );
}

/**
 * Soft delete message
 * Only sender can delete their own messages
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<void> {
  await db
    .update(message)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    })
    .where(
      and(
        eq(message.id, messageId),
        eq(message.senderId, userId)
      )
    );
}

// ============================================================================
// System Messages
// ============================================================================

/**
 * Send system message (automated)
 * Used for booking confirmations, listing updates, etc.
 */
export async function sendSystemMessage(
  conversationId: string,
  systemMessageType: string,
  text: string
): Promise<MessageWithSender> {
  // Use first participant as "sender" for system messages
  const participants = await db
    .select({ userId: conversationParticipant.userId })
    .from(conversationParticipant)
    .where(eq(conversationParticipant.conversationId, conversationId))
    .limit(1);

  if (participants.length === 0) {
    throw new Error('No participants found in conversation');
  }

  return sendMessage({
    conversationId,
    senderId: participants[0].userId,
    text,
    isSystemMessage: true,
    systemMessageType,
  });
}

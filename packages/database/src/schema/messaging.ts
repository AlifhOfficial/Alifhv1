/**
 * Messaging Schema
 * 
 * ===== ARCHITECTURE =====
 * Real-time messaging system for:
 * - Buyers ↔ Partners (inquiries about listings)
 * - Buyers ↔ Sellers (P2P negotiations)
 * - Partners ↔ Users (consignment leads)
 * - System notifications (automated messages)
 * 
 * ===== KEY FEATURES =====
 * - Conversation-based messaging (like WhatsApp/Messenger)
 * - Multi-participant support
 * - Unread count tracking per participant
 * - Media sharing (images, documents, voice notes)
 * - Read receipts
 * - Context linking (conversations about specific listings)
 * - Typing indicators (handled client-side with websockets)
 * 
 * ===== MESSAGE FLOW =====
 * User clicks "Message" on listing → Creates/Opens Conversation
 *                                   ↓
 *                        Conversation with 2+ participants
 *                                   ↓
 *                           Messages sent back/forth
 *                                   ↓
 *                    Unread counts update, notifications sent
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  unique,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { carListing } from './listing';
import { partner } from './partner';

// Enums
export const messageMediaTypeEnum = pgEnum('message_media_type', [
  'image',
  'audio',      // Voice notes
  'video',
  'document',   // PDFs, docs
  'location',   // Shared location
]);

export const conversationTypeEnum = pgEnum('conversation_type', [
  'inquiry',          // General listing inquiry
  'negotiation',      // Price negotiation
  'booking',          // About a booking
  'consignment',      // Consignment lead discussion
  'support',          // Customer support
  'system',           // Automated system messages
]);

export const conversationStatusEnum = pgEnum('conversation_status', [
  'active',           // Ongoing conversation
  'archived',         // Archived by user(s)
  'closed',           // Marked as resolved/completed
  'blocked',          // One party blocked
]);

/**
 * Conversations Table
 * Groups messages between participants
 */
export const conversation = pgTable('conversation', {
  id: text('id').primaryKey(),
  
  // Type & Context
  type: conversationTypeEnum('type').default('inquiry').notNull(),
  status: conversationStatusEnum('status').default('active').notNull(),
  
  // Context Links (what is this conversation about?)
  listingId: text('listing_id').references(() => carListing.id, { onDelete: 'set null' }),
  partnerId: text('partner_id').references(() => partner.id, { onDelete: 'set null' }), // If conversation with partner
  
  // Conversation Metadata
  subject: text('subject'), // Optional conversation title
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  lastMessagePreview: text('last_message_preview'), // First 100 chars of last message
  lastMessageSenderId: text('last_message_sender_id').references(() => user.id, { onDelete: 'set null' }),
  
  // Message Count
  messageCount: integer('message_count').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  closedAt: timestamp('closed_at'),
}, (table) => [
  index('conversation_lastMessageAt_idx').on(table.lastMessageAt),
  index('conversation_listingId_idx').on(table.listingId),
  index('conversation_partnerId_idx').on(table.partnerId),
  index('conversation_status_idx').on(table.status),
  index('conversation_type_idx').on(table.type),
  index('conversation_lastMessageSenderId_idx').on(table.lastMessageSenderId),
]);

/**
 * Conversation Participants Table
 * Tracks who is in each conversation with individual settings
 */
export const conversationParticipant = pgTable('conversation_participant', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversation.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Participant State
  unreadCount: integer('unread_count').default(0).notNull(),
  lastReadAt: timestamp('last_read_at'),
  
  // Participant Settings
  isMuted: boolean('is_muted').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  
  // Participant Role (optional - for group features later)
  role: text('role').default('member'), // member, admin, owner
  
  // Notifications
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  
  // Timestamps
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'), // If participant left the conversation
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('conversation_participant_conversationId_idx').on(table.conversationId),
  index('conversation_participant_userId_idx').on(table.userId),
  index('conversation_participant_unreadCount_idx').on(table.unreadCount),
  index('conversation_participant_userId_unreadCount_idx').on(table.userId, table.unreadCount),
  index('conversation_participant_isArchived_idx').on(table.isArchived),
  unique('conversation_participant_conversationId_userId_unique').on(table.conversationId, table.userId),
]);

/**
 * Messages Table
 * Individual messages within conversations
 */
export const message = pgTable('message', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversation.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Message Content
  text: text('text'), // Can be null if only media
  mediaUrl: text('media_url'), // URL to uploaded media
  mediaType: messageMediaTypeEnum('media_type'),
  mediaThumbnail: text('media_thumbnail'), // Thumbnail for images/videos
  mediaMetadata: jsonb('media_metadata').$type<{
    fileName?: string;
    fileSize?: number;
    duration?: number; // For audio/video
    width?: number;    // For images/video
    height?: number;
  }>(),
  
  // Rich Content (optional - for future features)
  richContent: jsonb('rich_content').$type<{
    linkPreview?: {
      url: string;
      title?: string;
      description?: string;
      image?: string;
    };
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    quotedMessage?: {
      id: string;
      text?: string;
      senderName: string;
    };
  }>(),
  
  // System Message (automated messages)
  isSystemMessage: boolean('is_system_message').default(false).notNull(),
  systemMessageType: text('system_message_type'), // 'booking_confirmed', 'listing_sold', etc.
  
  // Delivery & Read Status
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  
  // Read By (for group conversations - future)
  readBy: jsonb('read_by').$type<string[]>().default([]), // Array of user IDs who read this
  
  // Editing & Deletion
  isEdited: boolean('is_edited').default(false).notNull(),
  editedAt: timestamp('edited_at'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedBy: text('deleted_by'), // Who deleted it (sender or admin)
  
  // Reply/Thread (optional - for threading)
  replyToMessageId: text('reply_to_message_id').references(() => message.id, { onDelete: 'set null' }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('message_conversationId_idx').on(table.conversationId),
  index('message_senderId_idx').on(table.senderId),
  index('message_conversationId_createdAt_idx').on(table.conversationId, table.createdAt),
  index('message_readAt_idx').on(table.readAt),
  index('message_isSystemMessage_idx').on(table.isSystemMessage),
  index('message_replyToMessageId_idx').on(table.replyToMessageId),
  index('message_isDeleted_idx').on(table.isDeleted),
]);

/**
 * Message Reactions Table (optional - for future features like emoji reactions)
 */
export const messageReaction = pgTable('message_reaction', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => message.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  emoji: text('emoji').notNull(), // "👍", "❤️", "😂", etc.
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('message_reaction_messageId_idx').on(table.messageId),
  index('message_reaction_userId_idx').on(table.userId),
  unique('message_reaction_messageId_userId_emoji_unique').on(table.messageId, table.userId, table.emoji),
]);

/**
 * ❌ REMOVED IN V1: Typing Indicators Table
 * 
 * @reason Ephemeral data with high write frequency (every keystroke) belongs in Redis/WebSocket, not PostgreSQL
 * @impact PostgreSQL would bloat with millions of expired records with zero historical value
 * @v1_solution Use client-side WebSocket state management
 * @v2_solution If backend tracking needed, use Redis with 5s TTL
 * 
 * Example V1 implementation (client-side):
 * ```typescript
 * // apps/web/src/hooks/useTypingIndicator.ts
 * socket.emit('typing:start', { conversationId, userId });
 * socket.on('user:typing', ({ userId, isTyping }) => setTypingUsers(...));
 * ```
 * 
 * Example V2 implementation (Redis):
 * ```typescript
 * // Set typing indicator with auto-expire
 * await redis.setex(`typing:${conversationId}:${userId}`, 5, Date.now());
 * 
 * // Get all typing users
 * const keys = await redis.keys(`typing:${conversationId}:*`);
 * ```
 */

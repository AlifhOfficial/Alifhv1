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

// V1: Single conversation type - all conversations are inquiries
// Future types (V2+): direct, negotiation, booking, consignment, support, system
export const conversationTypeEnum = pgEnum('conversation_type', [
  'inquiry',          // V1: All user-to-partner conversations
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
  
  // Conversation Initiator (who started this conversation)
  initiatedBy: text('initiated_by').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
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
  // Essential query patterns only
  index('conversation_lastMessageAt_idx').on(table.lastMessageAt),
  index('conversation_listingId_idx').on(table.listingId),
  index('conversation_partnerId_idx').on(table.partnerId),
  // ❌ Removed: status, type, lastMessageSenderId (low usage in V1)
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
  index('conversation_participant_userId_unreadCount_idx').on(table.userId, table.unreadCount),
  unique('conversation_participant_conversationId_userId_unique').on(table.conversationId, table.userId),
  // ❌ Removed: unreadCount, isArchived (standalone indexes not useful)
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
  
  // System Message (automated messages)
  isSystemMessage: boolean('is_system_message').default(false).notNull(),
  systemMessageType: text('system_message_type'), // 'booking_confirmed', 'listing_sold', etc.
  
  // Delivery & Read Status
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  
  // Editing & Deletion
  isEdited: boolean('is_edited').default(false).notNull(),
  editedAt: timestamp('edited_at'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  deletedBy: text('deleted_by'), // Who deleted it (sender or admin)
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('message_conversationId_idx').on(table.conversationId),
  index('message_senderId_idx').on(table.senderId),
  index('message_conversationId_createdAt_idx').on(table.conversationId, table.createdAt),
  // ❌ Removed: readAt, isSystemMessage, isDeleted (not queried separately in V1)
]);

/**
 * ❌ REMOVED: Message Reactions, Rich Content, Threading
 * 
 * @reason V1 focuses on simple 1:1 messaging
 * @removed:
 *   - messageReaction table (emoji reactions)
 *   - richContent field (link previews, locations, quoted messages)
 *   - replyToMessageId (threading/replies)
 *   - readBy array (for group read receipts)
 * 
 * @v1_solution:
 *   - Basic text + media messages
 *   - Simple read receipts (readAt timestamp)
 *   - Linear conversation history
 * 
 * @v2_solution:
 *   Add back when you need:
 *   - Emoji reactions to messages
 *   - Rich link previews
 *   - Threaded conversations
 *   - Group messaging with individual read status
 */

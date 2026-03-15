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

// Conversation types
export const conversationTypeEnum = pgEnum('conversation_type', [
  'direct',           // User-to-user direct messages
  'inquiry',          // User-to-partner listing inquiries
  'negotiation',      // Price/term negotiations
  'booking',          // Booking-related conversations
  'consignment',      // Consignment discussions
  'support',          // Support conversations
  'system',           // System-generated conversations
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
  // Foreign keys should be indexed (helps joins + FK maintenance on user deletion)
  index('conversation_initiatedBy_idx').on(table.initiatedBy),
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
  // Composite index for fetching user's conversations with unread filtering
  index('conversation_participant_userId_isArchived_idx').on(table.userId, table.isArchived),
  index('conversation_participant_userId_unreadCount_idx').on(table.userId, table.unreadCount),
  // Composite index for participant lookups (sendMessage, getMessages authorization)
  index('conversation_participant_conversationId_userId_idx').on(table.conversationId, table.userId),
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
    // File/Media metadata
    fileName?: string;
    fileSize?: number;
    duration?: number; // For audio/video
    width?: number;    // For images/video
    height?: number;
    // Location metadata (when mediaType === 'location')
    latitude?: number;
    longitude?: number;
    address?: string;      // Reverse geocoded address
    placeName?: string;    // Name of place (e.g., "Revvup HQ")
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
  // Composite index for efficient message fetching with cursor pagination
  index('message_conversationId_createdAt_isDeleted_idx')
    .on(table.conversationId, table.createdAt, table.isDeleted),
  index('message_senderId_idx').on(table.senderId),
  // ❌ Removed standalone indexes - using composite above
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

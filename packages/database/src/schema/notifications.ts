/**
 * Notifications Schema
 * Push notification device tokens and notification records
 */

import { 
  pgTable, 
  text, 
  timestamp, 
  boolean,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

// ============================================================================
// ENUMS
// ============================================================================

export const devicePlatformEnum = pgEnum('device_platform', ['ios', 'android', 'web']);

// ============================================================================
// PUSH DEVICE TOKENS
// ============================================================================

/**
 * Stores Expo push tokens for each device
 * Multiple devices per user are supported
 */
export const pushDeviceToken = pgTable('push_device_token', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Expo push token (e.g., ExponentPushToken[xxx])
  token: text('token').notNull(),
  
  // Device info
  platform: devicePlatformEnum('platform').notNull(),
  deviceId: text('device_id'), // Unique device identifier if available
  deviceName: text('device_name'), // e.g., "iPhone 15 Pro"
  
  // Token status
  isActive: boolean('is_active').default(true).notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow(),
  
  // Error tracking
  failedAttempts: text('failed_attempts').default('0'),
  lastError: text('last_error'),
  lastErrorAt: timestamp('last_error_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('push_device_token_user_id_idx').on(table.userId),
  uniqueIndex('push_device_token_token_idx').on(table.token),
  index('push_device_token_platform_idx').on(table.platform),
  index('push_device_token_is_active_idx').on(table.isActive),
]);

// ============================================================================
// NOTIFICATION PREFERENCES (per-user granular)
// ============================================================================

/**
 * Per-user notification preferences
 * Controls which notifications are sent via push
 */
export const pushNotificationPreferences = pgTable('push_notification_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  
  // Message notifications
  newMessage: boolean('new_message').default(true).notNull(),
  
  // Listing notifications
  listingApproved: boolean('listing_approved').default(true).notNull(),
  listingRejected: boolean('listing_rejected').default(true).notNull(),
  listingViewed: boolean('listing_viewed').default(false).notNull(),
  listingSaved: boolean('listing_saved').default(true).notNull(),
  
  // Activity notifications
  newEnquiry: boolean('new_enquiry').default(true).notNull(),
  priceDrops: boolean('price_drops').default(true).notNull(),

  // Booking notifications
  bookingRequest: boolean('booking_request').default(true).notNull(),
  bookingConfirmed: boolean('booking_confirmed').default(true).notNull(),
  bookingReminder: boolean('booking_reminder').default(true).notNull(),
  
  // Marketing (opt-in)
  promotions: boolean('promotions').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('push_notification_preferences_user_id_idx').on(table.userId),
]);

// ============================================================================
// TYPES
// ============================================================================

export type PushDeviceToken = typeof pushDeviceToken.$inferSelect;
export type NewPushDeviceToken = typeof pushDeviceToken.$inferInsert;

export type PushNotificationPreferences = typeof pushNotificationPreferences.$inferSelect;
export type NewPushNotificationPreferences = typeof pushNotificationPreferences.$inferInsert;

// ============================================================================
// IN-APP NOTIFICATION TYPE ENUM
// ============================================================================

export const notificationTypeEnum = pgEnum('notification_type', [
  'new_message',
  'listing_approved',
  'listing_rejected',
  'listing_viewed',
  'listing_saved',
  'new_enquiry',
  'price_drop',
  'booking_request',
  'booking_confirmed',
  'booking_reminder',
  'promotion',
  'system',
]);

// ============================================================================
// IN-APP NOTIFICATIONS
// ============================================================================

/**
 * In-app notification records
 * Stores all notifications for the notification center / bell icon feed
 */
export const notification = pgTable('notification', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Notification content
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  
  // Optional image (e.g. listing thumbnail, user avatar)
  imageUrl: text('image_url'),
  
  // Navigation action when tapped
  actionUrl: text('action_url'), // e.g. "/chat/abc123", "/listing/xyz"
  actionData: jsonb('action_data').$type<Record<string, string>>(), // Additional data for navigation
  
  // Read state
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  
  // Sender info (optional - for message notifications etc.)
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  actorName: text('actor_name'),
  actorAvatarUrl: text('actor_avatar_url'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('notification_user_id_idx').on(table.userId),
  index('notification_user_created_idx').on(table.userId, table.createdAt),
  index('notification_user_unread_idx').on(table.userId, table.isRead),
  index('notification_type_idx').on(table.type),
  index('notification_actorId_idx').on(table.actorId),
]);

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;

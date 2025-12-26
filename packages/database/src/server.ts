/**
 * Database Package - Server-Only Exports
 * 
 * Queries that use dbclient and CANNOT run in Edge Runtime.
 * Only import these in API routes with runtime = 'nodejs'
 * 
 * DO NOT import this in middleware or Edge functions!
 * 
 * @module @alifh/database/server
 */

export { calculatePartnerStats, type PartnerStats } from './queries/partner/car-dealer/partner-stats';
export { calculateUserStats, type UserStats } from './queries/user-stats';

// Messaging queries
export {
  createOrGetConversation,
  getUserConversations,
  getConversation,
  getConversationByListing,
  markConversationAsRead,
  updateConversationSettings,
  getConversationParticipants,
  getConversationParticipantsWithProfiles,
  getTotalUnreadCount,
  type ConversationWithDetails,
  type ConversationParticipantInfo,
  type ConversationParticipantWithProfile,
} from './queries/conversation';

export {
  sendMessage,
  getMessages,
  getMessage,
  markMessageAsRead,
  editMessage,
  deleteMessage,
  sendSystemMessage,
  type MessageWithSender,
  type SendMessageParams,
} from './queries/message';

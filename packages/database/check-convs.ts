import { db } from './src/db';
import { conversation, conversationParticipant } from './src/schema';
import { eq } from 'drizzle-orm';

async function check() {
  const convs = await db.select({ 
    id: conversation.id, 
    type: conversation.type,
    lastMessageAt: conversation.lastMessageAt 
  }).from(conversation).limit(5);
  console.log("Conversations:", convs);
  
  const parts = await db.select({
    conversationId: conversationParticipant.conversationId,
    oderId: conversationParticipant.userId,
    isArchived: conversationParticipant.isArchived
  }).from(conversationParticipant).limit(10);
  console.log("Participants:", parts);
  
  // Check for specific user
  const userId = "2o5J4JsA42sqPWCUq0ooOmSn3AI3X815";
  const userParts = await db.select().from(conversationParticipant).where(eq(conversationParticipant.userId, userId)).limit(5);
  console.log("User participant records:", userParts);
  
  process.exit(0);
}
check().catch(console.error);

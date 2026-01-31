/**
 * User Auth Queries - Production
 * 
 * Essential user authentication and management queries.
 * Used by Better Auth for user operations.
 * 
 * @module queries/auth/user-auth-queries
 */

import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { user, userProfile } from '../../schema';
import { memoryCache, CacheKeys, CacheTTL } from '../../caches';

// Essential user queries
export const getUserById = async (id: string) => {
  // Check cache first
  const cacheKey = CacheKeys.userById(id);
  const cached = memoryCache.get<typeof user.$inferSelect>(cacheKey);
  if (cached) return cached;

  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  
  // Cache the result
  if (result) {
    memoryCache.set(cacheKey, result, CacheTTL.userById);
  }
    
  return result || null;
};

export const getUserByEmail = async (email: string) => {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
    
  return result || null;
};

export interface CreateUserData {
  name: string;
  email: string;
  emailVerified?: boolean;
}

export const createUser = async (data: CreateUserData) => {
  const now = new Date();

  const [result] = await db
    .insert(user)
    .values({
      id: createId(),
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  
  return result;
};

export const updateUser = async (id: string, data: Partial<CreateUserData>) => {
  // Invalidate cache before update
  memoryCache.delete(CacheKeys.userById(id));
  
  const [result] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning();
    
  return result;
};

export const deleteUser = async (id: string) => {
  // Invalidate cache before delete
  memoryCache.delete(CacheKeys.userById(id));
  
  await db
    .delete(user)
    .where(eq(user.id, id));
};

// Max limit guard to prevent abuse
const MAX_USERS_LIMIT = 100;

export const getAllUsers = async (limit: number = 100) => {
  // Guard against excessive limits
  const safeLimit = Math.min(Math.max(1, limit), MAX_USERS_LIMIT);
  
  return await db
    .select()
    .from(user)
    .limit(safeLimit);
};

/**
 * Check if a user exists by email
 * Used for validation during registration or sign-in
 */
export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  const [result] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
    
  return !!result;
};

/**
 * Check if an unverified user exists by email
 * Returns the user if exists and not verified, null otherwise
 * Used for handling re-registration of unverified accounts
 */
export const getUnverifiedUserByEmail = async (email: string) => {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
    
  // Return user only if exists AND not verified
  if (result && !result.emailVerified) {
    return result;
  }
  return null;
};

/**
 * Delete an unverified user by email
 * Used when user tries to re-register with same email before verification
 * Cascades to sessions, accounts, verification tokens
 */
export const deleteUnverifiedUserByEmail = async (email: string): Promise<boolean> => {
  const unverifiedUser = await getUnverifiedUserByEmail(email);
  if (!unverifiedUser) {
    return false;
  }
  
  // Invalidate any cache
  memoryCache.delete(CacheKeys.userById(unverifiedUser.id));
  
  // Delete user (cascades to sessions, accounts, etc.)
  await db
    .delete(user)
    .where(eq(user.id, unverifiedUser.id));
    
  return true;
};

/**
 * Get user for Stripe customer creation (after email verification)
 * Returns only the fields needed for Stripe customer creation
 */
export const getUserForStripeCustomer = async (email: string) => {
  const [result] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      stripeCustomerId: user.stripeCustomerId,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
    
  return result || null;
};

/**
 * Update user's Stripe customer ID
 * Called after successful email verification and Stripe customer creation
 */
export const updateUserStripeCustomerId = async (userId: string, stripeCustomerId: string) => {
  // Invalidate cache before update
  memoryCache.delete(CacheKeys.userById(userId));
  
  const [result] = await db
    .update(user)
    .set({
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
    
  return result;
};

// Note: Phone verification is now handled by Better Auth's phoneNumber plugin
// See: apps/web/src/lib/auth/index.ts - phoneNumber plugin with Twilio Verify
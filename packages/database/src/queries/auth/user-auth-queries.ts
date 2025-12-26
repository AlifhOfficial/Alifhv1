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
import { user } from '../../schema';

// Essential user queries
export const getUserById = async (id: string) => {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
    
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
  await db
    .delete(user)
    .where(eq(user.id, id));
};

export const getAllUsers = async (limit: number = 100) => {
  return await db
    .select()
    .from(user)
    .limit(limit);
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
 * Update user phone verification status
 * Called after OTP verification succeeds
 */
export const updateUserPhoneVerified = async (userId: string, verified: boolean = true) => {
  const [result] = await db
    .update(user)
    .set({
      phoneVerified: verified,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();
    
  return result || null;
};
/**
 * Essential Auth Queries
 * 
 * Clean Better Auth queries only.
 */

import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { db } from './dbclient';
import { user } from './schema';

// Re-export specialized queries
export * from './queries/profile/user-profile-query';
export * from './queries/partner';
export * from './queries/listings/car-card-query';
export * from './queries/favorites';

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
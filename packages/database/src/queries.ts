/**
 * Essential Auth Queries
 * 
 * Clean Better Auth queries only.
 */

import { eq } from 'drizzle-orm';
import { db } from './dbclient';
import { user } from './schema';

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
  emailVerified?: Date | null;
  image?: string | null;
}

export const createUser = async (data: CreateUserData) => {
  const [result] = await db
    .insert(user)
    .values({
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified || null,
      image: data.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
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
/**
 * Essential Auth Queries
 * 
 * Clean Better Auth queries only.
 */

import { eq } from 'drizzle-orm';
import { db } from './dbclient';
import { users } from './schema';

// Essential user queries
export const getUserById = async (id: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
    
  return user || null;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
    
  return user || null;
};

export interface CreateUserData {
  name: string;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
}

export const createUser = async (data: CreateUserData) => {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified || null,
      image: data.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return user;
};

export const updateUser = async (id: string, data: Partial<CreateUserData>) => {
  const [user] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
    
  return user;
};

export const deleteUser = async (id: string) => {
  await db
    .delete(users)
    .where(eq(users.id, id));
};

export const getAllUsers = async (limit: number = 100) => {
  return await db
    .select()
    .from(users)
    .limit(limit);
};
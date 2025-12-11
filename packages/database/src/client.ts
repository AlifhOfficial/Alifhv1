import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Create Neon connection pool
const pool = new Pool({ connectionString });

// Initialize Drizzle client with schema
export const db = drizzle(pool, { schema });

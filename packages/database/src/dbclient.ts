/**
 * Database Client - Production
 * 
 * PostgreSQL connection using postgres-js driver (compatible with Supabase/Neon/any PG).
 * Optimized for serverless with connection pooling and lazy initialization.
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Lazy connection initialization (no build-time errors)
 * - Connection pooling with configurable max connections
 * - Automatic reconnection on connection loss
 * - SSL/TLS for secure connections
 * 
 * DEPLOYMENT NOTES:
 * - Works in serverless (Vercel, Cloudflare Workers, AWS Lambda)
 * - Compatible with Supabase, Neon, and standard PostgreSQL
 * - Connection pool managed automatically
 * 
 * @module dbclient
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy-loaded client to avoid build-time initialization
let _sql: ReturnType<typeof postgres> | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  return connectionString;
}

// ⚡ LAZY-LOADED POSTGRES CLIENT
// Prevents build-time initialization errors when DATABASE_URL is not available
function getSql(): ReturnType<typeof postgres> {
  if (!_sql) {
    _sql = postgres(getConnectionString(), {
      // Connection pool settings for serverless
      max: 10, // Maximum connections in pool
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
      // SSL settings - required for cloud databases
      ssl: 'require',
      // Prepare statements for better performance
      prepare: false, // Disable for Supabase transaction pooler compatibility
    });
  }
  return _sql;
}

function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getSql(), { 
      schema,
      logger: process.env.DB_DEBUG === 'true',
    });
  }
  return _db;
}

// Check if DATABASE_URL is available - allows build-time imports without throwing
const isDatabaseConfigured = !!process.env.DATABASE_URL;

// Export as getter that lazily initializes
// During build time (no DATABASE_URL), property access returns functions that throw when called
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    if (!isDatabaseConfigured) {
      // Return a function that throws when actually called
      // This allows imports during build but fails on actual DB usage
      return (..._args: unknown[]) => {
        throw new Error('DATABASE_URL environment variable is required');
      };
    }
    return (getDb() as any)[prop];
  },
});

// CURRENT CONFIGURATION:
// - Database: Supabase PostgreSQL 15 (Mumbai ap-south-1)
// - Driver: postgres-js (compatible with Supabase, Neon, and standard PG)
// - Expected latency from Dubai: ~20-30ms

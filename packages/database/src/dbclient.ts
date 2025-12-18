import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// ⚡ BUN OPTIMIZATION: Enable fetch cache for faster HTTP requests
// Neon uses fetch() internally - Bun's fetch is already optimized but we can tune it
if (typeof globalThis.Bun !== 'undefined') {
  // Enable connection reuse and keep-alive
  neonConfig.fetchConnectionCache = true;
  // Use Bun's native fetch (already the fastest)
  neonConfig.webSocketConstructor = undefined; // We're using HTTP, not WebSocket
}

// Create Neon HTTP client with optimized settings
const sql = neon(connectionString, {
  // Reuse connections aggressively
  fetchOptions: {
    // @ts-ignore - Bun-specific optimization
    keepalive: true,
  },
});

// Initialize Drizzle client with schema
// Logger disabled in production for performance
// Set DB_DEBUG=true to enable query logging in development
export const db = drizzle(sql, { 
  schema,
  logger: process.env.DB_DEBUG === 'true' ? true : false,
});

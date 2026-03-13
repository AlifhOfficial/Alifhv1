import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { getDatabaseUrl } from './src/env';

// Load environment from root .env.local
config({ path: '../../.env.local' });

export default {
  schema: './src/schema/index.ts', // Point to index which exports all schemas
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl() || '',
  },
} satisfies Config;

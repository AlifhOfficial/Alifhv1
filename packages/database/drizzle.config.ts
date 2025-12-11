import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment from root .env.local
config({ path: '../../.env.local' });

export default {
  schema: './src/auth/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config;

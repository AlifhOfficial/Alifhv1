import { config } from 'dotenv';
import { execSync } from 'child_process';

// Load environment from root .env.local
config({ path: '../../.env.local' });

// Now run drizzle-kit push
execSync('bunx drizzle-kit push', { stdio: 'inherit' });
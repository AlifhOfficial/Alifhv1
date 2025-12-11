import { db, users, account } from '../packages/database/src/index';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function checkUsers() {
  console.log('🔍 Checking users in database...');
  
  try {
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users:`);
    
    for (const user of allUsers) {
      console.log(`  - ${user.name} (${user.email}) - ${user.platformRole} - ${user.status}`);
    }
    
    console.log('\n🔍 Checking accounts in database...');
    const allAccounts = await db.select().from(account);
    console.log(`Found ${allAccounts.length} accounts:`);
    
    for (const acc of allAccounts) {
      console.log(`  - User ID: ${acc.userId} - Provider: ${acc.providerId} - Has Password: ${!!acc.password}`);
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  }
  
  process.exit(0);
}

checkUsers().catch(console.error);
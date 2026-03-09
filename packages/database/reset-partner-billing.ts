/**
 * Reset partner billing for testing
 * Run: bun run reset-partner-billing.ts
 */

import { db, partner, eq } from './src';

async function resetPartnerBilling() {
  const partnerId = 'partner_nxtb0zcrblxrhwq7r93yg4fy';
  
  console.log(`Clearing billing state for partner ${partnerId}...`);
  
  await db
    .update(partner)
    .set({
      billingActive: false,
      updatedAt: new Date(),
    })
    .where(eq(partner.id, partnerId));
  
  console.log('Done! Partner billing cleared:');
  console.log('  - billingActive: false');
  console.log('');
  console.log('Next steps:');
  console.log('1. Log out and back in to refresh session');
  console.log('2. Go to /partner-dashboard/subscription');
  console.log('3. Subscribe to a plan');
  console.log('4. Check Stripe webhook events after payment');
  
  process.exit(0);
}

resetPartnerBilling().catch(console.error);

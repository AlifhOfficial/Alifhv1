import { db } from './packages/database/src/dbclient';
import { partner } from './packages/database/src/schema';

const partners = await db
  .select({
    id: partner.id,
    slug: partner.slug,
    brandName: partner.brandName,
  })
  .from(partner)
  .limit(10);

console.log('Partner Slugs:');
partners.forEach(p => {
  console.log(`  ${p.brandName} → /cars/dealer/${p.slug}`);
});

process.exit(0);

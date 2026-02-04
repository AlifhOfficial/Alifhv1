/**
 * Populate partner slugs from brandName
 * Run once after adding slug column
 */

import { db } from './dbclient';
import { partner } from './schema';
import { isNull } from 'drizzle-orm';

function generateSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/\s+/g, '-')      // spaces to hyphens
    .replace(/&/g, 'and')      // & to and
    .replace(/[^a-z0-9-]/g, '') // remove special chars
    .replace(/-+/g, '-')       // multiple hyphens to single
    .replace(/^-|-$/g, '');    // trim hyphens
}

async function populateSlugs() {
  console.log('🔄 Populating partner slugs...');
  
  try {
    // Get all partners without slugs
    const partners = await db
      .select({
        id: partner.id,
        brandName: partner.brandName,
      })
      .from(partner)
      .where(isNull(partner.slug));

    console.log(`📊 Found ${partners.length} partners without slugs`);

    for (const p of partners) {
      const slug = generateSlug(p.brandName);
      
      await db
        .update(partner)
        .set({ slug })
        .where({ id: p.id });
      
      console.log(`✓ ${p.brandName} → ${slug}`);
    }

    console.log('✅ All partner slugs populated!');
  } catch (error) {
    console.error('❌ Error populating slugs:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

populateSlugs();

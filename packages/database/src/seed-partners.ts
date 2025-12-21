/**
 * Partner & Staff Seed Script
 * Creates realistic dealer partners with staff for testing
 */

import 'dotenv/config';
import { db } from './dbclient';
import { partner, partnerStaff } from './schema/partner';
import { user } from './schema';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

// ===== PARTNER DATA =====
const partnersData = [
  {
    companyNameLegal: 'Luxury Motors LLC',
    brandName: 'Luxury Motors Dubai',
    tradeLicense: 'TL-DXB-2024-001',
    tradeLicenseExpiry: new Date('2026-12-31'),
    tradeLicenseDocumentUrl: '/documents/trade-license-luxury.pdf',
    vatNumber: 'VAT100123456789',
    partnerType: 'car_dealer' as const,
    status: 'active' as const,
    tier: 'platinum' as const,
    email: 'info@luxurymotorsdubai.ae',
    phone: '+971-4-123-4567',
    website: 'https://luxurymotorsdubai.ae',
    address: 'Sheikh Zayed Road, Al Quoz Industrial Area 3',
    emirate: 'Dubai',
    city: 'Dubai',
    locationLat: 25.1172,
    locationLng: 55.1844,
    showroomCount: 2,
    logo: '/Black_cars/car1.webp',
    heroImage: '/Black_cars/car5.webp',
    coverImage: '/Black_cars/car10.webp',
    galleryImages: ['/Black_cars/car15.webp', '/Black_cars/car20.webp', '/Black_cars/car25.webp'],
    description: 'Premier luxury and sports car dealership in Dubai with over 15 years of experience. Specializing in exotic supercars, premium luxury sedans, and exclusive limited editions.',
    specialties: ['luxury', 'sports', 'supercars', 'exotic'],
    experienceYears: 15,
    foundedYear: 2009,
    googleReviewUrl: 'https://g.page/luxurymotorsdubai',
    googleRating: 4.8,
    googleReviewCount: 234,
    platformRating: 4.9,
    platformReviewCount: 89,
    customerSatisfaction: 96.5,
    isVerified: true,
    badges: ['verified_dealer', 'top_rated', 'luxury_specialist', 'premium_partner'],
    tags: ['luxury', 'exotic', 'supercar', 'premium'],
    features: {
      homeDelivery: true,
      testDriveAvailable: true,
      financing: true,
      tradeIn: true,
      warranty: true,
      insurance: true,
      registration: true,
      exportAssistance: true,
    },
    businessHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { closed: true, open: '', close: '' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    commissionRate: 2.5,
    subscriptionTier: 'platinum',
    subscriptionExpiresAt: new Date('2025-12-31'),
  },
  {
    companyNameLegal: 'Premium Auto Trading LLC',
    brandName: 'Premium Auto Trading',
    tradeLicense: 'TL-DXB-2024-002',
    tradeLicenseExpiry: new Date('2026-06-30'),
    tradeLicenseDocumentUrl: '/documents/trade-license-premium.pdf',
    vatNumber: 'VAT100234567890',
    partnerType: 'car_dealer' as const,
    status: 'active' as const,
    tier: 'gold' as const,
    email: 'info@premiumautotrading.ae',
    phone: '+971-4-987-6543',
    website: 'https://premiumautotrading.ae',
    address: 'Al Quoz Industrial Area 4, Dubai',
    emirate: 'Dubai',
    city: 'Dubai',
    locationLat: 25.1285,
    locationLng: 55.2012,
    showroomCount: 1,
    logo: '/Black_cars/car2.webp',
    heroImage: '/Black_cars/car12.webp',
    coverImage: '/Black_cars/car22.webp',
    galleryImages: ['/Black_cars/car32.webp', '/Black_cars/car42.webp'],
    description: 'Trusted dealer for quality pre-owned vehicles with comprehensive warranty options. We specialize in certified pre-owned luxury vehicles with full service history.',
    specialties: ['certified', 'warranty', 'financing', 'pre-owned'],
    experienceYears: 10,
    foundedYear: 2014,
    googleReviewUrl: 'https://g.page/premiumautotrading',
    googleRating: 4.5,
    googleReviewCount: 156,
    platformRating: 4.6,
    platformReviewCount: 67,
    customerSatisfaction: 92.0,
    isVerified: true,
    badges: ['verified_dealer', 'warranty_expert', 'certified_dealer'],
    tags: ['certified', 'warranty', 'quality', 'trusted'],
    features: {
      homeDelivery: true,
      testDriveAvailable: true,
      financing: true,
      tradeIn: true,
      warranty: true,
      insurance: false,
      registration: true,
      exportAssistance: false,
    },
    businessHours: {
      monday: { open: '09:00', close: '20:00' },
      tuesday: { open: '09:00', close: '20:00' },
      wednesday: { open: '09:00', close: '20:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { closed: true, open: '', close: '' },
      saturday: { open: '10:00', close: '20:00' },
      sunday: { open: '10:00', close: '20:00' },
    },
    commissionRate: 3.0,
    subscriptionTier: 'gold',
    subscriptionExpiresAt: new Date('2025-06-30'),
  },
  {
    companyNameLegal: 'Elite Motors Abu Dhabi LLC',
    brandName: 'Elite Motors Abu Dhabi',
    tradeLicense: 'TL-AUH-2024-001',
    tradeLicenseExpiry: new Date('2026-09-30'),
    tradeLicenseDocumentUrl: '/documents/trade-license-elite.pdf',
    vatNumber: 'VAT100345678901',
    partnerType: 'car_dealer' as const,
    status: 'active' as const,
    tier: 'gold' as const,
    email: 'contact@elitemotorsad.ae',
    phone: '+971-2-555-7890',
    website: 'https://elitemotorsad.ae',
    address: 'Mussafah Industrial Area, Abu Dhabi',
    emirate: 'Abu Dhabi',
    city: 'Abu Dhabi',
    locationLat: 24.3677,
    locationLng: 54.5032,
    showroomCount: 1,
    logo: '/Black_cars/car3.webp',
    heroImage: '/Black_cars/car13.webp',
    coverImage: '/Black_cars/car23.webp',
    galleryImages: ['/Black_cars/car33.webp', '/Black_cars/car43.webp'],
    description: 'Family-owned dealership specializing in reliable pre-owned vehicles. Serving the Abu Dhabi community with honest deals and quality service since 2016.',
    specialties: ['affordable', 'family_cars', 'reliable', 'value'],
    experienceYears: 8,
    foundedYear: 2016,
    googleReviewUrl: 'https://g.page/elitemotorsad',
    googleRating: 4.3,
    googleReviewCount: 98,
    platformRating: 4.4,
    platformReviewCount: 45,
    customerSatisfaction: 88.5,
    isVerified: true,
    badges: ['verified_dealer', 'family_business'],
    tags: ['affordable', 'family', 'reliable', 'value'],
    features: {
      homeDelivery: false,
      testDriveAvailable: true,
      financing: true,
      tradeIn: true,
      warranty: true,
      insurance: false,
      registration: true,
      exportAssistance: false,
    },
    businessHours: {
      monday: { open: '09:00', close: '19:00' },
      tuesday: { open: '09:00', close: '19:00' },
      wednesday: { open: '09:00', close: '19:00' },
      thursday: { open: '09:00', close: '19:00' },
      friday: { closed: true, open: '', close: '' },
      saturday: { open: '10:00', close: '18:00' },
      sunday: { open: '10:00', close: '18:00' },
    },
    commissionRate: 3.5,
    subscriptionTier: 'gold',
    subscriptionExpiresAt: new Date('2025-09-30'),
  },
  {
    companyNameLegal: 'Royal Auto Gallery LLC',
    brandName: 'Royal Auto Gallery',
    tradeLicense: 'TL-DXB-2024-003',
    tradeLicenseExpiry: new Date('2026-03-31'),
    tradeLicenseDocumentUrl: '/documents/trade-license-royal.pdf',
    vatNumber: 'VAT100456789012',
    partnerType: 'showroom' as const,
    status: 'active' as const,
    tier: 'black' as const,
    email: 'vip@royalautogallery.ae',
    phone: '+971-4-888-9999',
    website: 'https://royalautogallery.ae',
    address: 'DIFC, Gate Avenue, Dubai',
    emirate: 'Dubai',
    city: 'Dubai',
    locationLat: 25.2138,
    locationLng: 55.2797,
    showroomCount: 3,
    logo: '/Black_cars/car4.webp',
    heroImage: '/Black_cars/car14.webp',
    coverImage: '/Black_cars/car24.webp',
    galleryImages: ['/Black_cars/car34.webp', '/Black_cars/car44.webp', '/Black_cars/car50.webp'],
    description: 'The ultimate destination for ultra-luxury and rare collector vehicles. Home to Bugatti, Pagani, Koenigsegg, and limited edition hypercars. White-glove service for discerning collectors.',
    specialties: ['hypercar', 'collector', 'rare', 'bespoke', 'ultra-luxury'],
    experienceYears: 20,
    foundedYear: 2004,
    googleReviewUrl: 'https://g.page/royalautogallery',
    googleRating: 4.9,
    googleReviewCount: 312,
    platformRating: 5.0,
    platformReviewCount: 156,
    customerSatisfaction: 99.0,
    isVerified: true,
    badges: ['verified_dealer', 'top_rated', 'black_member', 'hypercar_specialist', 'vip_service'],
    tags: ['hypercar', 'collector', 'rare', 'vip', 'bespoke'],
    features: {
      homeDelivery: true,
      testDriveAvailable: true,
      financing: true,
      tradeIn: true,
      warranty: true,
      insurance: true,
      registration: true,
      exportAssistance: true,
    },
    businessHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '14:00', close: '22:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '23:00' },
    },
    commissionRate: 1.5,
    subscriptionTier: 'black',
    subscriptionExpiresAt: new Date('2026-12-31'),
  },
  {
    companyNameLegal: 'AutoHub Sharjah Trading LLC',
    brandName: 'AutoHub Sharjah',
    tradeLicense: 'TL-SHJ-2024-001',
    tradeLicenseExpiry: new Date('2026-08-31'),
    tradeLicenseDocumentUrl: '/documents/trade-license-autohub.pdf',
    vatNumber: 'VAT100567890123',
    partnerType: 'car_dealer' as const,
    status: 'active' as const,
    tier: 'standard' as const,
    email: 'sales@autohubsharjah.ae',
    phone: '+971-6-555-1234',
    website: 'https://autohubsharjah.ae',
    address: 'Industrial Area 12, Sharjah',
    emirate: 'Sharjah',
    city: 'Sharjah',
    locationLat: 25.3463,
    locationLng: 55.4209,
    showroomCount: 1,
    logo: '/Black_cars/car6.webp',
    heroImage: '/Black_cars/car16.webp',
    coverImage: '/Black_cars/car26.webp',
    galleryImages: ['/Black_cars/car36.webp'],
    description: 'Budget-friendly pre-owned vehicles for everyday needs. Great selection of Japanese and Korean brands with competitive pricing.',
    specialties: ['budget', 'japanese', 'korean', 'economy'],
    experienceYears: 5,
    foundedYear: 2019,
    googleReviewUrl: 'https://g.page/autohubsharjah',
    googleRating: 4.1,
    googleReviewCount: 67,
    platformRating: 4.2,
    platformReviewCount: 34,
    customerSatisfaction: 85.0,
    isVerified: true,
    badges: ['verified_dealer', 'value_dealer'],
    tags: ['budget', 'economy', 'value', 'affordable'],
    features: {
      homeDelivery: false,
      testDriveAvailable: true,
      financing: true,
      tradeIn: false,
      warranty: false,
      insurance: false,
      registration: true,
      exportAssistance: false,
    },
    businessHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { closed: true, open: '', close: '' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '09:00', close: '17:00' },
    },
    commissionRate: 4.0,
    subscriptionTier: 'standard',
    subscriptionExpiresAt: new Date('2025-08-31'),
  },
];

// ===== STAFF DATA =====
// Will be populated based on available users

async function seedPartners() {
  console.log('\n' + '='.repeat(60));
  console.log('🏢 ALIFH PARTNERS SEED SCRIPT');
  console.log('='.repeat(60) + '\n');

  try {
    // Get existing users
    const users = await db.select().from(user);
    console.log(`✅ Found ${users.length} users\n`);

    if (users.length === 0) {
      console.error('❌ No users found! Please run the main seed script first.');
      process.exit(1);
    }

    // Find admin user for verification
    const adminUser = users.find(u => u.role === 'admin' || u.role === 'super_admin');
    
    // Create partners
    console.log('📝 Creating partners...\n');
    const createdPartners: { id: string; brandName: string; tier: string }[] = [];

    for (const partnerData of partnersData) {
      const partnerId = `partner_${createId()}`;
      
      await db.insert(partner).values({
        id: partnerId,
        ...partnerData,
        verifiedAt: partnerData.isVerified ? new Date() : null,
        verifiedBy: partnerData.isVerified && adminUser ? adminUser.id : null,
        approvedAt: new Date(),
        approvedBy: adminUser?.id || null,
        activatedAt: new Date(),
        activeListingsCount: 0,
        totalInventoryValue: 0,
        avgListingPrice: 0,
        soldThisMonth: 0,
        revenueThisMonth: 0,
        conversionRate: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      createdPartners.push({
        id: partnerId,
        brandName: partnerData.brandName,
        tier: partnerData.tier,
      });

      console.log(`   ✅ ${partnerData.tier.toUpperCase().padEnd(8)} - ${partnerData.brandName}`);
    }

    console.log(`\n✅ Created ${createdPartners.length} partners\n`);

    // Create staff for each partner
    console.log('👥 Creating partner staff...\n');
    let staffCount = 0;

    // Get users that could be staff (non-admin users)
    const potentialStaff = users.filter(u => u.role === 'user');
    let staffIndex = 0;

    for (const partnerInfo of createdPartners) {
      // Each partner gets 1-3 staff members
      const numStaff = Math.min(1 + Math.floor(Math.random() * 3), potentialStaff.length - staffIndex);
      
      for (let i = 0; i < numStaff && staffIndex < potentialStaff.length; i++) {
        const staffUser = potentialStaff[staffIndex];
        const isOwner = i === 0;
        
        const roles = ['owner', 'admin', 'sales', 'viewer'] as const;
        const role = isOwner ? 'owner' : roles[Math.min(i, roles.length - 1)];
        
        const titles = ['CEO', 'Sales Manager', 'Sales Executive', 'Customer Service', 'Operations Manager'];
        const departments = ['Management', 'Sales', 'Operations', 'Customer Service'];
        
        await db.insert(partnerStaff).values({
          id: `staff_${createId()}`,
          partnerId: partnerInfo.id,
          userId: staffUser.id,
          role,
          isOwner,
          title: titles[i % titles.length],
          department: departments[i % departments.length],
          isPrimaryContact: isOwner,
          status: 'active',
          joinedAt: new Date(),
          acceptedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        staffCount++;
        staffIndex++;
        
        console.log(`   ✅ ${partnerInfo.brandName} - ${staffUser.name || staffUser.email} (${role})`);
      }
    }

    console.log(`\n✅ Created ${staffCount} staff members\n`);

    // Summary
    console.log('='.repeat(60));
    console.log('🎉 PARTNER SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   Partners: ${createdPartners.length}`);
    console.log(`   • Black tier: ${createdPartners.filter(p => p.tier === 'black').length}`);
    console.log(`   • Platinum tier: ${createdPartners.filter(p => p.tier === 'platinum').length}`);
    console.log(`   • Gold tier: ${createdPartners.filter(p => p.tier === 'gold').length}`);
    console.log(`   • Standard tier: ${createdPartners.filter(p => p.tier === 'standard').length}`);
    console.log(`\n   Staff members: ${staffCount}`);
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed
seedPartners()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

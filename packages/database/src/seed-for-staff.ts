/**
 * Seed Script for Specific Staff Member
 * Seeds all mock data for a given staff email
 * 
 * Usage: bun run packages/database/src/seed-for-staff.ts [email]
 * Example: bun run packages/database/src/seed-for-staff.ts revvup.official@gmail.com
 */

import 'dotenv/config';
import { db } from './dbclient';
import { carListing, listingPriceHistory } from './schema/listing';
import { partner, partnerStaff } from './schema/partner';
import { user } from './schema';
import { userProfile } from './schema/profile';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';

// Import constants from centralized source of truth
import {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPE_VALUES,
  FUEL_TYPE_VALUES,
  TRANSMISSION_TYPE_VALUES,
  SPECS_TYPE_VALUES,
  STEERING_SIDE_VALUES,
  EXPORT_STATUS_VALUES,
  ENGINE_SIZE_VALUES,
  ENGINE_TYPE_VALUES,
  POWER_RANGE_VALUES,
  DOORS_VALUES,
  SEATING_CAPACITY_VALUES,
  EXTERIOR_COLOR_VALUES,
  INTERIOR_COLOR_VALUES,
  WARRANTY_TYPE_VALUES,
  SELLER_TYPES,
  LISTING_MODERATION_STATUSES,
  LISTING_LIFECYCLE_STATUSES,
  LISTING_POSTED_BY_ROLES,
  VEHICLE_EXTRAS,
  LISTING_TAGS,
  UAE_EMIRATES,
  type BodyType,
  type FuelType,
  type TransmissionType,
  type SpecsType,
  type SteeringSide,
  type ExportStatus,
  type EngineSize,
  type EngineType,
  type PowerRange,
  type DoorsOption,
  type SeatingOption,
  type ExteriorColor,
  type InteriorColor,
  type WarrantyType,
  type SellerType,
  type ListingModerationStatus,
  type ListingLifecycleStatus,
  type ListingPostedByRole,
} from './schema/listing-constants';

// Target email - can be overridden via CLI
const TARGET_EMAIL = process.argv[2] || 'revvup.official@gmail.com';

const makeListingId = () => `listing_${createId()}`;
const makePartnerId = () => `partner_${createId()}`;
const makeStaffId = () => `staff_${createId()}`;

// ===== IMAGE PATHS FROM /public/Black_cars/ =====
const carImages = [
  '/Black_cars/car1.webp', '/Black_cars/car2.webp', '/Black_cars/car3.webp',
  '/Black_cars/car4.webp', '/Black_cars/car5.webp', '/Black_cars/car6.webp',
  '/Black_cars/car7.webp', '/Black_cars/car8.webp', '/Black_cars/car9.webp',
  '/Black_cars/car10.webp', '/Black_cars/car11.webp', '/Black_cars/car12.webp',
  '/Black_cars/car13.webp', '/Black_cars/car14.webp', '/Black_cars/car15.webp',
  '/Black_cars/car16.webp', '/Black_cars/car17.webp', '/Black_cars/car18.webp',
  '/Black_cars/car19.webp', '/Black_cars/car20.webp', '/Black_cars/car21.webp',
  '/Black_cars/car22.webp', '/Black_cars/car23.webp', '/Black_cars/car24.webp',
  '/Black_cars/car25.webp', '/Black_cars/car26.webp', '/Black_cars/car27.webp',
  '/Black_cars/car28.webp', '/Black_cars/car29.webp', '/Black_cars/car30.webp',
  '/Black_cars/car31.webp', '/Black_cars/car32.webp', '/Black_cars/car33.webp',
  '/Black_cars/car34.webp', '/Black_cars/car35.webp', '/Black_cars/car36.webp',
  '/Black_cars/car37.webp', '/Black_cars/car38.webp', '/Black_cars/car39.webp',
  '/Black_cars/car40.webp', '/Black_cars/can41.webp', '/Black_cars/car42.webp',
  '/Black_cars/car43.webp', '/Black_cars/car44.webp', '/Black_cars/car45.webp',
  '/Black_cars/car46.webp', '/Black_cars/car47.webp', '/Black_cars/car48.webp',
  '/Black_cars/car49.webp', '/Black_cars/car50.webp', '/Black_cars/car51.webp',
  '/Black_cars/car52.webp', '/Black_cars/car53.webp', '/Black_cars/car56.webp',
  '/Black_cars/car57.webp', '/Black_cars/car58.webp', '/Black_cars/car59.webp',
  '/Black_cars/car60.webp',
];

// Luxury makes for seeding (subset for better variety)
const luxuryMakes = ['Mercedes-Benz', 'BMW', 'Porsche', 'Audi', 'Lamborghini', 'Ferrari', 'Rolls-Royce', 'Bentley', 'Lexus'] as const;

// Seed-specific makes subset (popular UAE market)
const seedMakes = [
  'Mercedes-Benz', 'BMW', 'Porsche', 'Audi', 'Land Rover', 'Lamborghini', 
  'Ferrari', 'Rolls-Royce', 'Bentley', 'Toyota', 'Nissan', 'Lexus', 
  'Chevrolet', 'Ford'
] as const;

const trims = ['S', 'SE', 'HSE', 'Autobiography', 'AMG', 'M Sport', 'Competition', 'Turbo', 'Turbo S', 'GTS', 'Prestige', 'Platinum', 'Limited', 'VXR'];

// Use constants directly
const bodyTypes = [...BODY_TYPE_VALUES] as BodyType[];
const fuelTypes = [...FUEL_TYPE_VALUES] as FuelType[];
const transmissions = [...TRANSMISSION_TYPE_VALUES] as TransmissionType[];
const specsList = [...SPECS_TYPE_VALUES] as SpecsType[];
const steeringSides = [...STEERING_SIDE_VALUES] as SteeringSide[];
const exportStatuses = [...EXPORT_STATUS_VALUES] as ExportStatus[];
const engineSizes = [...ENGINE_SIZE_VALUES] as EngineSize[];
const engineTypes = [...ENGINE_TYPE_VALUES] as EngineType[];
const powerRanges = [...POWER_RANGE_VALUES] as PowerRange[];
const doors = [...DOORS_VALUES] as DoorsOption[];
const seatingCapacities = [...SEATING_CAPACITY_VALUES] as SeatingOption[];
const exteriorColors = [...EXTERIOR_COLOR_VALUES] as ExteriorColor[];
const interiorColors = [...INTERIOR_COLOR_VALUES] as InteriorColor[];
const warrantyTypes = [...WARRANTY_TYPE_VALUES] as WarrantyType[];
const sellerTypes = [...SELLER_TYPES] as SellerType[];

const extrasValues = VEHICLE_EXTRAS.map(e => e.value);
const tagsValues = LISTING_TAGS.map(t => t.value);

const emirates = UAE_EMIRATES.map(e => e.label);
const cities: Record<string, string[]> = {
  'Dubai': ['Dubai Marina', 'Downtown', 'Business Bay', 'JBR', 'Al Quoz', 'Jumeirah', 'Deira'],
  'Abu Dhabi': ['Al Reem Island', 'Yas Island', 'Al Raha', 'Corniche', 'Al Ain'],
  'Sharjah': ['Al Majaz', 'Al Khan', 'Muweilah', 'Al Nahda'],
  'Ajman': ['Al Nuaimiya', 'Al Rashidiya', 'Al Jurf'],
  'Ras Al Khaimah': ['Al Hamra', 'Al Nakheel', 'Dafan Al Nakheel'],
  'Fujairah': ['Al Faseel', 'Sakamkam', 'Dibba'],
  'Umm Al Quwain': ['Old Town', 'Falaj Al Mualla'],
};

const badges = ['verified', 'top_rated', 'price_reduced', 'hot_deal', 'new_arrival', 'featured', 'premium', 'low_mileage', 'single_owner', 'warranty'];
const priceChangeReasons = ['market_adjustment', 'quick_sale', 'seasonal', 'competitor_pricing', 'demand_increase', 'price_correction'];

// ===== HELPER FUNCTIONS =====
function getRandomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubarray<T>(arr: readonly T[] | T[], min: number, max: number): T[] {
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function getRandomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateVIN(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
}

function generateSlug(make: string, model: string, year: number, trim: string): string {
  return `${year}-${make}-${model}-${trim}-${createId().slice(0, 8)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function getRandomImages(count: number): string[] {
  const images: string[] = [];
  const usedIndexes = new Set<number>();
  
  while (images.length < count && images.length < carImages.length) {
    const idx = Math.floor(Math.random() * carImages.length);
    if (!usedIndexes.has(idx)) {
      usedIndexes.add(idx);
      images.push(carImages[idx]);
    }
  }
  return images;
}

function generateTechnicalFeatures(isLuxury: boolean) {
  return {
    abs: getRandomBoolean(0.95),
    airbags: randomInt(2, 12),
    parkingSensors: getRandomBoolean(0.8),
    rearCamera: getRandomBoolean(0.9),
    blindSpotMonitor: getRandomBoolean(0.7),
    laneAssist: getRandomBoolean(0.6),
    adaptiveCruise: getRandomBoolean(isLuxury ? 0.9 : 0.4),
    collisionWarning: getRandomBoolean(0.7),
    leatherSeats: getRandomBoolean(isLuxury ? 0.95 : 0.5),
    heatedSeats: getRandomBoolean(isLuxury ? 0.9 : 0.3),
    ventilatedSeats: getRandomBoolean(isLuxury ? 0.85 : 0.2),
    sunroof: getRandomBoolean(0.6),
    panoramicRoof: getRandomBoolean(isLuxury ? 0.7 : 0.3),
    climateControl: getRandomBoolean(0.9),
    powerSeats: getRandomBoolean(0.85),
    memorySeats: getRandomBoolean(isLuxury ? 0.8 : 0.4),
    touchscreen: getRandomBoolean(0.95),
    screenSize: getRandomItem(['7"', '8.4"', '10.25"', '12.3"', '14.9"', '17.7"']),
    appleCarPlay: getRandomBoolean(0.85),
    androidAuto: getRandomBoolean(0.8),
    bluetooth: getRandomBoolean(0.98),
    navigation: getRandomBoolean(0.8),
    soundSystem: isLuxury ? getRandomItem(['Burmester', 'Bang & Olufsen', 'Harman Kardon', 'Mark Levinson', 'Meridian']) : undefined,
    wirelessCharging: getRandomBoolean(0.6),
    sportMode: getRandomBoolean(isLuxury ? 0.7 : 0.4),
    paddleShifters: getRandomBoolean(isLuxury ? 0.6 : 0.3),
    allWheelDrive: getRandomBoolean(0.5),
    adjustableSuspension: getRandomBoolean(isLuxury ? 0.7 : 0.2),
    launchControl: getRandomBoolean(isLuxury ? 0.4 : 0.1),
  };
}

function generateSpecialNotes(year: number) {
  return {
    serviceHistory: getRandomBoolean(0.8),
    singleOwner: getRandomBoolean(0.4),
    accidentFree: getRandomBoolean(0.7),
    underWarranty: getRandomBoolean(0.5),
    registeredUntil: getRandomBoolean(0.9) ? `${year + randomInt(1, 3)}-${randomInt(1, 12).toString().padStart(2, '0')}` : undefined,
    customizations: getRandomBoolean(0.3) ? getRandomSubarray(['Tinted Windows', 'Custom Wheels', 'Body Kit', 'Exhaust System', 'Carbon Fiber Trim', 'PPF'], 1, 3) : undefined,
    recentServices: getRandomBoolean(0.6) ? getRandomSubarray(['Oil Change', 'Brake Service', 'Tire Rotation', 'AC Service', 'Major Service', 'Inspection'], 1, 4) : undefined,
    knownIssues: getRandomBoolean(0.1) ? ['Minor paint chip on bumper', 'Windshield has small crack'] : undefined,
  };
}

function generateDescription(make: string, model: string, year: number, exteriorColor: string, interiorColor: string, isLuxury: boolean): string {
  const luxuryPhrases = [
    'Experience unparalleled luxury',
    'Epitome of automotive excellence',
    'Crafted to perfection',
    'Ultimate in sophistication',
  ];
  
  const standardPhrases = [
    'Well-maintained and ready to drive',
    'Excellent condition throughout',
    'Reliable and efficient',
    'Perfect for daily use',
  ];
  
  const phrase = isLuxury ? getRandomItem(luxuryPhrases) : getRandomItem(standardPhrases);
  
  return `${phrase} with this ${year} ${make} ${model}. Finished in stunning ${exteriorColor} with ${interiorColor} interior. Meticulously maintained with full service history. This vehicle combines performance, comfort, and style in one exceptional package.`;
}

// ===== MAIN GENERATION FUNCTION =====
function generateListing(
  index: number,
  partnerId: string,
  partnerBrandName: string,
  staffId: string,
  isBlkListing: boolean
) {
  const make = getRandomItem(seedMakes);
  const availableModels = CAR_MODELS[make] || [];
  const model = availableModels.length > 0 ? getRandomItem([...availableModels]) : 'Unknown';
  const year = randomInt(2018, 2025);
  const trim = getRandomItem(trims);
  const isLuxury = luxuryMakes.includes(make as typeof luxuryMakes[number]);
  
  // Status distribution - mostly published for usability
  type ListingState = 'draft' | 'pending' | 'published' | 'reserved' | 'sold' | 'archived' | 'rejected';
  const statusWeights: { status: ListingState; weight: number }[] = [
    { status: 'published', weight: 0.70 },
    { status: 'draft', weight: 0.10 },
    { status: 'reserved', weight: 0.08 },
    { status: 'sold', weight: 0.08 },
    { status: 'archived', weight: 0.02 },
    { status: 'pending', weight: 0.01 },
    { status: 'rejected', weight: 0.01 },
  ];
  
  let status: ListingState = 'published';
  let rand = Math.random();
  let cumulative = 0;
  for (const { status: s, weight } of statusWeights) {
    cumulative += weight;
    if (rand <= cumulative) {
      status = s;
      break;
    }
  }
  
  const sellerType = 'dealer' as const;
  const isConsignment = getRandomBoolean(0.15);
  
  const bodyType = getRandomItem(bodyTypes);
  const fuelType = getRandomItem(fuelTypes);
  const transmission = getRandomItem(transmissions);
  const specs = getRandomItem(specsList);
  const steeringSide = getRandomItem(steeringSides);
  const exportStatus = getRandomItem(exportStatuses);
  
  const isElectric = fuelType === 'electric';
  const engineType = isElectric ? 'electric' as const : getRandomItem(engineTypes);
  const cylinders = isElectric ? undefined : randomInt(3, 12);
  const engineSize = isElectric ? 'electric' as const : getRandomItem(engineSizes.filter(e => e !== 'electric'));
  const powerRange = isElectric ? 'unknown' as const : getRandomItem(powerRanges);
  
  const doorCount = getRandomItem(doors);
  const seatingCapacity = doorCount === '2' ? getRandomItem(['2', '4'] as const) : getRandomItem(seatingCapacities);
  const exteriorColor = getRandomItem(exteriorColors);
  const interiorColor = getRandomItem(interiorColors);
  
  const carAge = 2026 - year;
  const baseMileage = carAge * randomInt(8000, 20000);
  const mileage = Math.max(500, baseMileage + randomInt(-3000, 3000));
  
  const basePrice = isLuxury ? randomInt(150000, 1500000) : randomInt(25000, 350000);
  const price = basePrice;
  const fairValue = Math.floor(price * (0.9 + Math.random() * 0.2));
  const estimateMin = Math.floor(fairValue * 0.9);
  const estimateMax = Math.floor(fairValue * 1.1);
  const priceTrend = price < fairValue * 0.95 ? 'below_market' : price > fairValue * 1.05 ? 'above_market' : 'at_market';
  
  const hasAiPricing = getRandomBoolean(0.7);
  const aiEstimatedPrice = hasAiPricing ? Math.floor(price * (0.95 + Math.random() * 0.1)) : undefined;
  const aiPriceMin = hasAiPricing ? Math.floor(aiEstimatedPrice! * 0.9) : undefined;
  const aiPriceMax = hasAiPricing ? Math.floor(aiEstimatedPrice! * 1.1) : undefined;
  const aiConfidenceScore = hasAiPricing ? 0.7 + Math.random() * 0.25 : undefined;
  
  const emirate = getRandomItem(emirates);
  const city = getRandomItem(cities[emirate]);
  
  const imageCount = randomInt(4, 10);
  const images = getRandomImages(imageCount);
  const thumbnail = images[0];
  const videoUrl = getRandomBoolean(0.2) ? `https://www.youtube.com/watch?v=${createId().slice(0, 11)}` : undefined;
  
  const technicalFeatures = generateTechnicalFeatures(isLuxury);
  const extras = getRandomSubarray(extrasValues, 3, 8);
  const specialNotes = generateSpecialNotes(year);
  
  const qiScore = randomInt(65, 98) / 100;
  
  const isPublicish = status === 'published' || status === 'reserved';
  const viewCount = isPublicish ? randomInt(50, 3000) : randomInt(0, 50);
  const favouriteCount = isPublicish ? randomInt(5, 200) : randomInt(0, 10);
  const superlikeCount = isPublicish ? randomInt(0, 30) : 0;
  
  const heatScore = isPublicish ? randomInt(0, 100) : 0;
  
  const listingBadges = getRandomSubarray(badges, 1, 4);
  const listingTags = getRandomSubarray(tagsValues, 1, 3);
  
  const createdAt = new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000);
  const updatedAt = new Date(createdAt.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000);
  
  const publishedAt = ['published', 'reserved', 'sold'].includes(status)
    ? new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000)
    : undefined;
  
  const reservedAt = ['reserved', 'sold'].includes(status) && publishedAt
    ? new Date(publishedAt.getTime() + randomInt(5, 40) * 24 * 60 * 60 * 1000)
    : undefined;
  
  const soldAt = status === 'sold' && reservedAt
    ? new Date(reservedAt.getTime() + randomInt(3, 14) * 24 * 60 * 60 * 1000)
    : undefined;
  
  const soldPrice = status === 'sold' ? Math.floor(price * (0.88 + Math.random() * 0.1)) : undefined;
  const archivedAt = status === 'archived' ? new Date() : undefined;
  
  const rejectionReason = status === 'rejected' ? getRandomItem([
    'Images not clear enough',
    'Missing required documentation',
    'Price significantly above market value',
    'Duplicate listing',
    'Incomplete vehicle information'
  ]) : undefined;

  const postedByRole: ListingPostedByRole = 'staff';
  const moderationStatus: ListingModerationStatus =
    status === 'draft'
      ? 'draft'
      : status === 'pending'
      ? 'pending_review'
      : status === 'rejected'
      ? 'rejected'
      : 'approved';
  const lifecycleStatus: ListingLifecycleStatus =
    status === 'sold'
      ? 'sold'
      : status === 'archived' || status === 'rejected'
      ? 'archived'
      : 'active';
  const submittedAt = moderationStatus === 'pending_review' ? createdAt : null;
  const approvedAt = moderationStatus === 'approved' ? (publishedAt ?? createdAt) : null;
  const lastModeratedAt = moderationStatus === 'draft' ? null : (approvedAt ?? submittedAt ?? createdAt);
  const needsRemoderation = moderationStatus === 'pending_review';
  const expiresAt = publishedAt ? new Date(publishedAt.getTime() + 24 * 24 * 60 * 60 * 1000) : null;
  
  const slug = generateSlug(make, model, year, trim);
  const metaTitle = `${year} ${make} ${model} ${trim} for Sale in ${emirate} | Revvup`;
  const metaDescription = `Buy this ${year} ${make} ${model} ${trim}. ${mileage.toLocaleString()} km, ${transmission}. Price: AED ${price.toLocaleString()}. Contact dealer today!`;
  
  const description = generateDescription(make, model, year, exteriorColor, interiorColor, isLuxury);
  
  const partnerVerified = true;
  
  return {
    id: makeListingId(),
    vin: generateVIN(),
    
    partnerId,
    userId: null,
    postedByStaffId: staffId,
    postedByRole,
    moderationStatus,
    lifecycleStatus,
    sellerType,
    isConsignment,
    
    make,
    model,
    year,
    trim,
    
    bodyType,
    fuelType,
    transmission,
    specs,
    steeringSide,
    
    engineSize,
    engineType,
    cylinders,
    powerRange,
    torque: cylinders ? `${randomInt(250, 850)} Nm` : null,
    fuelEconomy: isElectric ? null : `${randomInt(7, 18)} L/100km`,
    
    doors: doorCount,
    seatingCapacity,
    exteriorColor,
    interiorColor,
    
    mileage,
    condition: mileage < 5000 ? 'new' as const : 'used' as const,
    
    price,
    currency: 'AED',
    isNegotiable: getRandomBoolean(0.7),
    
    aiEstimatedPrice,
    aiPriceMin,
    aiPriceMax,
    aiConfidenceScore,
    aiPriceUpdatedAt: hasAiPricing ? new Date() : null,
    aiModel: hasAiPricing ? 'v1' : null,
    
    fairValue,
    estimateMin,
    estimateMax,
    priceTrend,
    qiScore,
    
    emirate,
    city,
    
    partnerBrandName,
    partnerVerified,
    
    thumbnail,
    images,
    videoUrl,
    description,
    
    technicalFeatures,
    extras,
    specialNotes,
    warrantyType: getRandomItem(warrantyTypes),
    
    exportStatus,
    
    badges: listingBadges,
    tags: listingTags,
    isBlkListing,
    
    viewCount,
    favouriteCount,
    superlikeCount,
    
    heatScore,
    heatScoreUpdatedAt: heatScore > 0 ? new Date() : null,
    
    slug,
    metaTitle,
    metaDescription,
    
    reservedAt,
    reservedBy: null,
    soldAt,
    soldTo: null,
    soldPrice,
    
    createdAt,
    updatedAt,
    publishedAt,
    expiresAt,
    extensionCount: 0,
    extensionHistory: [],
    lastEditedAt: updatedAt,
    archivedAt,
    
    submittedAt,
    approvedAt,
    lastModeratedAt,
    needsRemoderation,
    rejectionReason,
    deletedAt: null,
  };
}

// ===== MAIN SEED FUNCTION =====
async function seedForStaff() {
  console.log('\n' + '='.repeat(60));
  console.log(`🚗 SEEDING MOCK DATA FOR: ${TARGET_EMAIL}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Find the user by email
    console.log(`🔍 Looking up user: ${TARGET_EMAIL}...\n`);
    const [targetUser] = await db.select().from(user).where(eq(user.email, TARGET_EMAIL));
    
    if (!targetUser) {
      console.error(`❌ User not found: ${TARGET_EMAIL}`);
      console.error('   Please make sure the user has signed up first.\n');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${targetUser.name} (${targetUser.id})\n`);
    
    // Step 2: Check if user has a partner/staff membership
    console.log('🔍 Checking existing partner memberships...\n');
    const existingStaff = await db.select().from(partnerStaff).where(
      and(
        eq(partnerStaff.userId, targetUser.id),
        eq(partnerStaff.status, 'active')
      )
    );
    
    let targetPartnerId: string;
    let targetPartnerName: string;
    let staffId: string;
    let isBlackTier = false;
    
    if (existingStaff.length > 0) {
      // User already has staff membership, use the first one
      const staff = existingStaff[0];
      staffId = staff.id;
      targetPartnerId = staff.partnerId;
      
      const [existingPartner] = await db.select().from(partner).where(eq(partner.id, staff.partnerId));
      if (existingPartner) {
        targetPartnerName = existingPartner.brandName;
        isBlackTier = existingPartner.tier === 'black';
        console.log(`✅ Found existing partner: ${targetPartnerName} (${targetPartnerId})`);
        console.log(`   Tier: ${existingPartner.tier}`);
        console.log(`   Staff role: ${staff.role}\n`);
      } else {
        // Create partner if somehow missing
        targetPartnerName = `${targetUser.name}'s Dealership`;
        targetPartnerId = makePartnerId();
      }
    } else {
      // Create new partner and staff membership
      console.log('📝 Creating new partner for user...\n');
      
      targetPartnerId = makePartnerId();
      targetPartnerName = `${targetUser.name}'s Dealership`;
      isBlackTier = true; // Give them black tier for testing
      
      const slug = targetPartnerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      await db.insert(partner).values({
        id: targetPartnerId,
        slug,
        companyNameLegal: `${targetPartnerName} LLC`,
        brandName: targetPartnerName,
        tradeLicense: `TL-TEST-${createId().slice(0, 8)}`,
        tradeLicenseExpiry: new Date('2027-12-31'),
        vatNumber: `VAT${Math.floor(Math.random() * 1000000000000)}`,
        partnerType: 'car_dealer',
        status: 'active',
        tier: 'black',
        email: TARGET_EMAIL,
        phone: '+971-4-555-1234',
        website: 'https://example.com',
        address: 'Dubai, UAE',
        emirate: 'dubai',
        city: 'Dubai',
        locationLat: 25.2048,
        locationLng: 55.2708,
        showroomCount: 1,
        logo: '/Black_cars/car1.webp',
        description: 'Premium automotive dealership specializing in luxury vehicles.',
        specialties: ['luxury', 'sports', 'supercars'],
        experienceYears: 10,
        foundedYear: 2015,
        googleRating: 4.8,
        googleReviewCount: 150,
        platformRating: 4.9,
        platformReviewCount: 50,
        customerSatisfaction: 95,
        isVerified: true,
        verifiedAt: new Date(),
        badges: ['verified_dealer', 'black_member', 'premium_partner'],
        tags: ['luxury', 'premium', 'trusted'],
        activeListingsCount: 0,
        totalInventoryValue: 0,
        avgListingPrice: 0,
        soldThisMonth: 0,
        revenueThisMonth: 0,
        conversionRate: 0,
        blackListingQuota: 5,
        activeBlackListingsCount: 0,
        approvedAt: new Date(),
        activatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`   ✅ Created partner: ${targetPartnerName}`);
      
      // Create staff membership
      staffId = makeStaffId();
      await db.insert(partnerStaff).values({
        id: staffId,
        partnerId: targetPartnerId,
        userId: targetUser.id,
        role: 'owner',
        isOwner: true,
        title: 'Owner',
        department: 'Management',
        isPrimaryContact: true,
        status: 'active',
        joinedAt: new Date(),
        acceptedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`   ✅ Created staff membership as owner\n`);
    }
    
    // Step 3: Generate listings for this partner
    const LISTING_COUNT = 50; // Seed 50 listings
    const BLK_LISTING_COUNT = 5; // 5 of them are BLK listings
    
    console.log(`📝 Generating ${LISTING_COUNT} listings for ${targetPartnerName}...\n`);
    
    const listings = [];
    
    for (let i = 0; i < LISTING_COUNT; i++) {
      const isBlkListing = isBlackTier && i < BLK_LISTING_COUNT;
      const listing = generateListing(i, targetPartnerId, targetPartnerName, staffId, isBlkListing);
      listings.push(listing);
    }
    
    console.log(`✅ Generated ${listings.length} listings\n`);
    
    // Step 4: Insert listings in batches
    console.log('💾 Inserting listings into database...\n');
    const batchSize = 25;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      await db.insert(carListing).values(batch);
      console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)} inserted`);
    }
    
    console.log('\n✅ All listings inserted!\n');
    
    // Step 5: Generate price history for some listings
    console.log('💰 Generating price history...\n');
    const priceHistoryEntries = [];
    
    for (const listing of listings) {
      if (getRandomBoolean(0.25)) {
        const numChanges = randomInt(1, 4);
        let currentPrice = listing.price;
        
        for (let i = 0; i < numChanges; i++) {
          const oldPrice = Math.floor(currentPrice * (1.05 + Math.random() * 0.1));
          const newPrice = currentPrice;
          const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
          
          priceHistoryEntries.push({
            id: `ph_${createId()}`,
            listingId: listing.id,
            oldPrice,
            newPrice,
            changePercent,
            reason: getRandomItem(priceChangeReasons),
            changedBy: null,
            createdAt: new Date(Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000),
          });
          
          currentPrice = oldPrice;
        }
      }
    }
    
    if (priceHistoryEntries.length > 0) {
      await db.insert(listingPriceHistory).values(priceHistoryEntries);
      console.log(`   ✅ Inserted ${priceHistoryEntries.length} price history entries\n`);
    }
    
    // Step 6: Update partner analytics
    console.log('📊 Updating partner analytics...\n');
    
    const activeListings = listings.filter(l => l.lifecycleStatus === 'active' && l.moderationStatus === 'approved');
    const totalValue = activeListings.reduce((sum, l) => sum + l.price, 0);
    const avgPrice = activeListings.length > 0 ? Math.floor(totalValue / activeListings.length) : 0;
    const activeBlkCount = listings.filter(l => l.isBlkListing && l.lifecycleStatus === 'active').length;
    
    await db.update(partner)
      .set({
        activeListingsCount: activeListings.length,
        totalInventoryValue: totalValue,
        avgListingPrice: avgPrice,
        activeBlackListingsCount: activeBlkCount,
        analyticsLastUpdated: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(partner.id, targetPartnerId));
    
    console.log(`   ✅ Updated partner analytics\n`);
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   User: ${targetUser.name} (${TARGET_EMAIL})`);
    console.log(`   Partner: ${targetPartnerName}`);
    console.log(`   Partner ID: ${targetPartnerId}`);
    console.log(`\n   Total listings: ${listings.length}`);
    console.log(`   • Active: ${activeListings.length}`);
    console.log(`   • Draft: ${listings.filter(l => l.moderationStatus === 'draft').length}`);
    console.log(`   • In Review: ${listings.filter(l => l.moderationStatus === 'pending_review').length}`);
    console.log(`   • Sold: ${listings.filter(l => l.lifecycleStatus === 'sold').length}`);
    console.log(`   • Archived: ${listings.filter(l => l.lifecycleStatus === 'archived').length}`);
    console.log(`   • BLK listings: ${listings.filter(l => l.isBlkListing).length}`);
    console.log(`\n   Price history entries: ${priceHistoryEntries.length}`);
    console.log(`   Total inventory value: AED ${totalValue.toLocaleString()}`);
    console.log(`   Average listing price: AED ${avgPrice.toLocaleString()}`);
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed
seedForStaff()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

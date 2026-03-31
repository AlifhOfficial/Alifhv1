/**
 * Seed Script: 1000 PRIVATE-ONLY Car Listings
 * 
 * Creates 1000 PRIVATE listings (user-owned, no dealers)
 * moderation_status=approved, lifecycle_status=active
 * Uses existing users from the database
 * Uses CDN images from https://cdn.revvup.ae/static/Black_cars/
 * 
 * MAX 3 TAGS per listing as per business rules
 * 
 * Usage: DATABASE_URL="postgresql://..." bun run src/seed-1k-private-listings.ts
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { createId } from '@paralleldrive/cuid2';
import * as schema from './schema';
import { carListing, listingPriceHistory } from './schema/listing';
import { user } from './schema';

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
  VEHICLE_EXTRAS,
  LISTING_TAGS,
  UAE_EMIRATES,
  MAX_LISTING_TAGS,
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
  type ListingModerationStatus,
  type ListingLifecycleStatus,
  type ListingPostedByRole,
} from './schema/listing-constants';

// ===== DATABASE CONNECTION =====
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql as any, { schema });

// ===== CDN IMAGE PATHS =====
const CDN_BASE = 'https://cdn.revvup.ae/static/Black_cars';

const carImages = [
  `${CDN_BASE}/car1.webp`, `${CDN_BASE}/car2.webp`, `${CDN_BASE}/car3.webp`,
  `${CDN_BASE}/car4.webp`, `${CDN_BASE}/car5.webp`, `${CDN_BASE}/car6.webp`,
  `${CDN_BASE}/car7.webp`, `${CDN_BASE}/car8.webp`, `${CDN_BASE}/car9.webp`,
  `${CDN_BASE}/car10.webp`, `${CDN_BASE}/car11.webp`, `${CDN_BASE}/car12.webp`,
  `${CDN_BASE}/car13.webp`, `${CDN_BASE}/car14.webp`, `${CDN_BASE}/car15.webp`,
  `${CDN_BASE}/car16.webp`, `${CDN_BASE}/car17.webp`, `${CDN_BASE}/car18.webp`,
  `${CDN_BASE}/car19.webp`, `${CDN_BASE}/car20.webp`, `${CDN_BASE}/car21.webp`,
  `${CDN_BASE}/car22.webp`, `${CDN_BASE}/car23.webp`, `${CDN_BASE}/car24.webp`,
  `${CDN_BASE}/car25.webp`, `${CDN_BASE}/car26.webp`, `${CDN_BASE}/car27.webp`,
  `${CDN_BASE}/car28.webp`, `${CDN_BASE}/car29.webp`, `${CDN_BASE}/car30.webp`,
  `${CDN_BASE}/car31.webp`, `${CDN_BASE}/car32.webp`, `${CDN_BASE}/car33.webp`,
  `${CDN_BASE}/car34.webp`, `${CDN_BASE}/car35.webp`, `${CDN_BASE}/car36.webp`,
  `${CDN_BASE}/car37.webp`, `${CDN_BASE}/car38.webp`, `${CDN_BASE}/car39.webp`,
  `${CDN_BASE}/car40.webp`, `${CDN_BASE}/car41.webp`, `${CDN_BASE}/car42.webp`,
  `${CDN_BASE}/car43.webp`, `${CDN_BASE}/car44.webp`, `${CDN_BASE}/car45.webp`,
  `${CDN_BASE}/car46.webp`, `${CDN_BASE}/car47.webp`, `${CDN_BASE}/car48.webp`,
  `${CDN_BASE}/car49.webp`, `${CDN_BASE}/car50.webp`, `${CDN_BASE}/car51.webp`,
  `${CDN_BASE}/car52.webp`, `${CDN_BASE}/car53.webp`, `${CDN_BASE}/car56.webp`,
  `${CDN_BASE}/car57.webp`, `${CDN_BASE}/car58.webp`, `${CDN_BASE}/car59.webp`,
  `${CDN_BASE}/car60.webp`,
];

// ===== DATA ARRAYS FOR VARIATION =====

const luxuryMakes = ['Mercedes-Benz', 'BMW', 'Porsche', 'Audi', 'Lamborghini', 'Ferrari', 'Rolls-Royce', 'Bentley', 'Lexus'] as const;

const seedMakes = [
  'Mercedes-Benz', 'BMW', 'Porsche', 'Audi', 'Land Rover', 'Lamborghini', 
  'Ferrari', 'Rolls-Royce', 'Bentley', 'Toyota', 'Nissan', 'Lexus', 
  'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Genesis', 'Mazda',
  'Volkswagen', 'Tesla', 'GMC', 'Cadillac', 'Jeep', 'Dodge', 'Ram', 'Maserati'
] as const;

const trims = ['S', 'SE', 'HSE', 'Autobiography', 'AMG', 'M Sport', 'Competition', 'Turbo', 'Turbo S', 'GTS', 'Prestige', 'Platinum', 'Limited', 'VXR', 'Sport', 'Black Edition', 'Premium', 'Executive'];

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

const extrasValues = VEHICLE_EXTRAS.map(e => e.value);
const tagsValues = LISTING_TAGS.map(t => t.value);

const emirates = UAE_EMIRATES.map(e => e.label);
const cities: Record<string, string[]> = {
  'Dubai': ['Dubai Marina', 'Downtown', 'Business Bay', 'JBR', 'Al Quoz', 'Jumeirah', 'Deira', 'Al Barsha', 'Silicon Oasis', 'Motor City'],
  'Abu Dhabi': ['Al Reem Island', 'Yas Island', 'Al Raha', 'Corniche', 'Al Ain', 'Saadiyat Island', 'Khalifa City'],
  'Sharjah': ['Al Majaz', 'Al Khan', 'Muweilah', 'Al Nahda', 'Al Taawun'],
  'Ajman': ['Al Nuaimiya', 'Al Rashidiya', 'Al Jurf'],
  'Ras Al Khaimah': ['Al Hamra', 'Al Nakheel', 'Dafan Al Nakheel', 'Khuzam'],
  'Fujairah': ['Al Faseel', 'Sakamkam', 'Dibba'],
  'Umm Al Quwain': ['Old Town', 'Falaj Al Mualla'],
};

const badges = ['verified', 'top_rated', 'price_reduced', 'hot_deal', 'new_arrival', 'featured', 'premium', 'low_mileage', 'single_owner', 'warranty'];

// ===== HELPER FUNCTIONS =====
const makeListingId = () => `listing_${createId()}`;

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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+$/, '');
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

function generateOwnerRemarks(tags: string[], isLuxury: boolean): string[] {
  const allRemarks = [
    'Always serviced at authorized dealer',
    'Garage kept since day one',
    'Non-smoker vehicle',
    'Original paint, never repainted',
    'All records and receipts available',
    'Recently detailed inside and out',
    'All keys and manuals included',
    'Extended warranty available',
    'Low mileage for the year',
    'Perfect for family use',
    'Excellent fuel economy',
    'Insurance transfer possible',
    'Bank finance available',
    'Serious buyers only',
    'Price slightly negotiable',
  ];
  
  const luxuryRemarks = [
    'Ceramic coating applied',
    'PPF on front end',
    'Carbon fiber upgrades',
    'Performance exhaust fitted',
    'Upgraded sound system',
  ];
  
  const pool = isLuxury ? [...allRemarks, ...luxuryRemarks] : allRemarks;
  return getRandomSubarray(pool, 2, 5);
}

function generateDescription(make: string, model: string, year: number, exteriorColor: string, interiorColor: string, isLuxury: boolean): string {
  const luxuryPhrases = [
    'Experience unparalleled luxury',
    'Epitome of automotive excellence',
    'Crafted to perfection',
    'Ultimate in sophistication',
    'A masterpiece of engineering',
  ];
  
  const standardPhrases = [
    'Well-maintained and ready to drive',
    'Excellent condition throughout',
    'Reliable and efficient',
    'Perfect for daily use',
    'A great choice for families',
  ];
  
  const phrase = isLuxury ? getRandomItem(luxuryPhrases) : getRandomItem(standardPhrases);
  
  return `${phrase} with this ${year} ${make} ${model}. Finished in stunning ${exteriorColor} with ${interiorColor} interior. Meticulously maintained with full service history. This vehicle combines performance, comfort, and style in one exceptional package. Contact us today for a test drive!`;
}

// ===== MAIN GENERATION FUNCTION - PRIVATE ONLY =====
function generatePrivateListing(userId: string) {
  const make = getRandomItem(seedMakes);
  const availableModels = CAR_MODELS[make] || [];
  const model = availableModels.length > 0 ? getRandomItem([...availableModels]) : 'Unknown';
  const year = randomInt(2016, 2026);
  const trim = getRandomItem(trims);
  const isLuxury = luxuryMakes.includes(make as typeof luxuryMakes[number]);
  
  const postedByRole: ListingPostedByRole = 'user';
  const moderationStatus: ListingModerationStatus = 'approved';
  const lifecycleStatus: ListingLifecycleStatus = 'active';
  const sellerType = 'private' as const;
  
  const bodyType = getRandomItem(bodyTypes);
  const fuelType = getRandomItem(fuelTypes);
  const transmission = getRandomItem(transmissions);
  const specs = getRandomItem(specsList);
  const steeringSide = getRandomItem(steeringSides);
  const exportStatus = getRandomItem(exportStatuses);
  
  const isElectric = fuelType === 'electric';
  const engineType = isElectric ? 'electric' as const : getRandomItem(engineTypes.filter(e => e !== 'electric'));
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
  const priceTrend = price < fairValue * 0.95 ? 'up' : price > fairValue * 1.05 ? 'down' : 'stable';
  
  const hasAiValuation = getRandomBoolean(0.7);
  const aiConfidenceScore = hasAiValuation ? 0.7 + Math.random() * 0.25 : undefined;
  const qiScore = randomInt(65, 98);
  
  const emirate = getRandomItem(emirates);
  const city = getRandomItem(cities[emirate] || ['Downtown']);
  
  const imageCount = randomInt(4, 10);
  const images = getRandomImages(imageCount);
  const thumbnail = images[0];
  
  const technicalFeatures = generateTechnicalFeatures(isLuxury);
  const extras = getRandomSubarray(extrasValues, 3, 8);
  
  const listingTags = getRandomSubarray(tagsValues, 1, MAX_LISTING_TAGS);
  const ownerRemarks = generateOwnerRemarks(listingTags, isLuxury);
  
  const specialNotes = {
    ownerRemarks,
    serviceHistory: listingTags.includes('serviceHistory'),
    singleOwner: listingTags.includes('singleOwner'),
    accidentFree: listingTags.includes('accidentFree'),
    underWarranty: listingTags.includes('underWarranty'),
    registeredUntil: getRandomBoolean(0.9) ? `${year + randomInt(1, 3)}-${randomInt(1, 12).toString().padStart(2, '0')}` : undefined,
  };
  
  const viewCount = randomInt(50, 3000);
  const favouriteCount = randomInt(5, 200);
  const superlikeCount = randomInt(0, 30);
  const heatScore = randomInt(0, 100);
  const impressionCount = viewCount * randomInt(5, 20);
  
  const listingBadges = getRandomSubarray(badges, 1, 4);
  
  const createdAt = new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000);
  const updatedAt = new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000);
  const publishedAt = new Date(createdAt.getTime() + randomInt(1, 12) * 60 * 60 * 1000);
  const originalPublishedAt = publishedAt;
  const approvedAt = new Date(publishedAt.getTime() - randomInt(1, 6) * 60 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const slug = generateSlug(make, model, year, trim);
  const metaTitle = `${year} ${make} ${model} ${trim} for Sale in ${emirate} | Revvup`;
  const metaDescription = `Buy this ${year} ${make} ${model} ${trim}. ${mileage.toLocaleString()} km, ${transmission}. Price: AED ${price.toLocaleString()}. Contact today!`;
  
  const description = generateDescription(make, model, year, exteriorColor, interiorColor, isLuxury);
  
  return {
    id: makeListingId(),
    vin: generateVIN(),
    slug,
    
    partnerId: null,
    userId,
    postedByStaffId: null,
    postedByRole,
    moderationStatus,
    lifecycleStatus,
    sellerType,
    isConsignment: false,
    openToConsignment: getRandomBoolean(0.2),
    
    make,
    model,
    year,
    trim,
    condition: mileage < 5000 ? 'new' as const : 'used' as const,

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
    
    price,
    currency: 'AED',
    isNegotiable: getRandomBoolean(0.7),
    
    fairValue,
    estimateMin,
    estimateMax,
    priceTrend,
    qiScore,
    aiConfidenceScore,
    aiValueFactors: hasAiValuation ? {
      positives: getRandomSubarray(['GCC specs', 'Full service history', 'Low mileage', 'Single owner', 'Original paint'], 2, 4),
      considerations: getRandomSubarray(['Mileage above average for year', 'Previous minor accident', 'Out of warranty'], 0, 1),
      marketContext: 'Market demand is steady for this model.',
    } : null,
    aiModel: hasAiValuation ? 'v1' : null,
    aiUpdatedAt: hasAiValuation ? new Date() : null,
    
    emirate,
    city,
    
    partnerBrandName: null,
    partnerVerified: false,
    
    thumbnail,
    images,
    videoUrl: null,
    description,
    
    technicalFeatures,
    extras,
    specialNotes,
    warrantyType: getRandomItem(warrantyTypes),
    
    exportStatus,
    
    badges: listingBadges,
    tags: listingTags,
    isBlkListing: false,
    
    impressionCount,
    viewCount,
    favouriteCount,
    superlikeCount,
    
    heatScore,
    heatScoreUpdatedAt: heatScore > 0 ? new Date() : null,
    
    metaTitle,
    metaDescription,
    
    reservedAt: null,
    reservedBy: null,
    soldAt: null,
    soldTo: null,
    soldPrice: null,
    
    createdAt,
    updatedAt,
    lastEditedAt: updatedAt,
    submittedAt: new Date(createdAt.getTime() + randomInt(1, 12) * 60 * 60 * 1000),
    approvedAt,
    lastModeratedAt: approvedAt,
    needsRemoderation: false,
    publishedAt,
    originalPublishedAt,
    expiresAt,
    extensionCount: 0,
    extensionHistory: [],
    lastExtendedAt: null,
    archivedAt: null,
    deletedAt: null,
    rejectionReason: null,
  };
}

// ===== MAIN SEED FUNCTION =====
async function seed1kPrivateListings() {
  console.log('\n' + '='.repeat(60));
  console.log('🚗 SEED 1000 PRIVATE-ONLY LISTINGS');
  console.log('='.repeat(60) + '\n');

  try {
    const users = await db.select().from(user);
    
    if (users.length === 0) {
      console.error('❌ No users found! Please add users first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${users.length} users\n`);
    
    const listings = [];
    const totalListings = 1000;
    
    console.log(`📝 Generating ${totalListings} PRIVATE listings...\n`);
    
    for (let i = 0; i < totalListings; i++) {
      const selectedUserId = getRandomItem(users).id;
      
      const listing = generatePrivateListing(selectedUserId);
      listings.push(listing);
      
      if ((i + 1) % 100 === 0) {
        console.log(`   Generated ${i + 1}/${totalListings}...`);
      }
    }
    
    console.log(`\n✅ Generated ${listings.length} PRIVATE listings\n`);
    
    console.log('💾 Inserting into database...\n');
    const batchSize = 50;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      await db.insert(carListing).values(batch);
      console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)} inserted`);
    }
    
    console.log('\n✅ All listings inserted!\n');
    
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   Total listings: ${listings.length}`);
    console.log(`   All Private Only: ✅`);
    console.log(`   All Active & Approved: ✅`);
    console.log(`   Max tags per listing: ${MAX_LISTING_TAGS}`);
    console.log(`   Images from CDN: ${CDN_BASE}/`);
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

seed1kPrivateListings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

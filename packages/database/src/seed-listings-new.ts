/**
 * Clean Seed Script for Car Listings
 * Creates 100 sample listings using car images from /public/Black_cars/
 * Matches the exact schema from listing.ts
 */

import 'dotenv/config';
import { db } from './dbclient';
import { carListing, listingPriceHistory } from './schema/listing';
import { partner } from './schema/partner';
import { user } from './schema';
import { createId } from '@paralleldrive/cuid2';

const makeListingId = () => `listing_${createId()}`;

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

// ===== DATA ARRAYS FOR VARIATION =====
const makesAndModels: Record<string, string[]> = {
  'Mercedes-Benz': ['S-Class', 'G-Class', 'E-Class', 'C-Class', 'GLE', 'GLS', 'AMG GT', 'Maybach S-Class'],
  'BMW': ['7 Series', 'X7', 'X5', 'M5', 'M4', 'M3', 'XM', 'i7', 'iX'],
  'Porsche': ['911', 'Cayenne', 'Panamera', 'Taycan', 'Macan', '718'],
  'Audi': ['RS Q8', 'RS7', 'RS6', 'e-tron GT', 'Q8', 'A8', 'R8'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Defender 110', 'Defender 90'],
  'Lamborghini': ['Urus', 'Huracan', 'Aventador'],
  'Ferrari': ['F8 Tributo', 'Roma', '296 GTB', 'SF90 Stradale'],
  'Rolls-Royce': ['Cullinan', 'Ghost', 'Phantom', 'Spectre'],
  'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur'],
  'Toyota': ['Land Cruiser', 'Camry', 'Corolla', 'RAV4', 'Prado'],
  'Nissan': ['Patrol', 'Altima', 'Maxima', 'X-Trail'],
  'Lexus': ['LX 600', 'LS', 'ES', 'RX', 'NX'],
  'Chevrolet': ['Tahoe', 'Suburban', 'Silverado', 'Corvette'],
  'Ford': ['F-150', 'Mustang', 'Explorer', 'Expedition'],
};

const trims = ['S', 'SE', 'HSE', 'Autobiography', 'AMG', 'M Sport', 'Competition', 'Turbo', 'Turbo S', 'GTS', 'Prestige', 'Platinum', 'Limited', 'VXR'];

// Enum values matching schema
const bodyTypes = ['sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'wagon', 'pickup', 'van', 'sports', 'luxury', 'other'] as const;
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen'] as const;
const transmissions = ['automatic', 'manual', 'cvt', 'dct', 'semi_automatic'] as const;
const specsList = ['gcc', 'american', 'european', 'japanese', 'canadian', 'other'] as const;
const steeringSides = ['left', 'right'] as const;
const exportStatuses = ['local_only', 'gcc', 'international', 'restricted'] as const;
const engineSizes = ['1.0L', '1.2L', '1.4L', '1.5L', '1.6L', '1.8L', '2.0L', '2.2L', '2.4L', '2.5L', '2.7L', '3.0L', '3.2L', '3.5L', '3.6L', '3.8L', '4.0L', '4.4L', '4.5L', '4.6L', '5.0L', '5.2L', '5.5L', '5.7L', '6.0L', '6.2L', '6.4L', '7.0L', '8.0L', 'other'] as const;
const engineTypes = ['inline-3', 'inline-4', 'inline-6', 'v6', 'v8', 'v10', 'v12', 'w12', 'electric', 'hybrid', 'other'] as const;
const powerRanges = ['under_100', '100_200', '200_300', '300_400', '400_500', '500_600', '600_700', '700_plus', 'unknown'] as const;
const doors = ['2', '3', '4', '5', '6'] as const;
const seatingCapacities = ['2', '4', '5', '6', '7', '8', '9_plus'] as const;
const exteriorColors = ['white', 'black', 'silver', 'grey', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple', 'other'] as const;
const interiorColors = ['black', 'beige', 'brown', 'tan', 'grey', 'white', 'red', 'burgundy', 'other'] as const;
const warrantyTypes = ['none', 'manufacturer', 'extended', 'dealer', 'other'] as const;
const listingStatuses = ['draft', 'pending', 'published', 'reserved', 'sold', 'archived', 'rejected'] as const;
const sellerTypes = ['dealer', 'private', 'consignment'] as const;

const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
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
const tags = ['luxury', 'family_car', 'low_mileage', 'sports', 'off_road', 'hybrid', 'electric', 'performance', 'economy', 'rare', 'collector', 'modified'];
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
    // Safety
    abs: getRandomBoolean(0.95),
    airbags: randomInt(2, 12),
    parkingSensors: getRandomBoolean(0.8),
    rearCamera: getRandomBoolean(0.9),
    blindSpotMonitor: getRandomBoolean(0.7),
    laneAssist: getRandomBoolean(0.6),
    adaptiveCruise: getRandomBoolean(isLuxury ? 0.9 : 0.4),
    collisionWarning: getRandomBoolean(0.7),
    
    // Comfort
    leatherSeats: getRandomBoolean(isLuxury ? 0.95 : 0.5),
    heatedSeats: getRandomBoolean(isLuxury ? 0.9 : 0.3),
    ventilatedSeats: getRandomBoolean(isLuxury ? 0.85 : 0.2),
    sunroof: getRandomBoolean(0.6),
    panoramicRoof: getRandomBoolean(isLuxury ? 0.7 : 0.3),
    climateControl: getRandomBoolean(0.9),
    powerSeats: getRandomBoolean(0.85),
    memorySeats: getRandomBoolean(isLuxury ? 0.8 : 0.4),
    
    // Technology
    touchscreen: getRandomBoolean(0.95),
    screenSize: getRandomItem(['7"', '8.4"', '10.25"', '12.3"', '14.9"', '17.7"']),
    appleCarPlay: getRandomBoolean(0.85),
    androidAuto: getRandomBoolean(0.8),
    bluetooth: getRandomBoolean(0.98),
    navigation: getRandomBoolean(0.8),
    soundSystem: isLuxury ? getRandomItem(['Burmester', 'Bang & Olufsen', 'Harman Kardon', 'Mark Levinson', 'Meridian']) : undefined,
    wirelessCharging: getRandomBoolean(0.6),
    
    // Performance
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
  isBlackMember: boolean,
  userId: string | null,
  reservedByUserId: string | null,
  soldToUserId: string | null,
  reviewerId: string | null
) {
  // Vehicle basics
  const make = getRandomItem(Object.keys(makesAndModels));
  const model = getRandomItem(makesAndModels[make]);
  const year = randomInt(2016, 2025);
  const trim = getRandomItem(trims);
  const isLuxury = ['Mercedes-Benz', 'BMW', 'Porsche', 'Audi', 'Lamborghini', 'Ferrari', 'Rolls-Royce', 'Bentley', 'Lexus'].includes(make);
  
  // Status distribution - mostly published
  const statusWeights = [
    { status: 'published' as const, weight: 0.75 },
    { status: 'draft' as const, weight: 0.08 },
    { status: 'reserved' as const, weight: 0.06 },
    { status: 'sold' as const, weight: 0.06 },
    { status: 'archived' as const, weight: 0.02 },
    { status: 'pending' as const, weight: 0.02 },
    { status: 'rejected' as const, weight: 0.01 },
  ];
  
  let status: typeof listingStatuses[number] = 'published';
  let rand = Math.random();
  let cumulative = 0;
  for (const { status: s, weight } of statusWeights) {
    cumulative += weight;
    if (rand <= cumulative) {
      status = s;
      break;
    }
  }
  
  // Seller type
  const sellerType = userId ? getRandomItem(['private', 'consignment'] as const) : 'dealer' as const;
  const isConsignment = sellerType === 'consignment';
  
  // Specs
  const bodyType = getRandomItem(bodyTypes);
  const fuelType = getRandomItem(fuelTypes);
  const transmission = getRandomItem(transmissions);
  const specs = getRandomItem(specsList);
  const steeringSide = getRandomItem(steeringSides);
  const exportStatus = getRandomItem(exportStatuses);
  
  // Engine
  const isElectric = fuelType === 'electric';
  const engineType = isElectric ? 'electric' as const : getRandomItem(engineTypes);
  const cylinders = isElectric ? undefined : randomInt(3, 12);
  const engineSize = isElectric ? undefined : getRandomItem(engineSizes);
  const powerRange = isElectric ? 'unknown' as const : getRandomItem(powerRanges);
  
  // Physical
  const doorCount = getRandomItem(doors);
  const seatingCapacity = doorCount === '2' ? getRandomItem(['2', '4'] as const) : getRandomItem(seatingCapacities);
  const exteriorColor = getRandomItem(exteriorColors);
  const interiorColor = getRandomItem(interiorColors);
  
  // Mileage based on age
  const carAge = 2025 - year;
  const baseMileage = carAge * randomInt(8000, 20000);
  const mileage = Math.max(500, baseMileage + randomInt(-3000, 3000));
  
  // Pricing in AED (actual price, not cents)
  const basePrice = isLuxury ? randomInt(150000, 1500000) : randomInt(25000, 350000);
  const price = basePrice;
  const fairValue = Math.floor(price * (0.9 + Math.random() * 0.2));
  const estimateMin = Math.floor(fairValue * 0.9);
  const estimateMax = Math.floor(fairValue * 1.1);
  const priceTrend = price < fairValue * 0.95 ? 'below_market' : price > fairValue * 1.05 ? 'above_market' : 'at_market';
  
  // AI Pricing (optional)
  const hasAiPricing = getRandomBoolean(0.7);
  const aiEstimatedPrice = hasAiPricing ? Math.floor(price * (0.95 + Math.random() * 0.1)) : undefined;
  const aiPriceMin = hasAiPricing ? Math.floor(aiEstimatedPrice! * 0.9) : undefined;
  const aiPriceMax = hasAiPricing ? Math.floor(aiEstimatedPrice! * 1.1) : undefined;
  const aiConfidenceScore = hasAiPricing ? 0.7 + Math.random() * 0.25 : undefined;
  
  // Location
  const emirate = getRandomItem(emirates);
  const city = getRandomItem(cities[emirate]);
  
  // Media - using local images
  const imageCount = randomInt(4, 10);
  const images = getRandomImages(imageCount);
  const thumbnail = images[0];
  const videoUrl = getRandomBoolean(0.2) ? `https://www.youtube.com/watch?v=${createId().slice(0, 11)}` : undefined;
  
  // Features
  const technicalFeatures = generateTechnicalFeatures(isLuxury);
  const extras = getRandomSubarray([
    'Premium Sound System', 'Panoramic Sunroof', 'Massage Seats', '360 Camera',
    'Night Vision', 'Air Suspension', 'Heads-Up Display', 'Soft Close Doors',
    'Ambient Lighting', 'Keyless Entry', 'Remote Start', 'Heated Steering Wheel',
  ], 3, 8);
  const specialNotes = generateSpecialNotes(year);
  
  // Quality scores
  const qiScore = randomInt(65, 98) / 100;
  
  // Engagement metrics
  const viewCount = status === 'published' ? randomInt(50, 3000) : randomInt(0, 50);
  const favouriteCount = status === 'published' ? randomInt(5, 200) : randomInt(0, 10);
  const superlikeCount = status === 'published' ? randomInt(0, 30) : 0;
  
  // Heat score for trending cars
  const heatScore = status === 'published' ? randomInt(0, 100) : 0;
  
  // Badges and tags
  const listingBadges = getRandomSubarray(badges, 1, 4);
  const listingTags = getRandomSubarray(tags, 2, 5);
  
  // Timestamps
  const createdAt = new Date(Date.now() - randomInt(1, 120) * 24 * 60 * 60 * 1000);
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
  
  // Review info
  const reviewedAt = ['published', 'rejected'].includes(status) ? publishedAt : undefined;
  const rejectionReason = status === 'rejected' ? getRandomItem([
    'Images not clear enough',
    'Missing required documentation',
    'Price significantly above market value',
    'Duplicate listing',
    'Incomplete vehicle information'
  ]) : undefined;
  
  // SEO
  const slug = generateSlug(make, model, year, trim);
  const metaTitle = `${year} ${make} ${model} ${trim} for Sale in ${emirate} | Alifh`;
  const metaDescription = `Buy this ${year} ${make} ${model} ${trim}. ${mileage.toLocaleString()} km, ${transmission}. Price: AED ${price.toLocaleString()}. Contact dealer today!`;
  
  // Description
  const description = generateDescription(make, model, year, exteriorColor, interiorColor, isLuxury);
  
  // Partner brand info
  const partnerBrandName = sellerType === 'dealer' ? getRandomItem(['Luxury Motors Dubai', 'Premium Auto Trading', 'Elite Motors Abu Dhabi']) : undefined;
  const partnerVerified = sellerType === 'dealer' ? getRandomBoolean(0.9) : false;
  
  return {
    id: makeListingId(),
    vin: generateVIN(),
    
    // Ownership
    partnerId: sellerType === 'dealer' || sellerType === 'consignment' ? partnerId : null,
    userId: sellerType === 'private' ? userId : null,
    postedByStaffId: null,
    sellerType,
    isConsignment,
    
    // Basic vehicle info
    make,
    model,
    year,
    trim,
    
    // Vehicle specs
    bodyType,
    fuelType,
    transmission,
    specs,
    steeringSide,
    
    // Engine
    engineSize,
    engineType,
    cylinders,
    powerRange,
    torque: cylinders ? `${randomInt(250, 850)} Nm` : null,
    fuelEconomy: isElectric ? null : `${randomInt(7, 18)} L/100km`,
    
    // Physical specs
    doors: doorCount,
    seatingCapacity,
    exteriorColor,
    interiorColor,
    
    // Condition
    mileage,
    
    // Pricing
    price,
    currency: 'AED',
    isNegotiable: getRandomBoolean(0.7),
    
    // AI Pricing
    aiEstimatedPrice,
    aiPriceMin,
    aiPriceMax,
    aiConfidenceScore,
    aiPriceUpdatedAt: hasAiPricing ? new Date() : null,
    aiModel: hasAiPricing ? 'v1' : null,
    
    // Market analysis
    fairValue,
    estimateMin,
    estimateMax,
    priceTrend,
    qiScore,
    
    // Location
    emirate,
    city,
    
    // Partner info
    partnerBrandName,
    partnerVerified,
    
    // Media
    thumbnail,
    images,
    videoUrl,
    description,
    
    // Features
    technicalFeatures,
    extras,
    specialNotes,
    warrantyType: getRandomItem(warrantyTypes),
    
    // Status
    status,
    exportStatus,
    
    // Badges & Tags
    badges: listingBadges,
    tags: listingTags,
    isBlackMember,
    
    // Engagement
    viewCount,
    favouriteCount,
    superlikeCount,
    
    // Heat score
    heatScore,
    heatScoreUpdatedAt: heatScore > 0 ? new Date() : null,
    
    // SEO
    slug,
    metaTitle,
    metaDescription,
    
    // Reservation & Sale
    reservedAt,
    reservedBy: ['reserved', 'sold'].includes(status) ? reservedByUserId : null,
    soldAt,
    soldTo: status === 'sold' ? soldToUserId : null,
    soldPrice,
    
    // Timestamps
    createdAt,
    updatedAt,
    publishedAt,
    archivedAt,
    
    // Moderation
    reviewedBy: ['published', 'rejected'].includes(status) ? reviewerId : null,
    reviewedAt,
    rejectionReason,
  };
}

// ===== MAIN SEED FUNCTION =====
async function seedListings() {
  console.log('\n' + '='.repeat(60));
  console.log('🚗 ALIFH LISTINGS SEED SCRIPT');
  console.log('='.repeat(60) + '\n');

  try {
    // Get all partners
    const partners = await db.select().from(partner);
    
    if (partners.length === 0) {
      console.error('❌ No partners found! Please run the main seed script first:');
      console.error('   bun run scripts/seed-all.ts\n');
      process.exit(1);
    }
    
    console.log(`✅ Found ${partners.length} partners`);
    
    // Get partners by tier
    const blackPartners = partners.filter(p => p.tier === 'black');
    const platinumPartners = partners.filter(p => p.tier === 'platinum');
    const goldPartners = partners.filter(p => p.tier === 'gold');
    const regularPartners = partners.filter(p => p.tier === 'standard');
    
    console.log(`   • Black tier: ${blackPartners.length}`);
    console.log(`   • Platinum tier: ${platinumPartners.length}`);
    console.log(`   • Gold tier: ${goldPartners.length}`);
    console.log(`   • Standard tier: ${regularPartners.length}\n`);
    
    // Get users for reservations/sales
    const users = await db.select().from(user).limit(20);
    console.log(`✅ Found ${users.length} users\n`);
    
    // Generate listings
    const listings = [];
    const totalListings = 100;
    
    console.log(`📝 Generating ${totalListings} listings...\n`);
    
    for (let i = 0; i < totalListings; i++) {
      // Distribute listings across partner tiers
      let selectedPartner;
      let isBlackMember = false;
      
      if (blackPartners.length > 0 && getRandomBoolean(0.15)) {
        selectedPartner = getRandomItem(blackPartners);
        isBlackMember = true;
      } else if (platinumPartners.length > 0 && getRandomBoolean(0.3)) {
        selectedPartner = getRandomItem(platinumPartners);
      } else if (goldPartners.length > 0 && getRandomBoolean(0.3)) {
        selectedPartner = getRandomItem(goldPartners);
      } else if (regularPartners.length > 0) {
        selectedPartner = getRandomItem(regularPartners);
      } else {
        selectedPartner = getRandomItem(partners);
      }
      
      // Small chance of private listings
      const isPrivate = getRandomBoolean(0.08);
      const listingUserId = isPrivate && users.length > 0 ? getRandomItem(users).id : null;
      
      // Random users for reservations/sales
      const reservedByUserId = users.length > 0 ? getRandomItem(users).id : null;
      const soldToUserId = users.length > 0 ? getRandomItem(users).id : null;
      const reviewerId = users.length > 0 ? getRandomItem(users).id : null;
      
      const listing = generateListing(
        i,
        selectedPartner.id,
        isBlackMember,
        listingUserId,
        reservedByUserId,
        soldToUserId,
        reviewerId
      );
      
      listings.push(listing);
      
      if ((i + 1) % 20 === 0) {
        console.log(`   Generated ${i + 1}/${totalListings}...`);
      }
    }
    
    console.log(`\n✅ Generated ${listings.length} listings\n`);
    
    // Insert in batches
    console.log('💾 Inserting into database...\n');
    const batchSize = 25;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      await db.insert(carListing).values(batch);
      console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)} inserted`);
    }
    
    console.log('\n✅ All listings inserted!\n');
    
    // Generate price history for some listings
    console.log('💰 Generating price history...\n');
    const priceHistoryEntries = [];
    
    for (const listing of listings) {
      if (getRandomBoolean(0.25)) { // 25% of listings have price history
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
            changedBy: listing.userId || null,
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
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:\n');
    console.log(`   Total listings: ${listings.length}`);
    console.log(`   • Published: ${listings.filter(l => l.status === 'published').length}`);
    console.log(`   • Draft: ${listings.filter(l => l.status === 'draft').length}`);
    console.log(`   • Reserved: ${listings.filter(l => l.status === 'reserved').length}`);
    console.log(`   • Sold: ${listings.filter(l => l.status === 'sold').length}`);
    console.log(`   • Archived: ${listings.filter(l => l.status === 'archived').length}`);
    console.log(`   • Pending: ${listings.filter(l => l.status === 'pending').length}`);
    console.log(`   • Rejected: ${listings.filter(l => l.status === 'rejected').length}`);
    console.log(`\n   Black member listings: ${listings.filter(l => l.isBlackMember).length}`);
    console.log(`   Private listings: ${listings.filter(l => l.sellerType === 'private').length}`);
    console.log(`   Consignment: ${listings.filter(l => l.isConsignment).length}`);
    console.log(`\n   Price history entries: ${priceHistoryEntries.length}`);
    console.log(`\n   Images used from: /public/Black_cars/`);
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed
seedListings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

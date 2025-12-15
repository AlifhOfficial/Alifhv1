/**
 * Comprehensive Seed Script for Car Listings
 * Seeds ALL data points from the schema with proper variation
 * - Different seller types (dealer, private, consignment)
 * - Black tier partners vs regular
 * - All statuses (draft, published, reserved, sold, archived)
 * - Full technical features
 * - Special notes and warranty info
 * - Pricing history
 * - All enums covered
 */

import 'dotenv/config';
import { db } from './dbclient';
import { carListing, listingPriceHistory } from './schema/listing';
import { partner } from './schema/partner';
import { user } from './schema';
import { createId } from '@paralleldrive/cuid2';

const makeListingId = () => `listing_${createId()}`;

// ===== DATA ARRAYS FOR VARIATION =====

const makesAndModels = {
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

const bodyTypes = ['sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'wagon', 'pickup', 'van', 'sports', 'luxury', 'other'];
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen'];
const transmissions = ['automatic', 'manual', 'cvt', 'dct', 'semi_automatic'];
const specsList = ['gcc', 'american', 'european', 'japanese', 'canadian', 'other'];
const steeringSides = ['left', 'right'];
const exportStatuses = ['local_only', 'gcc', 'international', 'restricted'];

const colors = [
  'Obsidian Black', 'Jet Black', 'Metallic Black', 'Midnight Black', 'Onyx Black',
  'Pearl White', 'Alpine White', 'Diamond White', 'Glacier White',
  'Space Gray', 'Nardo Gray', 'Ceramic Gray', 'Thunder Gray',
  'Racing Red', 'Carmine Red', 'Ruby Red',
  'Royal Blue', 'Marina Blue', 'Portofino Blue',
  'British Racing Green', 'Racing Green',
  'Desert Gold', 'Bronze Metallic', 'Champagne Gold'
];

const interiorColors = ['Black', 'Red', 'Tan', 'White', 'Brown', 'Beige', 'Saddle', 'Cognac', 'Oyster', 'Navy'];
const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
const cities = {
  'Dubai': ['Dubai Marina', 'Downtown', 'Business Bay', 'JBR', 'Al Quoz', 'Jumeirah', 'Deira'],
  'Abu Dhabi': ['Al Reem Island', 'Yas Island', 'Al Raha', 'Corniche', 'Al Ain'],
  'Sharjah': ['Al Majaz', 'Al Khan', 'Muweilah', 'Al Nahda'],
  'Ajman': ['Al Nuaimiya', 'Al Rashidiya', 'Al Jurf'],
  'Ras Al Khaimah': ['Al Hamra', 'Al Nakheel', 'Dafan Al Nakheel'],
  'Fujairah': ['Al Faseel', 'Sakamkam', 'Dibba'],
  'Umm Al Quwain': ['Old Town', 'Falaj Al Mualla'],
};

const engineTypes = ['V6', 'V8', 'V12', 'Inline-4', 'Inline-6', 'W12', 'Electric', 'Hybrid'];

const statuses = ['draft', 'pending', 'published', 'reserved', 'sold', 'archived', 'rejected'];
const sellerTypes = ['dealer', 'private', 'consignment'];

const badges = ['verified', 'top_rated', 'price_reduced', 'hot_deal', 'new_arrival', 'featured', 'premium', 'low_mileage', 'single_owner', 'warranty'];
const tags = ['luxury', 'family_car', 'low_mileage', 'sports', 'off_road', 'hybrid', 'electric', 'performance', 'economy', 'rare', 'collector', 'modified'];

const priceTrends = ['below_market', 'at_market', 'above_market'];

const warranties = [
  'Factory warranty until 2026',
  'Extended warranty available',
  'Dealer warranty - 1 year',
  'Manufacturer warranty - 2 years remaining',
  'No warranty',
  'CPO warranty - 3 years',
];

const priceChangeReasons = ['market_adjustment', 'quick_sale', 'seasonal', 'competitor_pricing', 'demand_increase', 'price_correction'];

// ===== HELPER FUNCTIONS =====

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubarray<T>(arr: T[], min: number, max: number): T[] {
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

function generateImages(count: number): string[] {
  const images: string[] = [];
  const totalImages = 60;
  for (let i = 0; i < count; i++) {
    const imgIndex = randomInt(1, totalImages);
    images.push(`/Black_cars/car${imgIndex}.webp`);
  }
  return images;
}

function generateSlug(make: string, model: string, year: number, trim: string): string {
  return `${year}-${make}-${model}-${trim}-${createId().slice(0, 8)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function generateDescription(make: string, model: string, year: number, color: string, interiorColor: string, isLuxury: boolean): string {
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
  
  return `${phrase} with this ${year} ${make} ${model}. Finished in stunning ${color} with ${interiorColor} interior. Meticulously maintained with full service history. This vehicle combines performance, comfort, and style in one exceptional package. Don't miss this opportunity to own this remarkable vehicle.`;
}

// ===== MAIN GENERATION FUNCTION =====

function generateComprehensiveListing(
  index: number,
  partnerId: string,
  isBlackMember: boolean,
  userId: string | null,
  reservedByUserId: string | null,
  soldToUserId: string | null
) {
  // Vehicle basics
  const make = getRandomItem(Object.keys(makesAndModels));
  const model = getRandomItem(makesAndModels[make as keyof typeof makesAndModels]);
  const year = randomInt(2015, 2025);
  const trim = getRandomItem(trims);
  const isLuxury = ['Mercedes-Benz', 'BMW', 'Porsche', 'Audi', 'Lamborghini', 'Ferrari', 'Rolls-Royce', 'Bentley'].includes(make);
  
  // Status distribution
  const statusWeights = [
    { status: 'published', weight: 0.7 }, // 70% published
    { status: 'draft', weight: 0.1 },     // 10% draft
    { status: 'reserved', weight: 0.08 }, // 8% reserved
    { status: 'sold', weight: 0.07 },     // 7% sold
    { status: 'archived', weight: 0.03 }, // 3% archived
    { status: 'pending', weight: 0.015 }, // 1.5% pending
    { status: 'rejected', weight: 0.005 },// 0.5% rejected
  ];
  
  let status = 'published';
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
  const sellerType = userId ? getRandomItem(['private', 'consignment']) : 'dealer';
  const isConsignment = sellerType === 'consignment';
  
  // Specs
  const bodyType = getRandomItem(bodyTypes);
  const fuelType = getRandomItem(fuelTypes);
  const transmission = getRandomItem(transmissions);
  const specs = getRandomItem(specsList);
  const steeringSide = getRandomItem(steeringSides);
  const exportStatus = getRandomItem(exportStatuses);
  
  // Engine
  const engineType = fuelType === 'electric' ? 'Electric' : getRandomItem(engineTypes);
  const cylinders = fuelType === 'electric' ? undefined : randomInt(3, 12);
  const engineSize = fuelType === 'electric' ? undefined : `${(Math.random() * 4 + 1.5).toFixed(1)}L`;
  
  // Physical
  const doors = getRandomItem([2, 4, 5]);
  const seatingCapacity = doors === 2 ? getRandomItem([2, 4]) : getRandomItem([4, 5, 7, 8]);
  const exteriorColor = getRandomItem(colors);
  const interiorColor = getRandomItem(interiorColors);
  
  // Mileage (older cars = more mileage)
  const carAge = 2025 - year;
  const baseMileage = carAge * randomInt(8000, 25000);
  const mileage = Math.max(100, baseMileage + randomInt(-5000, 5000));
  
  // Pricing (in AED cents)
  const basePrice = isLuxury ? randomInt(200000, 2000000) : randomInt(30000, 500000);
  const price = basePrice * 100; // Convert to cents
  const fairValue = Math.floor(price * (0.9 + Math.random() * 0.2)); // ±10%
  const estimateMin = Math.floor(fairValue * 0.9);
  const estimateMax = Math.floor(fairValue * 1.1);
  const priceTrend = price < fairValue * 0.95 ? 'below_market' : price > fairValue * 1.05 ? 'above_market' : 'at_market';
  
  // Location
  const emirate = getRandomItem(emirates);
  const city = getRandomItem(cities[emirate as keyof typeof cities]);
  
  // Media
  const imageCount = randomInt(3, 12);
  const images = generateImages(imageCount);
  const thumbnail = images[0];
  const videoUrl = getRandomBoolean(0.3) ? `https://www.youtube.com/watch?v=${createId().slice(0, 11)}` : undefined;
  
  // Features
  const technicalFeatures = generateTechnicalFeatures(isLuxury);
  const extras = getRandomSubarray([
    'Premium Sound System', 'Panoramic Sunroof', 'Massage Seats', '360 Camera',
    'Night Vision', 'Air Suspension', 'Heads-Up Display', 'Soft Close Doors',
    'Ambient Lighting', 'Keyless Entry', 'Remote Start', 'Heated Steering Wheel',
  ], 2, 8);
  const specialNotes = generateSpecialNotes(year);
  
  // Quality & Rankings
  const qiScore = randomInt(60, 100);
  const performanceScore = randomInt(50, 100);
  
  // Engagement metrics
  const daysOnMarket = status === 'published' ? randomInt(1, 120) : undefined;
  const viewCount = status === 'published' ? randomInt(10, 5000) : 0;
  const favouriteCount = status === 'published' ? randomInt(0, 300) : 0;
  const superlikeCount = status === 'published' ? randomInt(0, 50) : 0;
  const shareCount = status === 'published' ? randomInt(0, 100) : 0;
  
  // Lead metrics
  const inquiryCount = status === 'published' ? randomInt(0, 150) : 0;
  const bookingCount = inquiryCount > 0 ? randomInt(0, Math.floor(inquiryCount * 0.3)) : 0;
  const callCount = status === 'published' ? randomInt(0, 80) : 0;
  const whatsappCount = status === 'published' ? randomInt(0, 120) : 0;
  
  const leadQuality = inquiryCount > 0 ? randomInt(50, 100) : undefined;
  const conversionRate = inquiryCount > 0 ? (bookingCount / inquiryCount) * 100 : undefined;
  
  // Badges and tags
  const listingBadges = getRandomSubarray(badges, 0, 4);
  const listingTags = getRandomSubarray(tags, 1, 5);
  
  // Featured listings (20% if black member, 5% otherwise)
  const isFeatured = getRandomBoolean(isBlackMember ? 0.2 : 0.05);
  
  // Timestamps
  const createdAt = new Date(Date.now() - randomInt(1, 180) * 24 * 60 * 60 * 1000);
  const publishedAt = status === 'published' || status === 'reserved' || status === 'sold' 
    ? new Date(createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000)
    : undefined;
  
  const reservedAt = status === 'reserved' || status === 'sold'
    ? new Date(publishedAt!.getTime() + randomInt(1, 60) * 24 * 60 * 60 * 1000)
    : undefined;
  
  const soldAt = status === 'sold'
    ? new Date(reservedAt!.getTime() + randomInt(1, 14) * 24 * 60 * 60 * 1000)
    : undefined;
  
  const soldPrice = status === 'sold' ? Math.floor(price * (0.85 + Math.random() * 0.15)) : undefined;
  const avgTimeToSale = status === 'sold' && publishedAt && soldAt
    ? Math.floor((soldAt.getTime() - publishedAt.getTime()) / (24 * 60 * 60 * 1000))
    : undefined;
  
  const archivedAt = status === 'archived' ? new Date() : undefined;
  
  // Price changes
  const priceChanges = getRandomBoolean(0.3) ? randomInt(1, 5) : 0;
  const lastPriceChange = priceChanges > 0 ? new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000) : undefined;
  
  // Warranty
  const warranty = getRandomItem(warranties);
  
  // SEO
  const slug = generateSlug(make, model, year, trim);
  const metaTitle = `${year} ${make} ${model} ${trim} for Sale in ${emirate} - Alifh`;
  const metaDescription = `Buy this ${year} ${make} ${model} ${trim} in ${exteriorColor}. ${mileage.toLocaleString()} km. ${transmission}. Price: AED ${(price / 100).toLocaleString()}. Contact us today!`;
  
  // Description
  const description = generateDescription(make, model, year, exteriorColor, interiorColor, isLuxury);
  
  // Rejection reason (only for rejected listings)
  const rejectionReason = status === 'rejected' ? getRandomItem([
    'Images not clear enough',
    'Missing required documentation',
    'Price significantly above market value',
    'Duplicate listing',
    'Incomplete vehicle information'
  ]) : undefined;
  
  return {
    id: makeListingId(),
    vin: generateVIN(),
    
    // Ownership
    partnerId: sellerType === 'dealer' || sellerType === 'consignment' ? partnerId : undefined,
    userId: sellerType === 'private' ? userId : undefined,
    sellerType,
    isConsignment,
    
    // Basic info
    make,
    model,
    year,
    trim,
    
    // Specs
    bodyType,
    fuelType,
    transmission,
    specs,
    steeringSide,
    
    // Engine
    engineSize,
    engineType,
    cylinders,
    power: cylinders ? `${randomInt(150, 800)} HP` : undefined,
    torque: cylinders ? `${randomInt(200, 1000)} Nm` : undefined,
    fuelEconomy: `${randomInt(6, 20)} L/100km`,
    
    // Physical
    doors,
    seatingCapacity,
    exteriorColor,
    interiorColor,
    
    // Condition
    mileage,
    
    // Pricing (in cents)
    price,
    currency: 'AED',
    isNegotiable: getRandomBoolean(0.7),
    fairValue,
    estimateMin,
    estimateMax,
    priceTrend,
    qiScore,
    
    // Location
    emirate,
    city,
    
    // Media
    thumbnail,
    images,
    videoUrl,
    description,
    
    // Features
    technicalFeatures,
    extras,
    specialNotes,
    warranty,
    
    // Status
    status,
    exportStatus,
    
    // Badges & Tags
    badges: listingBadges,
    tags: listingTags,
    isFeatured,
    isBlackMember,
    
    // Engagement
    viewCount,
    favouriteCount,
    superlikeCount,
    shareCount,
    inquiryCount,
    bookingCount,
    callCount,
    whatsappCount,
    leadQuality,
    conversionRate,
    avgTimeToSale,
    
    // SEO
    slug,
    metaTitle,
    metaDescription,
    
    // Reservation & Sale
    reservedAt,
    reservedBy: status === 'reserved' || status === 'sold' ? reservedByUserId : undefined,
    soldAt,
    soldTo: status === 'sold' ? soldToUserId : undefined,
    soldPrice,
    
    // Timestamps
    createdAt,
    updatedAt: new Date(),
    publishedAt,
    archivedAt,
    
    // Moderation
    reviewedBy: status === 'rejected' || status === 'published' ? getRandomItem([null, userId, reservedByUserId]) : undefined,
    reviewedAt: status === 'rejected' || status === 'published' ? publishedAt : undefined,
    rejectionReason,
    
    // Performance
    performanceScore,
    daysOnMarket,
    priceChanges,
    lastPriceChange,
  };
}

// ===== SEED FUNCTION =====

async function seedComprehensiveListings() {
  console.log('🌱 Starting comprehensive listing seed...\n');

  try {
    // Get all partners
    const partners = await db.select().from(partner);
    
    if (partners.length === 0) {
      console.error('❌ No partners found! Please run partner seeding first.');
      process.exit(1);
    }
    
    console.log(`📍 Found ${partners.length} partners\n`);
    
    // Get black tier partners
    const blackPartners = partners.filter(p => p.tier === 'black');
    const regularPartners = partners.filter(p => p.tier !== 'black');
    
    console.log(`   - Black tier: ${blackPartners.length}`);
    console.log(`   - Regular: ${regularPartners.length}\n`);
    
    // Get some users for reservations/sales
    const users = await db.select().from(user).limit(20);
    console.log(`👥 Found ${users.length} users for reservations/sales\n`);
    
    // Generate listings
    const listingsToCreate = [];
    const totalListings = 100;
    
    for (let i = 0; i < totalListings; i++) {
      // Distribute between black and regular partners
      const isBlackListing = blackPartners.length > 0 && getRandomBoolean(0.3); // 30% from black partners
      const selectedPartner = isBlackListing
        ? getRandomItem(blackPartners)
        : regularPartners.length > 0 ? getRandomItem(regularPartners) : getRandomItem(partners);
      
      // Some listings might be private (P2P)
      const isPrivateListing = getRandomBoolean(0.1); // 10% private listings
      const listingUserId = isPrivateListing && users.length > 0 ? getRandomItem(users).id : null;
      
      // Random users for reservations/sales
      const reservedByUserId = users.length > 0 ? getRandomItem(users).id : null;
      const soldToUserId = users.length > 0 ? getRandomItem(users).id : null;
      
      const listing = generateComprehensiveListing(
        i,
        selectedPartner.id,
        selectedPartner.tier === 'black',
        listingUserId,
        reservedByUserId,
        soldToUserId
      );
      
      listingsToCreate.push(listing);
      
      // Progress
      if ((i + 1) % 10 === 0) {
        console.log(`   Generated ${i + 1}/${totalListings} listings...`);
      }
    }
    
    console.log(`\n✅ Generated ${listingsToCreate.length} listings\n`);
    
    // Insert in batches
    console.log('💾 Inserting into database...\n');
    const batchSize = 20;
    
    for (let i = 0; i < listingsToCreate.length; i += batchSize) {
      const batch = listingsToCreate.slice(i, i + batchSize);
      await db.insert(carListing).values(batch);
      console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listingsToCreate.length / batchSize)}`);
    }
    
    console.log('\n✅ All listings inserted!\n');
    
    // Generate price history for some listings (20%)
    console.log('💰 Generating price history...\n');
    const priceHistoryEntries = [];
    
    for (const listing of listingsToCreate) {
      if (listing.priceChanges && listing.priceChanges > 0) {
        for (let i = 0; i < listing.priceChanges; i++) {
          const oldPrice = Math.floor(listing.price * (1 + (Math.random() * 0.2 - 0.1)));
          const newPrice = i === listing.priceChanges - 1 ? listing.price : Math.floor(oldPrice * (0.9 + Math.random() * 0.1));
          const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
          
          priceHistoryEntries.push({
            id: `price_history_${createId()}`,
            listingId: listing.id,
            oldPrice,
            newPrice,
            changePercent,
            reason: getRandomItem(priceChangeReasons),
            changedBy: listing.userId || null,
            createdAt: new Date(Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000),
          });
        }
      }
    }
    
    if (priceHistoryEntries.length > 0) {
      await db.insert(listingPriceHistory).values(priceHistoryEntries);
      console.log(`   ✅ Inserted ${priceHistoryEntries.length} price history entries\n`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   Total listings: ${listingsToCreate.length}`);
    console.log(`   - Published: ${listingsToCreate.filter(l => l.status === 'published').length}`);
    console.log(`   - Draft: ${listingsToCreate.filter(l => l.status === 'draft').length}`);
    console.log(`   - Reserved: ${listingsToCreate.filter(l => l.status === 'reserved').length}`);
    console.log(`   - Sold: ${listingsToCreate.filter(l => l.status === 'sold').length}`);
    console.log(`   - Archived: ${listingsToCreate.filter(l => l.status === 'archived').length}`);
    console.log(`   - Pending: ${listingsToCreate.filter(l => l.status === 'pending').length}`);
    console.log(`   - Rejected: ${listingsToCreate.filter(l => l.status === 'rejected').length}`);
    console.log(`\n   Black member listings: ${listingsToCreate.filter(l => l.isBlackMember).length}`);
    console.log(`   Featured listings: ${listingsToCreate.filter(l => l.isFeatured).length}`);
    console.log(`   Private listings: ${listingsToCreate.filter(l => l.sellerType === 'private').length}`);
    console.log(`   Consignment: ${listingsToCreate.filter(l => l.isConsignment).length}`);
    console.log(`\n   Price history entries: ${priceHistoryEntries.length}`);
    console.log('\n🚀 Your database is fully seeded with comprehensive data!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed
seedComprehensiveListings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

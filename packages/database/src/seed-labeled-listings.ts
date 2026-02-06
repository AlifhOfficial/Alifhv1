/**
 * Seed Script for Labeled Car Listings
 * Creates listings using labeled car images from /public/Labeled_Cars/
 */

import 'dotenv/config';
import { db } from './dbclient';
import { carListing } from './schema/listing';
import { partner } from './schema/partner';
import { createId } from '@paralleldrive/cuid2';

const makeListingId = () => `listing_${createId()}`;

// ===== LABELED CAR IMAGES =====
// Format: { thumbnail, make, model, year, trim?, bodyType, isLuxury }
const labeledCars = [
  {
    thumbnail: '/Labeled_Cars/Audi_RS7_2021.jpeg',
    make: 'Audi',
    model: 'RS7',
    year: 2021,
    trim: 'Sportback',
    bodyType: 'sedan' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/Lamborgini_Hurccan_2016.jpeg',
    make: 'Lamborghini',
    model: 'Huracan',
    year: 2016,
    trim: 'LP 610-4',
    bodyType: 'sports' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/Lamborgini_Urus_2020.jpeg',
    make: 'Lamborghini',
    model: 'Urus',
    year: 2020,
    trim: 'S',
    bodyType: 'suv' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/Mercedes_Gwagon_2020.jpeg',
    make: 'Mercedes-Benz',
    model: 'G-Class',
    year: 2020,
    trim: 'G 63 AMG',
    bodyType: 'suv' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/Porsche_gt3rs_limtied_2020.jpeg',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2020,
    trim: 'Limited Edition',
    bodyType: 'sports' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/Range_Rover_Sport_SVA_2018.jpeg',
    make: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2018,
    trim: 'SVAutobiography',
    bodyType: 'suv' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/audi_rs5_2014.jpeg',
    make: 'Audi',
    model: 'RS5',
    year: 2014,
    trim: 'Quattro',
    bodyType: 'coupe' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/lexus_lfa_2014.jpeg',
    make: 'Lexus',
    model: 'LFA',
    year: 2014,
    trim: 'Nürburgring Edition',
    bodyType: 'sports' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/mclearn_spyder_2020.jpeg',
    make: 'McLaren',
    model: '720S Spider',
    year: 2020,
    trim: 'Performance',
    bodyType: 'convertible' as const,
    isLuxury: true,
  },
  {
    thumbnail: '/Labeled_Cars/toyota_landcruiser_2020.jpeg',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2020,
    trim: 'GXR',
    bodyType: 'suv' as const,
    isLuxury: false,
  },
];

// ===== RANDOM IMAGES FOR GALLERY =====
const carImages = [
  '/Black_cars/car1.webp', '/Black_cars/car2.webp', '/Black_cars/car3.webp',
  '/Black_cars/car4.webp', '/Black_cars/car5.webp', '/Black_cars/car6.webp',
  '/Black_cars/car7.webp', '/Black_cars/car8.webp', '/Black_cars/car9.webp',
  '/Black_cars/car10.webp', '/Black_cars/car11.webp', '/Black_cars/car12.webp',
  '/Black_cars/car13.webp', '/Black_cars/car14.webp', '/Black_cars/car15.webp',
  '/Black_cars/car16.webp', '/Black_cars/car17.webp', '/Black_cars/car18.webp',
  '/Black_cars/car19.webp', '/Black_cars/car20.webp',
];

// ===== ENUMS =====
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid'] as const;
const transmissions = ['automatic', 'manual', 'dct'] as const;
const specsList = ['gcc', 'american', 'european', 'japanese'] as const;
const steeringSides = ['left', 'right'] as const;
const exportStatuses = ['local_only', 'gcc', 'international'] as const;
const engineSizes = ['2.5L_3.0L', '3.0L_4.0L', '4.0L_5.0L', '5.0L_6.0L', 'over_6.0L'] as const;
const engineTypes = ['v6', 'v8', 'v10', 'v12', 'inline-4', 'inline-6'] as const;
const powerRanges = ['300_400', '400_500', '500_600', '600_700', '700_plus'] as const;
const doors = ['2', '3', '4', '5'] as const;
const seatingCapacities = ['2', '4', '5', '7'] as const;
const exteriorColors = ['white', 'black', 'silver', 'grey', 'blue', 'red', 'green', 'yellow'] as const;
const interiorColors = ['black', 'beige', 'brown', 'tan', 'red'] as const;
const warrantyTypes = ['manufacturer', 'extended', 'dealer'] as const;
const badges = ['verified', 'top_rated', 'hot_deal', 'new_arrival', 'featured', 'premium', 'low_mileage'];
const tags = ['luxury', 'sports', 'performance', 'rare', 'collector'];

const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah'];
const cities: Record<string, string[]> = {
  'Dubai': ['Dubai Marina', 'Downtown', 'Business Bay', 'JBR', 'Jumeirah'],
  'Abu Dhabi': ['Al Reem Island', 'Yas Island', 'Corniche'],
  'Sharjah': ['Al Majaz', 'Al Khan'],
};

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
    abs: true,
    airbags: randomInt(6, 12),
    parkingSensors: true,
    rearCamera: true,
    blindSpotMonitor: getRandomBoolean(0.8),
    laneAssist: getRandomBoolean(0.7),
    adaptiveCruise: isLuxury,
    collisionWarning: getRandomBoolean(0.8),
    leatherSeats: isLuxury,
    heatedSeats: isLuxury,
    ventilatedSeats: isLuxury,
    sunroof: getRandomBoolean(0.7),
    panoramicRoof: isLuxury ? getRandomBoolean(0.6) : false,
    climateControl: true,
    powerSeats: true,
    memorySeats: isLuxury,
    touchscreen: true,
    screenSize: isLuxury ? getRandomItem(['12.3"', '14.9"', '17.7"']) : '10.25"',
    appleCarPlay: true,
    androidAuto: true,
    bluetooth: true,
    navigation: true,
    soundSystem: isLuxury ? getRandomItem(['Burmester', 'Bang & Olufsen', 'Harman Kardon', 'Mark Levinson', 'Bowers & Wilkins']) : undefined,
    wirelessCharging: getRandomBoolean(0.7),
    sportMode: true,
    paddleShifters: isLuxury,
    allWheelDrive: getRandomBoolean(0.6),
    adjustableSuspension: isLuxury,
    launchControl: isLuxury ? getRandomBoolean(0.5) : false,
  };
}

function generateSpecialNotes(year: number) {
  return {
    serviceHistory: getRandomBoolean(0.5),
    singleOwner: getRandomBoolean(0.3),
    accidentFree: getRandomBoolean(0.5),
    underWarranty: getRandomBoolean(0.4),
    registeredUntil: `${year + randomInt(1, 3)}-${randomInt(1, 12).toString().padStart(2, '0')}`,
    customizations: undefined,
    recentServices: undefined,
  };
}

function generateDescription(make: string, model: string, year: number, exteriorColor: string, interiorColor: string, isLuxury: boolean): string {
  const luxuryPhrases = [
    'Experience unparalleled luxury',
    'Epitome of automotive excellence',
    'Crafted to perfection',
    'Ultimate in sophistication',
  ];
  
  const phrase = isLuxury ? getRandomItem(luxuryPhrases) : 'Well-maintained and ready to drive';
  
  return `${phrase} with this ${year} ${make} ${model}. Finished in stunning ${exteriorColor} with ${interiorColor} interior. Meticulously maintained with full service history. This vehicle combines performance, comfort, and style in one exceptional package.`;
}

// ===== MAIN GENERATION FUNCTION =====
function generateListing(
  carData: typeof labeledCars[0],
  partnerId: string,
) {
  const { thumbnail, make, model, year, trim, bodyType, isLuxury } = carData;
  
  // Specs
  const fuelType = getRandomItem(fuelTypes);
  const transmission = getRandomItem(transmissions);
  const specs = getRandomItem(specsList);
  const steeringSide = getRandomItem(steeringSides);
  const exportStatus = getRandomItem(exportStatuses);
  
  // Engine
  const isElectric = fuelType === 'electric';
  const engineType = isElectric ? 'electric' as const : getRandomItem(engineTypes);
  const cylinders = isElectric ? undefined : randomInt(4, 12);
  const engineSize = isElectric ? 'electric' as const : getRandomItem(engineSizes);
  const powerRange = getRandomItem(powerRanges);
  
  // Physical
  const doorCount = bodyType === 'coupe' || bodyType === 'sports' || bodyType === 'convertible' ? '2' : getRandomItem(['4', '5']);
  const seatingCapacity = doorCount === '2' ? getRandomItem(['2', '4'] as const) : getRandomItem(seatingCapacities);
  const exteriorColor = getRandomItem(exteriorColors);
  const interiorColor = getRandomItem(interiorColors);
  
  // Mileage based on age
  const carAge = 2026 - year;
  const baseMileage = carAge * randomInt(8000, 15000);
  const mileage = Math.max(500, baseMileage + randomInt(-3000, 3000));
  
  // Pricing in AED
  const basePrice = isLuxury ? randomInt(250000, 2000000) : randomInt(80000, 400000);
  const price = basePrice;
  const fairValue = Math.floor(price * (0.95 + Math.random() * 0.1));
  const estimateMin = Math.floor(fairValue * 0.9);
  const estimateMax = Math.floor(fairValue * 1.1);
  const priceTrend = price < fairValue * 0.95 ? 'below_market' : price > fairValue * 1.05 ? 'above_market' : 'at_market';
  
  // AI Pricing
  const aiEstimatedPrice = Math.floor(price * (0.95 + Math.random() * 0.1));
  const aiPriceMin = Math.floor(aiEstimatedPrice * 0.9);
  const aiPriceMax = Math.floor(aiEstimatedPrice * 1.1);
  const aiConfidenceScore = 0.75 + Math.random() * 0.2;
  
  // Location
  const emirate = getRandomItem(emirates);
  const city = getRandomItem(cities[emirate]);
  
  // Media - thumbnail is the labeled image, other images are random
  const randomImages = getRandomImages(randomInt(4, 8));
  const images = [thumbnail, ...randomImages];
  
  // Features
  const technicalFeatures = generateTechnicalFeatures(isLuxury);
  const extras = getRandomSubarray([
    'Premium Sound System', 'Panoramic Sunroof', 'Massage Seats', '360 Camera',
    'Night Vision', 'Air Suspension', 'Heads-Up Display', 'Soft Close Doors',
    'Ambient Lighting', 'Keyless Entry', 'Remote Start', 'Heated Steering Wheel',
  ], 4, 8);
  const specialNotes = generateSpecialNotes(year);
  
  // Quality scores
  const qiScore = randomInt(80, 98) / 100;
  
  // Engagement metrics
  const viewCount = randomInt(100, 2000);
  const favouriteCount = randomInt(20, 150);
  const superlikeCount = randomInt(5, 40);
  
  // Heat score
  const heatScore = randomInt(50, 100);
  
  // Badges and tags - MAX 3 total
  const listingBadges = getRandomSubarray(badges, 1, 2);
  const listingTags = getRandomSubarray(tags, 1, 2);
  
  // Timestamps - ALL NOW
  const now = new Date();
  const createdAt = now;
  const updatedAt = now;
  const publishedAt = now;
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  // SEO
  const slug = generateSlug(make, model, year, trim);
  const metaTitle = `${year} ${make} ${model} ${trim} for Sale in ${emirate} | Revvup`;
  const metaDescription = `Buy this ${year} ${make} ${model} ${trim}. ${mileage.toLocaleString()} km, ${transmission}. Price: AED ${price.toLocaleString()}. Contact dealer today!`;
  
  // Description
  const description = generateDescription(make, model, year, exteriorColor, interiorColor, isLuxury);
  
  return {
    id: makeListingId(),
    vin: generateVIN(),
    
    // Ownership
    partnerId,
    userId: null,
    postedByStaffId: null,
    postedByRole: 'staff',
    moderationStatus: 'approved',
    lifecycleStatus: 'active',
    sellerType: 'dealer',
    isConsignment: false,
    
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
    torque: cylinders ? `${randomInt(350, 900)} Nm` : null,
    fuelEconomy: isElectric ? null : `${randomInt(8, 16)} L/100km`,
    
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
    isNegotiable: getRandomBoolean(0.6),
    
    // AI Pricing
    aiEstimatedPrice,
    aiPriceMin,
    aiPriceMax,
    aiConfidenceScore,
    aiPriceUpdatedAt: new Date(),
    aiModel: 'v1',
    
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
    partnerBrandName: 'Premium Auto Gallery',
    partnerVerified: true,
    
    // Media - NO VIDEO
    thumbnail,
    images,
    videoUrl: null,
    description,
    
    // Features
    technicalFeatures,
    extras,
    specialNotes,
    warrantyType: getRandomItem(warrantyTypes),
    
    exportStatus,
    
    // Badges & Tags - MAX 3
    badges: listingBadges,
    tags: listingTags,
    isBlkListing: getRandomBoolean(0.3),
    
    // Engagement
    viewCount,
    favouriteCount,
    superlikeCount,
    
    // Heat score
    heatScore,
    heatScoreUpdatedAt: new Date(),
    
    // SEO
    slug,
    metaTitle,
    metaDescription,
    
    // Reservation & Sale
    reservedAt: null,
    reservedBy: null,
    soldAt: null,
    soldTo: null,
    soldPrice: null,
    
    // Timestamps
    createdAt,
    updatedAt,
    publishedAt,
    expiresAt,
    extensionCount: 0,
    extensionHistory: [],
    lastEditedAt: updatedAt,
    archivedAt: null,
    
    // Moderation
    submittedAt: createdAt,
    approvedAt: publishedAt,
    lastModeratedAt: publishedAt,
    needsRemoderation: false,
    rejectionReason: null,
    deletedAt: null,
  };
}

// ===== MAIN SEED FUNCTION =====
async function seedLabeledListings() {
  console.log('\n' + '='.repeat(60));
  console.log('🏷️  LABELED CAR LISTINGS SEED SCRIPT');
  console.log('='.repeat(60) + '\n');

  try {
    // Get a partner
    const partners = await db.select().from(partner).limit(1);
    
    if (partners.length === 0) {
      console.error('❌ No partners found! Please run the main seed script first.');
      process.exit(1);
    }
    
    const selectedPartner = partners[0];
    console.log(`✅ Using partner: ${selectedPartner.name}\n`);
    
    // Generate listings for each labeled car
    const listings = labeledCars.map((carData) => 
      generateListing(carData, selectedPartner.id)
    );
    
    console.log(`📝 Generated ${listings.length} listings:\n`);
    listings.forEach((l, i) => {
      console.log(`   ${i + 1}. ${l.year} ${l.make} ${l.model} ${l.trim}`);
      console.log(`      Thumbnail: ${l.thumbnail}`);
      console.log(`      Price: AED ${l.price.toLocaleString()}`);
      console.log('');
    });
    
    // Insert
    console.log('💾 Inserting into database...\n');
    await db.insert(carListing).values(listings);
    
    console.log('='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n   ✅ Inserted ${listings.length} labeled car listings`);
    console.log(`   📸 Images from: /public/Labeled_Cars/`);
    console.log(`   🏷️  Max highlights: 3 badges per listing`);
    console.log(`   🎬 No video URLs`);
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed
seedLabeledListings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

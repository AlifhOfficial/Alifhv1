/**
 * Seed script for car listings
 * Creates 100 sample listing data for showcase with varied data
 */

import 'dotenv/config';
import { db } from '../src/dbclient';
import { carListing } from '../src/schema/listing';
import { partner } from '../src/schema/partner';
import { user } from '../src/schema';
import { createId } from '@paralleldrive/cuid2';

const makeListingId = () => `listing_${createId()}`;

// Data Arrays for Random Generation
const makesAndModels = {
  'Mercedes-Benz': ['S-Class', 'G-Class', 'E-Class', 'GLE', 'GLS', 'AMG GT'],
  'BMW': ['7 Series', 'X7', 'X5', 'M5', 'M4', 'M3', 'XM'],
  'Porsche': ['911', 'Cayenne', 'Panamera', 'Taycan', 'Macan'],
  'Audi': ['RS Q8', 'RS7', 'RS6', 'e-tron GT', 'Q8'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Defender 110', 'Defender 90'],
  'Lamborghini': ['Urus', 'Huracan'],
  'Ferrari': ['F8 Tributo', 'Roma', '296 GTB'],
  'Rolls-Royce': ['Cullinan', 'Ghost', 'Phantom'],
  'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur']
};

const trims = ['S', 'SE', 'HSE', 'Autobiography', 'AMG', 'M Sport', 'Competition', 'Turbo', 'Turbo S', 'GTS', 'Prestige', 'Platinum'];
const bodyTypes = ['sedan', 'suv', 'coupe', 'convertible', 'wagon'];
const fuelTypes = ['petrol', 'hybrid', 'electric', 'diesel'];
const transmissions = ['automatic'];
const colors = ['Obsidian Black', 'Jet Black', 'Metallic Black', 'Midnight Black', 'Onyx Black', 'Santorini Black', 'Beluga Black'];
const interiorColors = ['Black', 'Red', 'Tan', 'White', 'Brown', 'Beige'];
const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'];
const specsList = ['gcc', 'american', 'european', 'japanese'];

const featuresList = [
  'Panoramic Sunroof', 'Adaptive Cruise Control', 'Burmester Sound System', '360 Camera', 'Massage Seats', 
  'Night Vision', 'Air Suspension', 'Heads-Up Display', 'Soft Close Doors', 'Ventilated Seats', 
  'Apple CarPlay', 'Android Auto', 'Lane Keep Assist', 'Blind Spot Monitor', 'Ceramic Brakes', 
  'Carbon Fiber Interior', 'Rear Entertainment', 'Wireless Charging', 'Ambient Lighting', 'Keyless Entry'
];

// Image handling
const totalImages = 60; // We saw up to car60.webp roughly
const getImage = (index: number) => `/Black_cars/car${(index % totalImages) + 1}.webp`;

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubarray<T>(arr: T[], n: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function generateRandomListing(index: number, partnerId: string) {
  const make = getRandomItem(Object.keys(makesAndModels));
  const model = getRandomItem(makesAndModels[make as keyof typeof makesAndModels]);
  const year = Math.floor(Math.random() * (2025 - 2019) + 2019); // 2019-2024
  const trim = getRandomItem(trims);
  
  const title = `${year} ${make} ${model} ${trim}`;
  const slug = `${year}-${make}-${model}-${trim}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Generate 3-5 random images for this car
  const carImages = [];
  const numImages = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numImages; i++) {
    // Pick a random image index, try to keep them somewhat consistent or just random as requested
    const imgIndex = Math.floor(Math.random() * totalImages) + 1;
    carImages.push(`/Black_cars/car${imgIndex}.webp`);
  }

  return {
    id: makeListingId(),
    partnerId,
    title,
    slug: `${slug}-${createId().slice(0, 8)}`,
    description: `Experience luxury with this ${year} ${make} ${model}. Finished in stunning ${getRandomItem(colors)} with ${getRandomItem(interiorColors)} interior. Maintained to the highest standards.`,
    
    make,
    model,
    year,
    trim,
    vin: createId().toUpperCase().slice(0, 17),
    
    price: Math.floor(Math.random() * (1500000 - 150000) + 150000),
    originalPrice: Math.floor(Math.random() * (1600000 - 160000) + 160000),
    
    mileage: Math.floor(Math.random() * 80000),
    condition: 'used' as const,
    bodyType: getRandomItem(bodyTypes),
    fuelType: getRandomItem(fuelTypes),
    transmission: getRandomItem(transmissions),
    engineSize: `${(Math.random() * 4 + 2).toFixed(1)}L`,
    cylinders: getRandomItem([4, 6, 8, 12]),
    horsepower: Math.floor(Math.random() * (800 - 300) + 300),
    doors: getRandomItem([2, 4]),
    seats: getRandomItem([2, 4, 5, 7]),
    
    color: getRandomItem(colors),
    interiorColor: getRandomItem(interiorColors),
    specs: getRandomItem(specsList),
    
    features: getRandomSubarray(featuresList, Math.floor(Math.random() * 8) + 4),
    images: carImages,
    thumbnail: carImages[0],
    
    emirate: getRandomItem(emirates),
    
    status: 'published',
    sellerType: 'dealer',
    
    viewCount: Math.floor(Math.random() * 1000),
    favouriteCount: Math.floor(Math.random() * 100),
    shareCount: Math.floor(Math.random() * 50),
    inquiryCount: Math.floor(Math.random() * 20),
    callCount: Math.floor(Math.random() * 15),
    whatsappCount: Math.floor(Math.random() * 25),
    
    qiScore: Math.floor(Math.random() * 15) + 85,
    performanceScore: Math.floor(Math.random() * 20) + 80,
    daysOnMarket: Math.floor(Math.random() * 60),
    
    isFeatured: false, // Explicitly requested to be false
    
    publishedAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function seedListings() {
  console.log('🌱 Starting to seed 100 listings...\n');

  try {
    // Get first partner (create one if doesn't exist)
    let partners = await db.select().from(partner).limit(1);
    
    if (partners.length === 0) {
      console.log('⚠️  No partners found. Creating a demo partner first...');
      
      const [demoUser] = await db.insert(user).values({
        id: `user_${createId()}`,
        email: 'demo.dealer@alifh.ae',
        emailVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      const [demoPartner] = await db.insert(partner).values({
        id: `partner_${createId()}`,
        userId: demoUser.id,
        businessName: 'Premium Auto Gallery',
        businessType: 'dealer',
        licenseNumber: 'DXB-AUTO-2024-001',
        licenseAuthority: 'DED',
        licenseExpiryDate: new Date('2025-12-31'),
        tradeNameArabic: 'معرض السيارات الفاخرة',
        email: 'contact@premiumautogallery.ae',
        phone: '+971501234567',
        whatsapp: '+971501234567',
        country: 'UAE',
        emirate: 'Dubai',
        city: 'Dubai',
        area: 'Al Quoz',
        street: 'Sheikh Zayed Road',
        buildingName: 'Auto Mall',
        officeNumber: '205',
        poBox: '12345',
        landmark: 'Near Mall of the Emirates',
        location: { lat: 25.1172, lng: 55.1844 },
        ownerName: 'Ahmed Al Maktoum',
        ownerNationality: 'UAE',
        ownerPhone: '+971501234567',
        ownerEmail: 'ahmed@premiumautogallery.ae',
        tier: 'gold',
        rating: 4.8,
        totalReviews: 127,
        responseRate: 95,
        avgResponseTime: 30,
        listingsCount: 0,
        activeListingsCount: 0,
        featuredListingsCount: 0,
        verificationStatus: 'verified',
        isActive: true,
        isPartnerDashboardEnabled: true,
        settings: {
          notifications: { email: true, sms: true, push: true },
          privacy: { showPhone: true, showEmail: true, showAddress: false },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      partners = [demoPartner];
      console.log(`✅ Created demo partner: ${demoPartner.businessName}\n`);
    }

    const partnerId = partners[0].id;
    console.log(`📍 Using partner: ${partners[0].businessName} (${partnerId})\n`);

    // Generate and insert 100 listings
    const listingsToCreate = [];
    for (let i = 0; i < 100; i++) {
      listingsToCreate.push(generateRandomListing(i, partnerId));
    }

    // Insert in batches to avoid query size limits
    const batchSize = 10;
    for (let i = 0; i < listingsToCreate.length; i += batchSize) {
      const batch = listingsToCreate.slice(i, i + batchSize);
      await db.insert(carListing).values(batch);
      console.log(`✅ Inserted batch ${i/batchSize + 1}/${Math.ceil(listingsToCreate.length/batchSize)}`);
    }

    console.log(`\n🎉 Successfully seeded ${listingsToCreate.length} car listings!`);
    console.log(`\n🚀 Ready to showcase!`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seedListings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

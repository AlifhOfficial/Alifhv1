/**
 * Seed script for car listings
 * Creates sample listing data for showcase
 */

import 'dotenv/config';
import { db } from '../src/dbclient';
import { carListing } from '../src/schema/listing';
import { partner } from '../src/schema/partner';
import { user } from '../src/schema';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

const makeListingId = () => `listing_${createId()}`;

// Sample car data
const sampleCars = [
  {
    make: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2023,
    trim: 'S 580 4MATIC',
    price: 450000, // AED 450,000
    mileage: 12500,
    condition: 'used' as const,
    bodyType: 'sedan',
    fuelType: 'petrol',
    transmission: 'automatic',
    engineSize: '3.0L',
    cylinders: 6,
    horsepower: 496,
    doors: 4,
    seats: 5,
    color: 'Obsidian Black',
    interiorColor: 'Nappa Leather Black',
    vin: 'WDD2221831A123456',
    title: '2023 Mercedes-Benz S-Class S 580 4MATIC - Luxury Redefined',
    description: 'Experience ultimate luxury with this pristine 2023 Mercedes-Benz S-Class. Featuring cutting-edge technology, supreme comfort, and elegant design. Perfect condition with full service history.',
    features: ['Panoramic Sunroof', 'Adaptive Cruise Control', 'Burmester Sound System', '360 Camera', 'Massage Seats', 'Night Vision', 'Air Suspension'],
    images: ['/Marketing_Assets/A1.png', '/Marketing_Assets/A2.png', '/Marketing_Assets/A3.png'],
    emirate: 'Dubai',
  },
  {
    make: 'BMW',
    model: 'M4',
    year: 2024,
    trim: 'Competition xDrive',
    price: 385000,
    mileage: 3200,
    condition: 'used' as const,
    bodyType: 'coupe',
    fuelType: 'petrol',
    transmission: 'automatic',
    engineSize: '3.0L',
    cylinders: 6,
    horsepower: 510,
    doors: 2,
    seats: 4,
    color: 'Isle of Man Green',
    interiorColor: 'Merino Black',
    vin: 'WBS83CH05PCJ12345',
    title: '2024 BMW M4 Competition xDrive - Track-Ready Performance',
    description: 'Barely driven 2024 BMW M4 Competition with all the performance upgrades. M Carbon seats, M Driver Package, and more. A true driver car.',
    features: ['M Carbon Seats', 'M Driver Package', 'Carbon Fiber Roof', 'Harman Kardon', 'Heads-Up Display', 'M Sport Exhaust'],
    images: ['/Marketing_Assets/A4.png', '/Marketing_Assets/A5.png', '/Marketing_Assets/A6.png'],
    emirate: 'Dubai',
  },
  {
    make: 'Porsche',
    model: '911',
    year: 2023,
    trim: 'Carrera S',
    price: 625000,
    mileage: 8500,
    condition: 'used' as const,
    bodyType: 'coupe',
    fuelType: 'petrol',
    transmission: 'automatic',
    engineSize: '3.0L',
    cylinders: 6,
    horsepower: 450,
    doors: 2,
    seats: 4,
    color: 'GT Silver Metallic',
    interiorColor: 'Black Leather',
    vin: 'WP0AB2A99PS123456',
    title: '2023 Porsche 911 Carrera S - Icon of Sports Cars',
    description: 'Iconic 911 Carrera S with Sport Chrono Package. Meticulously maintained, garage kept. The perfect balance of daily usability and weekend thrills.',
    features: ['Sport Chrono Package', 'PASM', 'Porsche Communication Management', 'Sport Exhaust', 'LED Headlights', 'Rear Axle Steering'],
    images: ['/Marketing_Assets/A7.png', '/Marketing_Assets/A8.png', '/Marketing_Assets/A9.png'],
    emirate: 'Abu Dhabi',
  },
  {
    make: 'Range Rover',
    model: 'Sport',
    year: 2023,
    trim: 'HSE Dynamic P400',
    price: 485000,
    mileage: 15000,
    condition: 'used' as const,
    bodyType: 'suv',
    fuelType: 'petrol',
    transmission: 'automatic',
    engineSize: '3.0L',
    cylinders: 6,
    horsepower: 400,
    doors: 5,
    seats: 7,
    color: 'Santorini Black',
    interiorColor: 'Ebony Windsor Leather',
    vin: 'SALWA2FE5PA123456',
    title: '2023 Range Rover Sport HSE Dynamic - Luxury SUV Excellence',
    description: 'Versatile luxury SUV with commanding presence. 7-seater configuration, air suspension, and premium Meridian sound system. Perfect family vehicle.',
    features: ['Meridian Sound', 'Air Suspension', 'Panoramic Roof', 'Heated/Cooled Seats', 'Adaptive Cruise', 'Wade Sensing'],
    images: ['/Marketing_Assets/A1.png', '/Marketing_Assets/A4.png', '/Marketing_Assets/A7.png'],
    emirate: 'Dubai',
  },
  {
    make: 'Audi',
    model: 'RS e-tron GT',
    year: 2024,
    trim: 'Performance',
    price: 685000,
    mileage: 1200,
    condition: 'used' as const,
    bodyType: 'sedan',
    fuelType: 'electric',
    transmission: 'automatic',
    engineSize: 'Electric',
    cylinders: 0,
    horsepower: 637,
    doors: 4,
    seats: 4,
    color: 'Kemora Gray',
    interiorColor: 'Black with Red Contrast',
    vin: 'WAUZZZGE3PBN12345',
    title: '2024 Audi RS e-tron GT - Electric Performance Pioneer',
    description: 'Nearly new electric performance sedan. Lightning-fast acceleration, stunning design, and zero emissions. The future of performance.',
    features: ['800V Fast Charging', 'Matrix LED Lights', 'Bang & Olufsen 3D', 'Virtual Cockpit', 'Carbon Interior', 'Air Suspension'],
    images: ['/Marketing_Assets/A2.png', '/Marketing_Assets/A5.png', '/Marketing_Assets/A8.png'],
    emirate: 'Dubai',
  },
  {
    make: 'Lamborghini',
    model: 'Urus',
    year: 2023,
    trim: 'Performante',
    price: 1250000,
    mileage: 6500,
    condition: 'used' as const,
    bodyType: 'suv',
    fuelType: 'petrol',
    transmission: 'automatic',
    engineSize: '4.0L',
    cylinders: 8,
    horsepower: 666,
    doors: 5,
    seats: 5,
    color: 'Arancio Borealis',
    interiorColor: 'Black Alcantara',
    vin: 'ZPBUA1ZL6PLA12345',
    title: '2023 Lamborghini Urus Performante - Super SUV',
    description: 'The most powerful SUV ever made by Lamborghini. Carbon ceramic brakes, titanium exhaust, and aggressive styling. A true statement piece.',
    features: ['Carbon Ceramic Brakes', 'Titanium Exhaust', 'Carbon Fiber Package', 'Alcantara Interior', 'Bang & Olufsen', 'Track Mode'],
    images: ['/Marketing_Assets/A3.png', '/Marketing_Assets/A6.png', '/Marketing_Assets/A9.png'],
    emirate: 'Dubai',
  },
];

async function seedListings() {
  console.log('🌱 Starting to seed listings...\n');

  try {
    // Get first partner (create one if doesn't exist)
    let partners = await db.select().from(partner).limit(1);
    
    if (partners.length === 0) {
      console.log('⚠️  No partners found. Creating a demo partner first...');
      
      // Create a demo user first
      const [demoUser] = await db.insert(user).values({
        id: `user_${createId()}`,
        email: 'demo.dealer@alifh.ae',
        emailVerified: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // Create demo partner
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
          notifications: {
            email: true,
            sms: true,
            push: true,
          },
          privacy: {
            showPhone: true,
            showEmail: true,
            showAddress: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      partners = [demoPartner];
      console.log(`✅ Created demo partner: ${demoPartner.businessName}\n`);
    }

    const partnerId = partners[0].id;
    console.log(`📍 Using partner: ${partners[0].businessName} (${partnerId})\n`);

    // Create listings
    let created = 0;
    for (const car of sampleCars) {
      const slug = `${car.year}-${car.make}-${car.model}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await db.insert(carListing).values({
        id: makeListingId(),
        partnerId,
        title: car.title,
        slug: `${slug}-${createId().slice(0, 8)}`,
        description: car.description,
        
        // Vehicle details
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim,
        vin: car.vin,
        
        // Pricing
        price: car.price,
        originalPrice: car.price,
        
        // Specs
        mileage: car.mileage,
        condition: car.condition,
        bodyType: car.bodyType,
        fuelType: car.fuelType,
        transmission: car.transmission,
        engineSize: car.engineSize,
        cylinders: car.cylinders,
        horsepower: car.horsepower,
        doors: car.doors,
        seats: car.seats,
        
        // Colors
        color: car.color,
        interiorColor: car.interiorColor,
        
        // Features & Media
        features: car.features,
        images: car.images,
        
        // Location
        emirate: car.emirate,
        
        // Status
        status: 'published',
        sellerType: 'dealer',
        
        // Counters (initialized to 0)
        viewCount: Math.floor(Math.random() * 500) + 50,
        favouriteCount: Math.floor(Math.random() * 50) + 5,
        shareCount: Math.floor(Math.random() * 20) + 2,
        inquiryCount: Math.floor(Math.random() * 15) + 1,
        callCount: Math.floor(Math.random() * 10) + 1,
        whatsappCount: Math.floor(Math.random() * 12) + 1,
        
        // Analytics
        qiScore: Math.floor(Math.random() * 15) + 85, // 85-100
        performanceScore: Math.floor(Math.random() * 20) + 80, // 80-100
        daysOnMarket: Math.floor(Math.random() * 30) + 1,
        
        // Premium features
        isFeatured: Math.random() > 0.5,
        
        // Timestamps
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      created++;
      console.log(`✅ Created: ${car.year} ${car.make} ${car.model}`);
    }

    console.log(`\n🎉 Successfully seeded ${created} car listings!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Partner: ${partners[0].businessName}`);
    console.log(`   - Listings: ${created}`);
    console.log(`   - All listings are published and visible`);
    console.log(`\n🚀 Ready to showcase!`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
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

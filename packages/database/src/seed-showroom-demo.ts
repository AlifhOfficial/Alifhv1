/**
 * Seed Demo Showroom Data
 * Creates realistic, presentation-worthy showroom data for the demo partner
 */

import 'dotenv/config';
import { db } from './dbclient';
import { partner, partnerShowroom } from './schema/partner';
import type {
  ShowroomTeamMember,
  ShowroomAchievement,
  ShowroomTestimonial,
  ShowroomService,
  ShowroomPressFeature,
} from './schema/partner';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

const TARGET_PARTNER_ID = 'partner_jjy40ziwn13atjzm9iycp7m9';

// ============================================================================
// Team Members - Realistic UAE-based automotive professionals
// ============================================================================
const teamMembers: ShowroomTeamMember[] = [
  {
    id: createId(),
    name: 'Ahmed Al Maktoum',
    role: 'Founder & CEO',
    image: null,
    bio: 'With over 25 years in the automotive industry, Ahmed founded Revvup Motors with a vision to redefine luxury car buying in the UAE. Previously led sales at major OEM franchises.',
    whatsapp: '+971501234567',
    order: 1,
  },
  {
    id: createId(),
    name: 'Sarah Mitchell',
    role: 'Sales Director',
    image: null,
    bio: 'Former F1 hospitality manager bringing world-class client experience to our showroom. Sarah leads our VIP client relations and ensures every interaction exceeds expectations.',
    whatsapp: '+971502345678',
    order: 2,
  },
  {
    id: createId(),
    name: 'Omar Hassan',
    role: 'Head of Acquisitions',
    image: null,
    bio: 'Expert in sourcing rare and collector vehicles worldwide. Omar has personally acquired over 500 ultra-luxury vehicles for our discerning clientele.',
    whatsapp: '+971503456789',
    order: 3,
  },
  {
    id: createId(),
    name: 'Elena Volkov',
    role: 'Client Experience Manager',
    image: null,
    bio: 'Multilingual luxury specialist fluent in 5 languages. Elena ensures our international clients receive personalized attention from inquiry to delivery.',
    whatsapp: '+971504567890',
    order: 4,
  },
];

// ============================================================================
// Achievements & Milestones
// ============================================================================
const achievements: ShowroomAchievement[] = [
  {
    id: createId(),
    title: 'Best Luxury Dealer UAE 2024',
    issuer: 'Arabian Business Awards',
    year: 2024,
    image: null,
    order: 1,
  },
  {
    id: createId(),
    title: 'Certified Pre-Owned Excellence',
    issuer: 'Emirates Standards Organization',
    year: 2023,
    image: null,
    order: 2,
  },
  {
    id: createId(),
    title: 'Customer Service Gold Standard',
    issuer: 'Dubai Chamber of Commerce',
    year: 2024,
    image: null,
    order: 3,
  },
  {
    id: createId(),
    title: 'Top 10 Auto Dealers MENA',
    issuer: 'Automotive Excellence Awards',
    year: 2024,
    image: null,
    order: 4,
  },
  {
    id: createId(),
    title: 'ISO 9001:2015 Certified',
    issuer: 'International Organization for Standardization',
    year: 2022,
    image: null,
    order: 5,
  },
];

// ============================================================================
// Customer Testimonials
// ============================================================================
const testimonials: ShowroomTestimonial[] = [
  {
    id: createId(),
    customerName: 'Mohammed Al Rashid',
    customerTitle: 'Business Owner, Dubai',
    customerImage: null,
    content: 'Exceptional service from start to finish. The team found me a pristine Porsche 911 GT3 RS that exceeded all expectations. The attention to detail and transparency in the process made this my best car buying experience ever.',
    rating: 5,
    vehiclePurchased: 'Porsche 911 GT3 RS',
    videoUrl: null,
    order: 1,
  },
  {
    id: createId(),
    customerName: 'James Richardson',
    customerTitle: 'CEO, Tech Startup',
    customerImage: null,
    content: 'As an expat, I was worried about navigating the car market here. The team made everything seamless - from selection to financing to registration. Drove away in my dream Bentley Continental GT within a week.',
    rating: 5,
    vehiclePurchased: 'Bentley Continental GT',
    videoUrl: null,
    order: 2,
  },
  {
    id: createId(),
    customerName: 'Fatima Al Qasimi',
    customerTitle: 'Interior Designer',
    customerImage: null,
    content: 'The private viewing experience was unlike anything I have experienced. They brought three vehicles to my home, each meticulously prepared. Found my perfect Mercedes G-Wagon without ever stepping into a showroom.',
    rating: 5,
    vehiclePurchased: 'Mercedes-AMG G63',
    videoUrl: null,
    order: 3,
  },
  {
    id: createId(),
    customerName: 'Alexander Chen',
    customerTitle: 'Investment Fund Manager',
    customerImage: null,
    content: 'Purchased a rare Ferrari 812 Competizione through their acquisition service. They handled everything - international sourcing, import documentation, and registration. True white-glove service for collectors.',
    rating: 5,
    vehiclePurchased: 'Ferrari 812 Competizione',
    videoUrl: null,
    order: 4,
  },
];

// ============================================================================
// Signature Services
// ============================================================================
const services: ShowroomService[] = [
  {
    id: createId(),
    icon: 'car',
    title: 'Private Viewings',
    description: 'Experience our collection in complete privacy. Schedule exclusive after-hours showroom access or request home delivery of vehicles for your personal inspection.',
    order: 1,
  },
  {
    id: createId(),
    icon: 'globe',
    title: 'Global Sourcing',
    description: 'Cannot find your dream car? Our acquisition team sources rare and specific vehicles from trusted partners across Europe, USA, Japan, and beyond.',
    order: 2,
  },
  {
    id: createId(),
    icon: 'shield',
    title: 'Extended Warranty',
    description: 'Comprehensive coverage options up to 5 years. Every vehicle undergoes a 200-point inspection backed by our certified pre-owned guarantee.',
    order: 3,
  },
  {
    id: createId(),
    icon: 'wallet',
    title: 'Bespoke Financing',
    description: 'Tailored financing solutions through our banking partners. Competitive rates, flexible terms, and Sharia-compliant options available.',
    order: 4,
  },
  {
    id: createId(),
    icon: 'refresh',
    title: 'Trade-In Excellence',
    description: 'Receive top market value for your current vehicle. Instant valuations with same-day payment and seamless transition to your new car.',
    order: 5,
  },
  {
    id: createId(),
    icon: 'plane',
    title: 'Export Assistance',
    description: 'Complete export documentation and logistics for GCC and international buyers. We handle customs, shipping, and destination delivery.',
    order: 6,
  },
];

// ============================================================================
// Press Features
// ============================================================================
const pressFeatures: ShowroomPressFeature[] = [
  {
    id: createId(),
    publication: 'Gulf News',
    title: 'The Rise of Digital-First Luxury Car Dealerships',
    url: 'https://gulfnews.com',
    logo: null,
    date: '2024-09',
    order: 1,
  },
  {
    id: createId(),
    publication: 'Arabian Business',
    title: 'Top 50 Auto Dealers Transforming the UAE Market',
    url: 'https://arabianbusiness.com',
    logo: null,
    date: '2024-06',
    order: 2,
  },
  {
    id: createId(),
    publication: 'Esquire Middle East',
    title: 'Where to Find the Rarest Supercars in Dubai',
    url: 'https://esquireme.com',
    logo: null,
    date: '2024-03',
    order: 3,
  },
  {
    id: createId(),
    publication: 'The National',
    title: 'Customer Experience Innovation in Auto Retail',
    url: 'https://thenationalnews.com',
    logo: null,
    date: '2024-01',
    order: 4,
  },
];

// ============================================================================
// VIP Perks
// ============================================================================
const vipPerks: string[] = [
  'Complimentary airport pick-up and vehicle delivery',
  'Dedicated relationship manager for life',
  '24/7 concierge support for all vehicle needs',
  'Priority access to new arrivals and rare acquisitions',
  'Exclusive invitations to automotive events and launches',
  'Complimentary annual vehicle detail and inspection',
  'Access to our private lounge with refreshments',
  'Partner discounts at premium hotels and restaurants',
];

// ============================================================================
// Main Seed Function
// ============================================================================
async function seedShowroomDemo() {
  console.log('\n🚀 Seeding Demo Showroom Data...');
  console.log('Target Partner ID:', TARGET_PARTNER_ID);

  // Check if partner exists
  const [existingPartner] = await db
    .select()
    .from(partner)
    .where(eq(partner.id, TARGET_PARTNER_ID));

  if (!existingPartner) {
    console.error('❌ Partner not found:', TARGET_PARTNER_ID);
    process.exit(1);
  }

  console.log('✅ Found partner:', existingPartner.brandName);

  // Check if showroom exists
  const [existingShowroom] = await db
    .select()
    .from(partnerShowroom)
    .where(eq(partnerShowroom.partnerId, TARGET_PARTNER_ID));

  const showroomData = {
    partnerId: TARGET_PARTNER_ID,

    // Hero Section
    heroVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual showroom video
    heroVideoFile: null,
    heroVideoThumbnail: null,
    heroImage: null,
    heroTagline: 'Where Automotive Dreams Become Reality',
    heroBackgroundType: 'image' as const,
    heroCtaText: 'Schedule a Private Viewing',
    heroCtaLink: null,
    heroCtaSecondaryText: 'Explore Our Collection',
    heroCtaSecondaryLink: null,

    // Brand Story
    brandStoryTitle: 'Our Legacy',
    brandStoryContent: `For over two decades, we have been curating the finest automobiles for the most discerning collectors and enthusiasts in the UAE. What began as a passion for exceptional vehicles has evolved into the region's most trusted destination for luxury and exotic cars.

Our philosophy is simple: every client deserves an experience as exceptional as the vehicles we offer. From the moment you express interest to years after your purchase, we remain committed to exceeding expectations at every touchpoint.

We don't just sell cars – we fulfill automotive dreams. Whether you're seeking a daily driver that makes a statement, a weekend supercar for the open road, or a rare collector's piece for your private collection, our team of specialists will guide you to the perfect match.`,
    brandStoryVideoUrl: null,
    brandStoryVideoFile: null,
    brandPhilosophy: 'Excellence is not a destination, but a continuous journey we share with every client.',

    // Founder
    founderName: 'Ahmed Al Maktoum',
    founderTitle: 'Founder & CEO',
    founderImage: null,
    founderQuote: 'We built this company on the belief that buying a luxury car should be as extraordinary as driving one. Every detail matters, every moment counts, and every client is family.',

    // Gallery
    showroomImages: [],
    showroomVideoTourUrl: null,
    showroomVideoTourFile: null,
    ambientStyle: 'luxury' as const,

    // Signature Collection
    signatureVehicleIds: [],
    collectionTitle: 'The Black Collection',
    collectionDescription: 'Hand-selected vehicles representing the pinnacle of automotive engineering and design. Each car in our collection has been personally inspected and certified to meet our exacting standards.',

    // Team
    teamMembers: teamMembers,
    teamSectionTitle: 'Meet Our Specialists',

    // Achievements
    achievements: achievements,
    totalCarsSold: 2847,
    yearsInBusiness: 22,
    clientLogos: [],
    achievementsSectionTitle: 'Recognition & Excellence',

    // Testimonials
    featuredTestimonials: testimonials,
    testimonialsSectionTitle: 'Client Stories',

    // Services
    signatureServices: services,
    vipPerks: vipPerks,
    servicesSectionTitle: 'The Revvup Experience',

    // Contact
    showroomAddress: 'Ground Floor, Gate Village Building 3, DIFC, Dubai, UAE',
    showroomMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.178509456778!2d55.27752831544397!3d25.21748198388653!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f428e13f85f0d%3A0x6b14f4b3df5d9e0e!2sDIFC!5e0!3m2!1sen!2sae!4v1640000000000!5m2!1sen!2sae',
    showroomExteriorImages: [],
    parkingInfo: 'Complimentary valet parking available. Self-parking in DIFC parking structure with validation.',
    appointmentCtaText: 'Book Your Private Viewing',

    // Social
    instagramHandle: 'revvupae',
    instagramFeedEnabled: true,
    youtubeChannelUrl: 'https://youtube.com/@revvupae',
    tiktokHandle: 'revvupae',
    linkedinUrl: 'https://linkedin.com/company/revvupae',
    pressFeatures: pressFeatures,

    // Theming
    primaryColor: '#1a1a1a',
    accentColor: '#c9a227',
    fontFamily: null,
    customCss: null,

    // SEO
    seoTitle: 'Revvup Motors | Premier Luxury & Exotic Car Showroom Dubai',
    seoDescription: 'Dubai\'s most trusted destination for luxury, exotic, and collector vehicles. Experience white-glove service, global sourcing, and the finest selection of pre-owned supercars, hypercars, and premium automobiles.',
    seoImage: null,
    slug: existingPartner.slug,

    // Status
    isPublished: true,
    publishedAt: new Date(),
    lastEditedAt: new Date(),
    lastEditedBy: null,

    // Analytics (initialized)
    viewCount: 1247,
    uniqueVisitors: 892,
    avgTimeOnPage: 245,
    lastViewedAt: new Date(),
  };

  if (existingShowroom) {
    // Update existing showroom
    console.log('📝 Updating existing showroom...');
    await db
      .update(partnerShowroom)
      .set({
        ...showroomData,
        updatedAt: new Date(),
      })
      .where(eq(partnerShowroom.id, existingShowroom.id));
    console.log('✅ Showroom updated:', existingShowroom.id);
  } else {
    // Create new showroom
    console.log('✨ Creating new showroom...');
    const newId = `showroom_${createId()}`;
    await db.insert(partnerShowroom).values({
      id: newId,
      ...showroomData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Showroom created:', newId);
  }

  console.log('\n🎉 Demo showroom seeded successfully!');
  console.log(`\nView at: https://revvup.ae/showroom/${existingPartner.slug}`);

  process.exit(0);
}

// Run
seedShowroomDemo().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});

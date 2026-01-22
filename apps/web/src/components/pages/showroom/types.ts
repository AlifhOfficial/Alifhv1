/**
 * Showroom Types
 * 
 * Public-facing types for showroom display components
 * Must stay in sync with:
 * - packages/database/.../showroom-queries.ts (PartnerShowroomPublic)
 * - apps/web/src/hooks/partner/car-dealer/use-partner-showroom.ts (PartnerShowroom)
 */

import type {
  ShowroomTeamMember,
  ShowroomAchievement,
  ShowroomTestimonial,
  ShowroomService,
  ShowroomPressFeature,
} from '@alifh/database';

// ============================================================================
// Ambient Style Types
// ============================================================================

export type AmbientStyle = 'luxury' | 'modern' | 'classic' | 'industrial' | 'minimal';

export interface AmbientTheme {
  // Typography
  headingClass: string;      // Main headings (h1, h2)
  subheadingClass: string;   // Secondary headings
  bodyClass: string;         // Body text
  labelClass: string;        // Small labels, uppercase text
  // Spacing
  sectionSpacing: string;    // Space between sections
}

/**
 * Ambient Style Themes - Typography focused
 * Each style has distinct typographic character
 */
export const AMBIENT_THEMES: Record<AmbientStyle, AmbientTheme> = {
  luxury: {
    headingClass: 'font-serif tracking-tight',
    subheadingClass: 'font-serif tracking-normal',
    bodyClass: 'font-sans leading-relaxed',
    labelClass: 'uppercase tracking-[0.2em] font-light',
    sectionSpacing: 'pt-32 pb-24',
  },
  modern: {
    headingClass: 'font-sans font-semibold tracking-tight',
    subheadingClass: 'font-sans font-medium',
    bodyClass: 'font-sans leading-relaxed',
    labelClass: 'uppercase tracking-widest font-medium',
    sectionSpacing: 'pt-28 pb-20',
  },
  classic: {
    headingClass: 'font-serif font-normal tracking-normal',
    subheadingClass: 'font-serif font-normal italic',
    bodyClass: 'font-serif leading-loose',
    labelClass: 'uppercase tracking-wider font-normal',
    sectionSpacing: 'pt-24 pb-20',
  },
  industrial: {
    headingClass: 'font-mono font-bold uppercase tracking-wide',
    subheadingClass: 'font-mono font-semibold uppercase',
    bodyClass: 'font-sans leading-relaxed',
    labelClass: 'uppercase tracking-[0.15em] font-bold',
    sectionSpacing: 'pt-20 pb-16',
  },
  minimal: {
    headingClass: 'font-sans font-light tracking-tight',
    subheadingClass: 'font-sans font-light',
    bodyClass: 'font-sans font-light leading-loose',
    labelClass: 'uppercase tracking-[0.3em] font-extralight',
    sectionSpacing: 'pt-36 pb-28',
  },
};

/**
 * Get theme for a given ambient style
 */
export function getAmbientTheme(style: AmbientStyle | null | undefined): AmbientTheme {
  return AMBIENT_THEMES[style || 'modern'];
}

// ============================================================================
// Partner Data (joined from partner profile)
// ============================================================================

export interface PartnerData {
  id: string;
  brandName: string;
  logo: string | null;
  heroImage: string | null;
  isVerified: boolean;
  tier: string;
  googleRating: number | null;
  googleReviewCount: number;
  city: string | null;
  emirate: string | null;
  phone: string;
  website: string | null;
  locationLat: number | null;
  locationLng: number | null;
}

// ============================================================================
// Showroom Data (public display)
// ============================================================================

export interface ShowroomData {
  // Core
  id: string;
  partnerId: string;
  slug: string | null;
  
  // Ambient Style
  ambientStyle: AmbientStyle | null;
  
  // Hero Section
  heroImage: string | null;
  heroVideoUrl: string | null;
  heroVideoFile: string | null;
  heroVideoThumbnail: string | null;
  heroTagline: string | null;
  heroBackgroundType: 'video' | 'image' | 'gradient';
  heroCtaText: string;
  heroCtaLink: string | null;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string | null;
  
  // Brand Story
  brandStoryTitle: string;
  brandStoryContent: string | null;
  brandStoryVideoUrl: string | null;
  brandStoryVideoFile: string | null;
  brandPhilosophy: string | null;
  
  // Founder
  founderName: string | null;
  founderTitle: string | null;
  founderImage: string | null;
  founderQuote: string | null;
  
  // Gallery
  showroomImages: string[];
  showroomVideoTourUrl: string | null;
  showroomVideoTourFile: string | null;
  
  // Signature Collection
  signatureVehicleIds: string[];
  collectionTitle: string;
  collectionDescription: string | null;
  
  // Team
  teamMembers: ShowroomTeamMember[];
  teamSectionTitle: string;
  
  // Achievements & Stats
  achievements: ShowroomAchievement[];
  achievementsSectionTitle: string;
  totalCarsSold: number | null;
  yearsInBusiness: number | null;
  clientLogos: string[];
  
  // Testimonials
  featuredTestimonials: ShowroomTestimonial[];
  testimonialsSectionTitle: string;
  
  // Services
  signatureServices: ShowroomService[];
  vipPerks: string[];
  servicesSectionTitle: string;
  
  // Contact & Location (from partner profile, not editable here)
  showroomAddress: string | null;
  showroomMapEmbedUrl: string | null;
  showroomExteriorImages: string[];
  parkingInfo: string | null;
  appointmentCtaText: string;
  
  // Social Media
  instagramHandle: string | null;
  instagramFeedEnabled: boolean;
  youtubeChannelUrl: string | null;
  tiktokHandle: string | null;
  linkedinUrl: string | null;
  pressFeatures: ShowroomPressFeature[];
  
  // Theming
  primaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  
  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  
  // Status
  publishedAt: Date | null;
  updatedAt: Date;
  
  // Partner (joined)
  partner: PartnerData;
}

// Re-export for convenience
export type { ShowroomTeamMember, ShowroomAchievement, ShowroomTestimonial, ShowroomService, ShowroomPressFeature };

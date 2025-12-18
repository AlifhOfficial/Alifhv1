/**
 * Listing Detail Hook
 * 
 * Fetches complete listing details for a single car with caching.
 * Includes vehicle specs, pricing, features, and partner information.
 * 
 * @param id - The listing ID to fetch
 * @returns Query result with listing data, loading state, and error
 */

import { useQuery } from '@tanstack/react-query';

// Complete car listing with all details from API
export interface ListingDetail {
  // Primary identification
  id: string;
  vin: string | null;
  
  // Basic Vehicle Information
  make: string;
  model: string;
  year: number;
  trim: string | null;
  
  // Vehicle Specifications
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  specs: string;
  steeringSide: string;
  
  // Engine & Performance
  engineSize: string | null;
  engineType: string | null;
  cylinders: number | null;
  power: string | null;
  torque: string | null;
  fuelEconomy: string | null;
  
  // Physical Details
  doors: number;
  seatingCapacity: number;
  exteriorColor: string | null;
  interiorColor: string | null;
  
  // Condition & Mileage
  mileage: number;
  
  // Pricing
  price: number; // In AED cents
  currency: string;
  isNegotiable: boolean;
  
  // AI Valuation & Market Intelligence
  fairValue: number | null; // In AED cents
  estimateMin: number | null;
  estimateMax: number | null;
  priceTrend: string | null; // "below_market", "at_market", "above_market"
  qiScore: number | null;
  
  // Location
  emirate: string;
  city: string | null;
  
  // Media & Content
  thumbnail: string | null;
  images: string[];
  videoUrl: string | null;
  description: string | null;
  
  // Features & Extras
  technicalFeatures: {
    // Safety
    abs?: boolean;
    airbags?: number;
    parkingSensors?: boolean;
    rearCamera?: boolean;
    blindSpotMonitor?: boolean;
    laneAssist?: boolean;
    adaptiveCruise?: boolean;
    collisionWarning?: boolean;
    
    // Comfort
    leatherSeats?: boolean;
    heatedSeats?: boolean;
    ventilatedSeats?: boolean;
    sunroof?: boolean;
    panoramicRoof?: boolean;
    climateControl?: boolean;
    powerSeats?: boolean;
    memorySeats?: boolean;
    
    // Technology
    touchscreen?: boolean;
    screenSize?: string;
    appleCarPlay?: boolean;
    androidAuto?: boolean;
    bluetooth?: boolean;
    navigation?: boolean;
    soundSystem?: string;
    wirelessCharging?: boolean;
    
    // Performance
    sportMode?: boolean;
    paddleShifters?: boolean;
    allWheelDrive?: boolean;
    adjustableSuspension?: boolean;
    launchControl?: boolean;
  };
  extras: string[];
  specialNotes: {
    serviceHistory?: boolean;
    singleOwner?: boolean;
    accidentFree?: boolean;
    underWarranty?: boolean;
    registeredUntil?: string;
    customizations?: string[];
    recentServices?: string[];
    knownIssues?: string[];
  };
  
  // Warranty & Documentation
  warranty: string | null;
  
  // Status & Publication
  status: string;
  exportStatus: string;
  sellerType: string;
  isConsignment: boolean;
  
  // Badges & Tags
  badges: string[];
  tags: string[];
  isFeatured: boolean;
  isBlackMember: boolean;
  
  // Engagement Metrics
  viewCount: number;
  favouriteCount: number;
  superlikeCount: number;
  shareCount: number;
  
  // Lead Generation Metrics
  inquiryCount: number;
  bookingCount: number;
  callCount: number;
  whatsappCount: number;
  
  // Conversion Tracking
  leadQuality: number | null;
  conversionRate: number | null;
  avgTimeToSale: number | null;
  
  // SEO & Discovery
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  
  // Reservation & Sale
  reservedAt: string | null;
  soldAt: string | null;
  soldPrice: number | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
  
  // Moderation & Quality Control
  reviewedAt: string | null;
  rejectionReason: string | null;
  
  // Partner info
  partnerId: string | null;
  partnerName: string | null;
  partnerCompanyName: string | null;
  partnerVerified: boolean | null;
  partnerLogo: string | null;
  partnerPhone: string | null;
  partnerWebsite: string | null;
  partnerEmirate: string | null;
  partnerCity: string | null;
  partnerRating: number | null;
  partnerReviewCount: number | null;
  partnerActiveListings: number | null;
}

interface ListingDetailResponse {
  data: ListingDetail;
}

async function fetchListingDetail(id: string): Promise<ListingDetail> {
  const response = await fetch(`/api/listings/${id}`);
  
  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Listing not found' : 'Failed to fetch listing details');
  }
  
  const json: ListingDetailResponse = await response.json();
  return json.data;
}

export function useListingDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => {
      if (!id) throw new Error('Listing ID is required');
      return fetchListingDetail(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Format price from cents to AED
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Format mileage with thousands separator
export function formatMileage(km: number): string {
  return new Intl.NumberFormat('en-AE').format(km);
}

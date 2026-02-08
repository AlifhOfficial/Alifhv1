/**
 * Shared types for listing detail components
 */

export interface TechnicalFeatures {
  abs?: boolean;
  airbags?: number;
  parkingSensors?: boolean;
  rearCamera?: boolean;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruise?: boolean;
  collisionWarning?: boolean;
  leatherSeats?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  sunroof?: boolean;
  panoramicRoof?: boolean;
  climateControl?: boolean;
  powerSeats?: boolean;
  memorySeats?: boolean;
  touchscreen?: boolean;
  screenSize?: string;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  bluetooth?: boolean;
  navigation?: boolean;
  soundSystem?: string;
  wirelessCharging?: boolean;
  sportMode?: boolean;
  paddleShifters?: boolean;
  allWheelDrive?: boolean;
  adjustableSuspension?: boolean;
  launchControl?: boolean;
}

export interface SpecialNotes {
  ownerRemarks?: string[];
  serviceHistory?: boolean;
  singleOwner?: boolean;
  accidentFree?: boolean;
  underWarranty?: boolean;
  registeredUntil?: string;
  customizations?: string[];
  recentServices?: string[];
  knownIssues?: string[];
}

export interface ListingData {
  id: string;
  vin: string | null;
  slug: string | null;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  condition: 'new' | 'used';
  description: string | null;
  price: number;
  currency: string;
  isNegotiable: boolean;
  viewCount: number;
  favouriteCount: number;
  superlikeCount: number;
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  specs: string;
  steeringSide: string;
  engineSize: string | null;
  engineType: string | null;
  cylinders: number | null;
  powerRange: string | null;
  torque: string | null;
  fuelEconomy: string | null;
  doors: string | null;
  seatingCapacity: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  mileage: number;
  emirate: string;
  city: string | null;
  thumbnail: string | null;
  images: string[];
  videoUrl: string | null;
  technicalFeatures: TechnicalFeatures;
  extras: string[];
  specialNotes: SpecialNotes;
  badges: string[];
  tags: string[];
  partnerId: string | null;
  partnerBrandName: string | null;
  partnerVerified: boolean;
  isBlkListing: boolean;
}

export interface SellerData {
  type: 'partner' | 'user';
  partnerId?: string;
  partner?: {
    brandName: string | null;
    logo: string | null;
    isVerified: boolean;
    tier: string | null;
  } | null;
  userId?: string;
  userProfile?: {
    displayName: string | null;
    avatarUrl: string | null;
    isKycVerified: boolean;
  } | null;
}

// Format utilities
export const priceFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const mileageFormatter = new Intl.NumberFormat('en-US');

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function formatMileage(km: number): string {
  return mileageFormatter.format(km);
}

export function formatEnumValue(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const EMIRATE_MAP: Record<string, string> = {
  'dubai': 'Dubai',
  'abu_dhabi': 'Abu Dhabi',
  'sharjah': 'Sharjah',
  'ajman': 'Ajman',
  'ras_al_khaimah': 'Ras Al Khaimah',
  'fujairah': 'Fujairah',
  'umm_al_quwain': 'Umm Al Quwain',
};

export function formatEmirate(emirate: string): string {
  return EMIRATE_MAP[emirate.toLowerCase()] || emirate;
}

const SPECS_MAP: Record<string, string> = {
  'gcc': 'GCC',
  'us': 'US',
  'european': 'European',
  'japanese': 'Japanese',
  'canadian': 'Canadian',
  'american': 'American',
};

export function formatSpecs(specs: string): string {
  return SPECS_MAP[specs.toLowerCase()] || specs;
}

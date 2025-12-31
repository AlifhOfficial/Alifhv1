/**
 * Listing Form Types and Validation
 * 
 * Streamlined 3-step listing form with VIN-first approach.
 * Based on schema: packages/database/src/schema/listing.ts
 * 
 * Flow:
 * 1. VIN → Auto-decode → Basic Info (make, model, year, trim)
 * 2. Details → Specs, Colors, Features
 * 3. Publish → Price, Location, Photos, Description
 * 
 * @module components/listings/listing-form/types
 */

import { z } from 'zod';

// ============================================================================
// CONSTANTS
// ============================================================================

const currentYear = new Date().getFullYear();

/** VIN validation pattern (17 chars, no I, O, Q) */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

// ============================================================================
// IMAGE TYPES
// ============================================================================

export interface ListingImage {
  key: string;
  order: number;
  width?: number;
  height?: number;
  size?: number;
  blurhash?: string;
}

// ============================================================================
// FORM STEP CONFIG
// ============================================================================

export type FormStep = 'vin' | 'details' | 'publish';

export interface FormStepConfig {
  id: FormStep;
  number: number;
  label: string;
  description: string;
}

export const FORM_STEPS: FormStepConfig[] = [
  { id: 'vin', number: 1, label: 'Vehicle', description: 'Enter VIN to auto-fill details' },
  { id: 'details', number: 2, label: 'Details', description: 'Specs, colors & features' },
  { id: 'publish', number: 3, label: 'Publish', description: 'Price, photos & location' },
];

// ============================================================================
// STEP 1: VIN & BASIC INFO
// ============================================================================

export const vinStepSchema = z.object({
  vin: z.string()
    .length(17, 'VIN must be exactly 17 characters')
    .regex(VIN_PATTERN, 'Invalid VIN (cannot contain I, O, or Q)')
    .transform(v => v.toUpperCase()),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number()
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`),
  trim: z.string().optional().nullable(),
});

// ============================================================================
// STEP 2: DETAILS (Specs, Colors, Features)
// ============================================================================

export const detailsStepSchema = z.object({
  // Required
  mileage: z.number()
    .int('Mileage must be a whole number')
    .min(0, 'Mileage cannot be negative')
    .max(999999, 'Mileage seems too high'),
  specs: z.enum(['gcc', 'american', 'european', 'japanese', 'chinese', 'korean', 'canadian', 'other']),
  steeringSide: z.enum(['left', 'right']),
  
  // Body & Appearance
  bodyType: z.enum(['sedan', 'suv', 'coupe', 'convertible', 'hatchback', 'wagon', 'pickup', 'van', 'sports', 'luxury', 'other']).optional().nullable(),
  exteriorColor: z.enum(['white', 'black', 'silver', 'grey', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple', 'other']).optional().nullable(),
  interiorColor: z.enum(['black', 'beige', 'brown', 'tan', 'grey', 'white', 'red', 'burgundy', 'other']).optional().nullable(),
  doors: z.enum(['2', '3', '4', '5', '6']).optional().nullable(),
  seatingCapacity: z.enum(['2', '4', '5', '6', '7', '8', '9_plus']).optional().nullable(),
  
  // Engine & Performance
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen']).optional().nullable(),
  transmission: z.enum(['automatic', 'manual', 'cvt', 'dct', 'semi_automatic']).optional().nullable(),
  engineSize: z.enum(['under_1.5L', '1.5L_2.0L', '2.0L_2.5L', '2.5L_3.0L', '3.0L_4.0L', '4.0L_5.0L', '5.0L_6.0L', 'over_6.0L', 'electric']).optional().nullable(),
  engineType: z.enum(['inline-3', 'inline-4', 'inline-6', 'v6', 'v8', 'v10', 'v12', 'w12', 'electric', 'hybrid', 'other']).optional().nullable(),
  cylinders: z.number().int().min(0).max(16).optional().nullable(),
  powerRange: z.enum(['under_100', '100_200', '200_300', '300_400', '400_500', '500_600', '600_700', '700_plus', 'unknown']).optional().nullable(),
  torque: z.string().optional().nullable(),
  fuelEconomy: z.string().optional().nullable(),
  
  // Status
  warrantyType: z.enum(['none', 'manufacturer', 'extended', 'dealer', 'other']).optional().nullable(),
  exportStatus: z.enum(['local_only', 'gcc', 'international', 'restricted']).optional().nullable(),
  
  // Extras & Tags
  extras: z.array(z.string()).default([]),
  tags: z.array(z.string()).max(3, 'Maximum 3 tags allowed').default([]),
  
  // Technical Features
  technicalFeatures: z.object({
    // Safety
    abs: z.boolean().optional(),
    airbags: z.number().optional(),
    parkingSensors: z.boolean().optional(),
    rearCamera: z.boolean().optional(),
    blindSpotMonitor: z.boolean().optional(),
    laneAssist: z.boolean().optional(),
    adaptiveCruise: z.boolean().optional(),
    collisionWarning: z.boolean().optional(),
    // Comfort
    leatherSeats: z.boolean().optional(),
    heatedSeats: z.boolean().optional(),
    ventilatedSeats: z.boolean().optional(),
    sunroof: z.boolean().optional(),
    panoramicRoof: z.boolean().optional(),
    climateControl: z.boolean().optional(),
    powerSeats: z.boolean().optional(),
    memorySeats: z.boolean().optional(),
    // Technology
    touchscreen: z.boolean().optional(),
    screenSize: z.string().optional(),
    appleCarPlay: z.boolean().optional(),
    androidAuto: z.boolean().optional(),
    bluetooth: z.boolean().optional(),
    navigation: z.boolean().optional(),
    soundSystem: z.string().optional(),
    wirelessCharging: z.boolean().optional(),
    // Performance
    sportMode: z.boolean().optional(),
    paddleShifters: z.boolean().optional(),
    allWheelDrive: z.boolean().optional(),
    adjustableSuspension: z.boolean().optional(),
    launchControl: z.boolean().optional(),
  }).default({}),
});

// ============================================================================
// STEP 3: PUBLISH (Price, Location, Photos, Description)
// ============================================================================

export const publishStepSchema = z.object({
  price: z.number()
    .int('Price must be a whole number')
    .min(1000, 'Minimum price is 1,000 AED')
    .max(100000000, 'Price seems too high'),
  currency: z.string().default('AED'),
  isNegotiable: z.boolean().default(true),
  
  // Location
  emirate: z.string().min(1, 'Emirate is required'),
  city: z.string().optional().nullable(),
  
  // Media
  images: z.array(z.object({
    key: z.string(),
    order: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number().optional(),
    blurhash: z.string().optional(),
  })).min(1, 'At least one photo is required').max(20, 'Maximum 20 photos'),
  videoUrl: z.string().url().optional().nullable().or(z.literal('')),
  
  // Content
  description: z.string().max(5000, 'Description too long').optional().nullable(),
  
  // Owner Notes (MAX 10 bullet points)
  ownerRemarks: z.array(
    z.string().max(200, 'Each note must be under 200 characters')
  ).max(10, 'Maximum 10 notes allowed').default([]),
});

// ============================================================================
// COMPLETE FORM SCHEMA
// ============================================================================

export const listingFormSchema = z.object({
  ...vinStepSchema.shape,
  ...detailsStepSchema.shape,
  ...publishStepSchema.shape,
  
  // Optional: Partner/Staff fields
  partnerId: z.string().optional().nullable(),
  postedByStaffId: z.string().optional().nullable(),
});

// ============================================================================
// TYPES
// ============================================================================

export type VinStepData = z.infer<typeof vinStepSchema>;
export type DetailsStepData = z.infer<typeof detailsStepSchema>;
export type PublishStepData = z.infer<typeof publishStepSchema>;
export type ListingFormData = z.infer<typeof listingFormSchema>;

// ============================================================================
// FORM PROPS
// ============================================================================

export interface ListingFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ListingFormData> & { id?: string };
  onSubmit: (data: ListingFormData) => Promise<void>;
  onSaveDraft?: (data: Partial<ListingFormData>) => Promise<void>;
  onCancel?: () => void;
  isStaff?: boolean;
  partnerId?: string;
}

// ============================================================================
// VIN CHECK RESPONSE TYPE
// ============================================================================

export interface VINCheckResponse {
  available: boolean;
  message: string;
  existingListing?: {
    id: string;
    make: string;
    model: string;
    year: number;
    status: string;
  };
  decoded?: {
    vin: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    bodyType?: string;
    doors?: string;
    engineSize?: string;
    engineType?: string;
    cylinders?: number;
    fuelType?: string;
    transmission?: string;
    driveType?: string;
    horsepower?: number;
  };
  decodeError?: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate a specific step
 */
export function validateStep(
  step: FormStep,
  data: Partial<ListingFormData>
): { success: boolean; errors?: z.ZodError } {
  try {
    switch (step) {
      case 'vin':
        vinStepSchema.parse(data);
        break;
      case 'details':
        detailsStepSchema.parse(data);
        break;
      case 'publish':
        publishStepSchema.parse(data);
        break;
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Check if step is complete (all required fields filled)
 */
export function isStepComplete(step: FormStep, data: Partial<ListingFormData>): boolean {
  const result = validateStep(step, data);
  return result.success;
}

/**
 * Get default form values
 */
export function getDefaultFormValues(): Partial<ListingFormData> {
  return {
    currency: 'AED',
    isNegotiable: true,
    specs: 'gcc',
    steeringSide: 'left',
    exportStatus: 'local_only',
    extras: [],
    tags: [],
    technicalFeatures: {},
    images: [],
    ownerRemarks: [],
  };
}

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
import {
  SPECS_TYPE_VALUES,
  STEERING_SIDE_VALUES,
  BODY_TYPE_VALUES,
  EXTERIOR_COLOR_VALUES,
  INTERIOR_COLOR_VALUES,
  DOORS_VALUES,
  SEATING_CAPACITY_VALUES,
  FUEL_TYPE_VALUES,
  TRANSMISSION_TYPE_VALUES,
  ENGINE_SIZE_VALUES,
  ENGINE_TYPE_VALUES,
  POWER_RANGE_VALUES,
  WARRANTY_TYPE_VALUES,
  EXPORT_STATUS_VALUES,
} from '@alifh/database/listing-constants';

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
  condition: z.enum(['new', 'used']).default('used'),
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
  specs: z.enum(SPECS_TYPE_VALUES),
  steeringSide: z.enum(STEERING_SIDE_VALUES),
  
  // Body & Appearance
  bodyType: z.enum(BODY_TYPE_VALUES).optional().nullable(),
  exteriorColor: z.enum(EXTERIOR_COLOR_VALUES).optional().nullable(),
  interiorColor: z.enum(INTERIOR_COLOR_VALUES).optional().nullable(),
  doors: z.enum(DOORS_VALUES).optional().nullable(),
  seatingCapacity: z.enum(SEATING_CAPACITY_VALUES).optional().nullable(),
  
  // Engine & Performance
  fuelType: z.enum(FUEL_TYPE_VALUES).optional().nullable(),
  transmission: z.enum(TRANSMISSION_TYPE_VALUES).optional().nullable(),
  engineSize: z.enum(ENGINE_SIZE_VALUES).optional().nullable(),
  engineType: z.enum(ENGINE_TYPE_VALUES).optional().nullable(),
  cylinders: z.number().int().min(0).max(16).optional().nullable(),
  powerRange: z.enum(POWER_RANGE_VALUES).optional().nullable(),
  torque: z.string().optional().nullable(),
  fuelEconomy: z.string().optional().nullable(),
  
  // Status
  warrantyType: z.enum(WARRANTY_TYPE_VALUES).optional().nullable(),
  exportStatus: z.enum(EXPORT_STATUS_VALUES).optional().nullable(),
  
  // Extras & Tags
  extras: z.array(z.string()).default([]),
  tags: z.array(z.string()).max(3, 'Maximum 3 tags allowed').default([]),
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
    condition: 'used',
    specs: 'gcc',
    steeringSide: 'left',
    exportStatus: 'local_only',
    extras: [],
    tags: [],
    images: [],
    ownerRemarks: [],
  };
}

/**
 * Create Listing — Shared Types & Form State
 *
 * Central type definitions for the 3-step create listing flow.
 * All steps read/write from a single CreateListingFormData object.
 *
 * @module components/user-inventory-management/create/types
 */

import type { ListingFormPayload } from '@/lib/sell-car-user-api';

// ─── Form State ──────────────────────────────────────────────────────────────

/** Full form data across all 3 steps */
export interface CreateListingFormData {
  // Step 1 — Vehicle Identity
  vin: string;
  vinVerified: boolean; // true once VIN passes uniqueness check
  showVin: boolean;     // true = show VIN publicly, false = "VIN Verified" badge only
  make: string;
  model: string;
  year: string; // kept as string for TextInput binding
  trim: string;
  condition: 'new' | 'used';

  // Step 2 — Specifications
  mileage: string;
  specs: string;
  steeringSide: string;
  bodyType: string;
  exteriorColor: string;
  interiorColor: string;
  doors: string;
  seatingCapacity: string;
  fuelType: string;
  transmission: string;
  engineSize: string;
  engineType: string;
  cylinders: string;
  powerRange: string;
  fuelEconomy: string;
  torque: string;
  warrantyType: string;
  exportStatus: string;
  extras: string[];
  tags: string[];

  // Step 3 — Price, Photos & Publish
  price: string;
  isNegotiable: boolean;
  emirate: string;
  city: string;
  images: string[];      // CDN URLs after upload
  localImages: string[]; // local URIs pending upload
  description: string;
  specialNotes: string[];
}

/** Default empty form state */
export const EMPTY_FORM: CreateListingFormData = {
  vin: '',
  vinVerified: false,
  showVin: true, // Default to public for trust
  make: '',
  model: '',
  year: '',
  trim: '',
  condition: 'used',

  mileage: '',
  specs: 'gcc',
  steeringSide: 'left',
  bodyType: '',
  exteriorColor: '',
  interiorColor: '',
  doors: '',
  seatingCapacity: '',
  fuelType: '',
  transmission: '',
  engineSize: '',
  engineType: '',
  cylinders: '',
  powerRange: '',
  fuelEconomy: '',
  torque: '',
  warrantyType: '',
  exportStatus: 'local_only',
  extras: [],
  tags: [],

  price: '',
  isNegotiable: false,
  emirate: '',
  city: '',
  images: [],
  localImages: [],
  description: '',
  specialNotes: [],
};

// ─── Step Props ──────────────────────────────────────────────────────────────

export interface StepProps {
  form: CreateListingFormData;
  updateForm: (updates: Partial<CreateListingFormData>) => void;
  colors: Record<string, string>;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationErrors {
  [key: string]: string | undefined;
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Validate Step 1 fields */
export function validateStep1(form: CreateListingFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  // VIN — required, exactly 17 valid characters, must be verified unique
  if (!form.vin) {
    errors.vin = 'VIN is required';
  } else if (form.vin.length !== 17) {
    errors.vin = 'VIN must be exactly 17 characters';
  } else if (!VIN_PATTERN.test(form.vin)) {
    errors.vin = 'Invalid VIN (cannot contain I, O, or Q)';
  } else if (!form.vinVerified) {
    errors.vin = 'VIN must be verified before continuing';
  }
  if (!form.make) errors.make = 'Make is required';
  if (!form.model) errors.model = 'Model is required';
  if (!form.year) errors.year = 'Year is required';
  const y = parseInt(form.year, 10);
  if (form.year && (isNaN(y) || y < 1970 || y > new Date().getFullYear() + 1)) {
    errors.year = 'Enter a valid year';
  }
  return errors;
}

/** Validate Step 2 fields */
export function validateStep2(form: CreateListingFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.mileage) errors.mileage = 'Mileage is required';
  const m = parseInt(form.mileage, 10);
  if (form.mileage && (isNaN(m) || m < 0)) errors.mileage = 'Enter valid mileage';
  if (!form.specs) errors.specs = 'Regional specs is required';
  return errors;
}

/** Validate Step 3 fields */
export function validateStep3(form: CreateListingFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.price) errors.price = 'Price is required';
  const p = parseInt(form.price, 10);
  if (form.price && (isNaN(p) || p <= 0)) errors.price = 'Enter a valid price';
  if (!form.emirate) errors.emirate = 'Emirate is required';
  if (form.images.length === 0) errors.images = 'At least 1 photo is required';
  return errors;
}

/** Check if a step has no validation errors */
export function isStepValid(step: 1 | 2 | 3, form: CreateListingFormData): boolean {
  const validate = step === 1 ? validateStep1 : step === 2 ? validateStep2 : validateStep3;
  return Object.keys(validate(form)).length === 0;
}

// ─── Transform to API Payload ────────────────────────────────────────────────

/** 
 * Convert form data → API payload for createListing() 
 * 
 * Condition is auto-detected based on mileage:
 * - < 5,000 km = "new" (brand new / nearly new)
 * - >= 5,000 km = "used"
 */
export function formToPayload(
  form: CreateListingFormData,
  status: 'draft' | 'published' = 'published',
): ListingFormPayload {
  const mileage = parseInt(form.mileage, 10) || 0;
  const condition: 'new' | 'used' = mileage < 5000 ? 'new' : 'used';

  return {
    vin: form.vin,
    vinVisibility: form.showVin ? 'public' : 'private',
    make: form.make,
    model: form.model,
    year: parseInt(form.year, 10),
    trim: form.trim || undefined,
    condition,

    mileage,
    specs: form.specs,
    steeringSide: form.steeringSide,
    bodyType: form.bodyType || undefined,
    exteriorColor: form.exteriorColor || undefined,
    interiorColor: form.interiorColor || undefined,
    doors: form.doors || undefined,
    seatingCapacity: form.seatingCapacity || undefined,
    fuelType: form.fuelType || undefined,
    transmission: form.transmission || undefined,
    engineSize: form.engineSize || undefined,
    engineType: form.engineType || undefined,
    cylinders: form.cylinders ? parseInt(form.cylinders, 10) : undefined,
    powerRange: form.powerRange || undefined,
    fuelEconomy: form.fuelEconomy || undefined,
    torque: form.torque || undefined,
    warrantyType: form.warrantyType || undefined,
    exportStatus: form.exportStatus || undefined,
    extras: form.extras.length > 0 ? form.extras : undefined,
    tags: form.tags.length > 0 ? form.tags : undefined,

    price: parseInt(form.price, 10),
    currency: 'AED',
    isNegotiable: form.isNegotiable,
    emirate: form.emirate,
    city: form.city || undefined,
    images: form.images.length > 0 ? form.images : undefined,
    thumbnail: form.images[0] || undefined,
    description: form.description || undefined,
    specialNotes: form.specialNotes.length > 0
      ? { ownerRemarks: form.specialNotes }
      : undefined,

    status,
  };
}

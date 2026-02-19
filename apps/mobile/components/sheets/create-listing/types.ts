/**
 * Sheet-Based Create Listing — Types & State
 *
 * Micro-step wizard with ~12 focused sheets.
 * Each sheet does ONE thing — Tinder-style cognitive ease.
 *
 * @module components/sheets/create-listing/types
 */

import type { ListingFormPayload } from '@/lib/sell-car-user-api';

// ─── Form State ──────────────────────────────────────────────────────────────

/** Complete form data (same fields as form-based approach) */
export interface CreateListingData {
  // Vehicle Identity
  vin: string;
  vinVerified: boolean;
  make: string;
  model: string;
  year: string;
  trim: string;

  // Specs
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

  // Price & Media
  price: string;
  isNegotiable: boolean;
  emirate: string;
  city: string;
  images: string[];
  localImages: string[];
  description: string;
  specialNotes: string[];
}

/** Default empty state */
export const EMPTY_DATA: CreateListingData = {
  vin: '',
  vinVerified: false,
  make: '',
  model: '',
  year: '',
  trim: '',

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

// ─── Sheet Steps ─────────────────────────────────────────────────────────────

/**
 * Sheet flow order — each step is a micro-action.
 * Required steps have no skip. Optional steps can be skipped.
 */
export const SHEET_STEPS = [
  // Vehicle Identity (required)
  { id: 'vin', label: 'VIN', required: true, group: 'identity' },
  { id: 'make', label: 'Make', required: true, group: 'identity' },
  { id: 'model', label: 'Model', required: true, group: 'identity' },
  { id: 'year', label: 'Year', required: true, group: 'identity' },
  { id: 'trim', label: 'Trim', required: false, group: 'identity' },

  // Core Specs (mileage required, rest optional)
  { id: 'mileage', label: 'Mileage', required: true, group: 'specs' },
  { id: 'specs-region', label: 'Specs', required: false, group: 'specs' },
  { id: 'appearance', label: 'Appearance', required: false, group: 'specs' },
  { id: 'powertrain', label: 'Powertrain', required: false, group: 'specs' },
  { id: 'extras', label: 'Extras', required: false, group: 'specs' },

  // Price & Media (price + emirate + photos required)
  { id: 'price', label: 'Price', required: true, group: 'listing' },
  { id: 'location', label: 'Location', required: true, group: 'listing' },
  { id: 'photos', label: 'Photos', required: true, group: 'listing' },
  { id: 'description', label: 'Description', required: false, group: 'listing' },

  // Final
  { id: 'review', label: 'Review', required: true, group: 'final' },
] as const;

export type SheetStepId = (typeof SHEET_STEPS)[number]['id'];

// ─── Sheet Props ─────────────────────────────────────────────────────────────

export interface SheetStepProps {
  visible: boolean;
  data: CreateListingData;
  onUpdate: (updates: Partial<CreateListingData>) => void;
  onNext: () => void;
  onSkip?: () => void;
  onBack: () => void;
  onClose: () => void;
}

// ─── Progress helpers ────────────────────────────────────────────────────────

export function getProgress(currentStep: number): number {
  return Math.round((currentStep / SHEET_STEPS.length) * 100);
}

export function canSkip(stepId: SheetStepId): boolean {
  const step = SHEET_STEPS.find((s) => s.id === stepId);
  return step ? !step.required : false;
}

// ─── Validation helpers ──────────────────────────────────────────────────────

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export function validateVin(vin: string): string | null {
  if (!vin) return 'VIN is required';
  if (vin.length !== 17) return 'VIN must be exactly 17 characters';
  if (!VIN_PATTERN.test(vin)) return 'Invalid VIN (cannot contain I, O, or Q)';
  return null;
}

export function validateStep(stepId: SheetStepId, data: CreateListingData): string | null {
  switch (stepId) {
    case 'vin':
      if (!data.vinVerified) return 'VIN must be verified';
      return validateVin(data.vin);
    case 'make':
      return data.make ? null : 'Select a make';
    case 'model':
      return data.model ? null : 'Select a model';
    case 'year':
      if (!data.year) return 'Select a year';
      const y = parseInt(data.year, 10);
      if (isNaN(y) || y < 1970 || y > new Date().getFullYear() + 1) {
        return 'Invalid year';
      }
      return null;
    case 'mileage':
      if (!data.mileage) return 'Enter mileage';
      const m = parseInt(data.mileage, 10);
      if (isNaN(m) || m < 0) return 'Invalid mileage';
      return null;
    case 'price':
      if (!data.price) return 'Enter a price';
      const p = parseInt(data.price, 10);
      if (isNaN(p) || p <= 0) return 'Invalid price';
      return null;
    case 'location':
      return data.emirate ? null : 'Select an emirate';
    default:
      return null; // Optional steps always valid
  }
}

export function isStepComplete(stepId: SheetStepId, data: CreateListingData): boolean {
  return validateStep(stepId, data) === null;
}

// ─── Transform to API Payload ────────────────────────────────────────────────

export function dataToPayload(
  data: CreateListingData,
  status: 'draft' | 'published' = 'published',
): ListingFormPayload {
  const mileage = parseInt(data.mileage, 10) || 0;
  const condition: 'new' | 'used' = mileage < 5000 ? 'new' : 'used';

  return {
    vin: data.vin,
    make: data.make,
    model: data.model,
    year: parseInt(data.year, 10),
    trim: data.trim || undefined,
    condition,

    mileage,
    specs: data.specs,
    steeringSide: data.steeringSide,
    bodyType: data.bodyType || undefined,
    exteriorColor: data.exteriorColor || undefined,
    interiorColor: data.interiorColor || undefined,
    doors: data.doors || undefined,
    seatingCapacity: data.seatingCapacity || undefined,
    fuelType: data.fuelType || undefined,
    transmission: data.transmission || undefined,
    engineSize: data.engineSize || undefined,
    engineType: data.engineType || undefined,
    cylinders: data.cylinders ? parseInt(data.cylinders, 10) : undefined,
    powerRange: data.powerRange || undefined,
    fuelEconomy: data.fuelEconomy || undefined,
    torque: data.torque || undefined,
    warrantyType: data.warrantyType || undefined,
    exportStatus: data.exportStatus || undefined,
    extras: data.extras.length > 0 ? data.extras : undefined,
    tags: data.tags.length > 0 ? data.tags : undefined,

    price: parseInt(data.price, 10),
    currency: 'AED',
    isNegotiable: data.isNegotiable,
    emirate: data.emirate,
    city: data.city || undefined,
    images: data.images.length > 0 ? data.images : undefined,
    thumbnail: data.images[0] || undefined,
    description: data.description || undefined,
    specialNotes:
      data.specialNotes.length > 0 ? { ownerRemarks: data.specialNotes } : undefined,

    status,
  };
}

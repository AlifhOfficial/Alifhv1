/**
 * Create Listing Flow
 *
 * 3-step wizard: Vehicle ID → Specifications → Price & Photos
 *
 *   create/
 *   ├── index.ts                    ← barrel export
 *   ├── types.ts                    ← shared types, validation, form → payload
 *   ├── create-listing-screen.tsx   ← orchestrator (form state + step nav)
 *   ├── step-vehicle-id.tsx         ← Step 1: VIN, Make, Model, Year, Trim
 *   ├── step-details.tsx            ← Step 2: Specs, features, extras, tags
 *   └── step-media.tsx              ← Step 3: Price, photos, description
 */

export { default as CreateListingScreen } from './create-listing-screen';
export { StepVehicleId } from './step-vehicle-id';
export { StepDetails } from './step-details';
export { StepMedia } from './step-media';
export {
  EMPTY_FORM,
  isStepValid,
  validateStep1,
  validateStep2,
  validateStep3,
  formToPayload,
  type CreateListingFormData,
  type StepProps,
  type ValidationErrors,
} from './types';

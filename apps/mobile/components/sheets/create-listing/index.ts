/**
 * Sheet-Based Create Listing — Main Export
 *
 * Micro-step wizard for creating listings.
 * Each sheet handles one atomic action.
 *
 * Usage:
 * ```tsx
 * import { CreateListingFlow } from '@/components/sheets/create-listing';
 *
 * function MyScreen() {
 *   const [showFlow, setShowFlow] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onPress={() => setShowFlow(true)}>List Your Car</Button>
 *       <CreateListingFlow
 *         visible={showFlow}
 *         onClose={() => setShowFlow(false)}
 *         onSuccess={(id) => console.log('Listed:', id)}
 *       />
 *     </>
 *   );
 * }
 * ```
 *
 * @module components/sheets/create-listing
 */

// Main orchestrator
export { CreateListingFlow, default } from './create-listing-flow';

// Types & utilities
export {
  EMPTY_DATA,
  SHEET_STEPS,
  validateStep,
  validateVin,
  isStepComplete,
  getProgress,
  canSkip,
  dataToPayload,
  type CreateListingData,
  type SheetStepId,
  type SheetStepProps,
} from './types';

// Base sheet (for custom sheets)
export {
  BaseSheet,
  CreateFlowSheet,
  FlowScrollContent,
  FlowListContent,
  CreateFlowScrollContent,
  CreateFlowListContent,
} from './base-sheet';

// Response sheet (for errors, success, warnings)
export { ResponseSheet, type ResponseType, type ResponseSheetProps } from './response-sheet';

// Individual sheets (for advanced usage)
export {
  VinSheet,
  MakeSheet,
  ModelSheet,
  YearSheet,
  TrimSheet,
  MileageSheet,
  SpecsRegionSheet,
  AppearanceSheet,
  PowertrainSheet,
  ExtrasSheet,
  PriceSheet,
  LocationSheet,
  PhotosSheet,
  DescriptionSheet,
  ReviewSheet,
} from './sheets';

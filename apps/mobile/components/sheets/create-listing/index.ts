/**
 * Step-Based Create Listing — Main Export
 *
 * Single-modal wizard with swappable step content.
 * No sheet switching = no glitches.
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

// Response sheet (for errors, success, warnings)
export { ResponseSheet, type ResponseType, type ResponseSheetProps } from './response-sheet';

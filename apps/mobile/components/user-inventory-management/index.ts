/**
 * User Inventory Management — Barrel Export
 *
 * Folder structure:
 *   user-inventory-management/
 *   ├── index.ts                    ← You are here
 *   ├── create/                     ← 3-step create listing flow
 *   │   ├── index.ts
 *   │   ├── types.ts
 *   │   ├── create-listing-screen.tsx
 *   │   ├── step-vehicle-id.tsx
 *   │   ├── step-details.tsx
 *   │   └── step-media.tsx
 *   ├── sub-operations/             ← Operational bottom-sheets
 *   │   ├── index.ts
 *   │   ├── mark-sold-sheet.tsx
 *   │   ├── extend-listing-sheet.tsx
 *   │   ├── archive-listing-sheet.tsx
 *   │   ├── delete-listing-sheet.tsx
 *   │   └── edit-status-sheet.tsx
 *   └── utilities/                  ← Shared helpers
 *       ├── index.ts
 *       ├── image-upload.ts
 *       └── listing-helpers.ts
 *
 * @module components/user-inventory-management
 */

// Inventory screen
export { InventoryScreen } from './inventory-screen';

// Create listing flow
export {
  CreateListingScreen,
  type CreateListingFormData,
  type StepProps,
} from './create';

// Sub-operations (sheets)
export {
  MarkSoldSheet,
  ExtendListingSheet,
  ArchiveListingSheet,
  DeleteListingSheet,
  EditStatusSheet,
} from './sub-operations';

// Utilities
export {
  pickAndUploadListingImage,
  deleteListingImageByUrl,
  formatListingStatus,
  getStatusColor,
  formatExpiryCountdown,
} from './utilities';

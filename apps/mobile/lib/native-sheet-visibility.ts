import { Platform } from 'react-native';

const NATIVE_SHEET_LEAF_ROUTES = new Set([
  'sort',
  'search',
  'menu',
  'filter-make',
  'filter-model',
  'filter-price',
  'filter-year-mileage',
  'filter-location',
  'more-filters',
  'active-filters',
  'auth-prompt',
  'sign-in-sheet',
  'sign-up-sheet',
  'verify-email-sheet',
  'forgot-password-sheet',
  'create-listing-sheet',
  'listing-description',
  'listing-specs',
  'listing-features',
  'car-info',
  'superlike-confirmation',
  'superlike-exhausted',
  'financing',
  'phone-actions',
  'seller-description',
  'booking',
  'booking-details',
  'cancel-booking',
  'sign-out',
  'share-location',
  'actions',
  'mark-sold',
  'extend',
  'archive',
  'delete',
  'stats',
  'review-reason',
  'delete-account',
  'verify-identity',
]);

export function shouldHideForNativeSheet(routeSegments: string[]): boolean {
  if (Platform.OS !== 'android') return false;
  const leafRoute = routeSegments[routeSegments.length - 1] ?? '';
  return NATIVE_SHEET_LEAF_ROUTES.has(leafRoute);
}

export const nativeSheetVisibility = {
  hideOverlays: shouldHideForNativeSheet,
};


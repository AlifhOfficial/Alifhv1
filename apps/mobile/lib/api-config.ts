/**
 * API Configuration
 * 
 * Centralized API configuration for mobile app
 */

// Development: Use local dev server or ngrok tunnel
// Production: Use production API URL
const DEV_API_URL = 'http://192.168.1.14:3000';

// For device testing, use your local IP or ngrok tunnel
// const DEV_API_URL = 'http://192.168.x.x:3000';
// const DEV_API_URL = 'https://your-ngrok-url.ngrok.io';

const PROD_API_URL = 'https://alifh.ae';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Listings
  listingsCarCard: '/api/listings/car-card',
  listingDetail: (id: string) => `/api/listings/${id}/detailed`,
  
  // Search
  search: '/api/listings/search',
} as const;

/**
 * Build full API URL
 */
export function apiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

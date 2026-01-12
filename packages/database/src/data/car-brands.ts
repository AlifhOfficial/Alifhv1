/**
 * Auto.ae Brand and Model Data
 * Scraped from https://auto.ae/en/catalog/
 * Generated on: 2026-01-12
 */

export interface CarModel {
  name: string;
  slug: string;
  count: number;
}

export interface CarBrand {
  name: string;
  slug: string;
  totalListings: number;
  models: CarModel[];
}

// Import the full brand data
import brandsFullData from './auto-ae-brands-full.json';
import brandsSimplifiedData from './auto-ae-brands-simplified.json';

export const carBrandsData = brandsFullData as Record<string, CarBrand>;
export const carBrandsSimplified = brandsSimplifiedData as Record<string, (string | number)[]>;

// Helper to get all brand names
export function getAllBrandNames(): string[] {
  return Object.keys(carBrandsData);
}

// Helper to get models for a specific brand
export function getModelsForBrand(brandName: string): CarModel[] {
  return carBrandsData[brandName]?.models ?? [];
}

// Helper to get model names for a brand (useful for dropdowns)
export function getModelNamesForBrand(brandName: string): string[] {
  return getModelsForBrand(brandName).map(m => m.name);
}

// Helper to find a brand by slug
export function findBrandBySlug(slug: string): CarBrand | undefined {
  return Object.values(carBrandsData).find(b => b.slug === slug);
}

// Helper to get all brands sorted by listing count
export function getBrandsSortedByListings(): CarBrand[] {
  return Object.values(carBrandsData).sort((a, b) => b.totalListings - a.totalListings);
}

// Export the simplified format for quick access
export const BRANDS_WITH_MODELS = carBrandsSimplified;

// List of all brand names for validation
export const ALL_BRAND_NAMES = getAllBrandNames();

// Popular brands (top 20 by listings)
export const POPULAR_BRANDS = getBrandsSortedByListings()
  .slice(0, 20)
  .map(b => b.name);

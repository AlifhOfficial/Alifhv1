/**
 * Fuel Calculator Configuration
 * 
 * UAE-specific data and efficiency factors
 */

import type { DrivingStyle, DrivingEnvironment, ACUsage, TrafficLevel, FuelTypeId } from './types'

// ============================================================================
// EFFICIENCY FACTORS
// ============================================================================

export const DRIVING_STYLE_FACTORS: Record<DrivingStyle, number> = {
  eco: 0.90,        // 10% better
  normal: 1.00,     // baseline
  aggressive: 1.25, // 25% worse
}

export const ENVIRONMENT_FACTORS: Record<DrivingEnvironment, number> = {
  highway: 0.95,    // 5% better at steady speed
  mixed: 1.10,      // 10% worse
  city: 1.30,       // 30% worse (stop-start)
}

export const AC_FACTORS: Record<ACUsage, number> = {
  rarely: 1.00,     // baseline
  sometimes: 1.05,  // 5% more
  mostly: 1.12,     // 12% more
  always: 1.20,     // 20% more (UAE summer)
}

export const TRAFFIC_FACTORS: Record<TrafficLevel, number> = {
  low: 1.00,        // baseline
  moderate: 1.10,   // 10% more
  heavy: 1.25,      // 25% more
}

// Idle consumption: ~0.8L/hour with AC
export const IDLE_CONSUMPTION_PER_HOUR = 0.8

// CO2 emissions per liter
export const CO2_PER_LITER: Record<FuelTypeId, number> = {
  super98: 2.31,
  special95: 2.31,
  e_plus91: 2.31,
  diesel: 2.68,
}

// ============================================================================
// POPULAR UAE VEHICLES WITH EFFICIENCY DATA
// ============================================================================

export interface VehicleEfficiency {
  make: string
  model: string
  efficiency: number  // L/100km combined
  fuelType: FuelTypeId
  tankSize: number
}

export const POPULAR_VEHICLES: VehicleEfficiency[] = [
  // Economy
  { make: 'Toyota', model: 'Yaris', efficiency: 5.8, fuelType: 'special95', tankSize: 42 },
  { make: 'Nissan', model: 'Sunny', efficiency: 6.5, fuelType: 'e_plus91', tankSize: 41 },
  { make: 'Honda', model: 'City', efficiency: 6.2, fuelType: 'special95', tankSize: 40 },
  { make: 'Hyundai', model: 'Accent', efficiency: 6.3, fuelType: 'special95', tankSize: 43 },
  { make: 'Kia', model: 'Picanto', efficiency: 5.0, fuelType: 'special95', tankSize: 35 },
  
  // Sedan
  { make: 'Toyota', model: 'Camry', efficiency: 7.8, fuelType: 'special95', tankSize: 60 },
  { make: 'Toyota', model: 'Corolla', efficiency: 6.8, fuelType: 'special95', tankSize: 50 },
  { make: 'Honda', model: 'Accord', efficiency: 8.0, fuelType: 'special95', tankSize: 56 },
  { make: 'Honda', model: 'Civic', efficiency: 7.0, fuelType: 'special95', tankSize: 47 },
  { make: 'Nissan', model: 'Altima', efficiency: 7.5, fuelType: 'special95', tankSize: 61 },
  { make: 'Hyundai', model: 'Sonata', efficiency: 7.6, fuelType: 'special95', tankSize: 60 },
  
  // SUV
  { make: 'Toyota', model: 'Land Cruiser', efficiency: 14.5, fuelType: 'super98', tankSize: 110 },
  { make: 'Toyota', model: 'Land Cruiser Prado', efficiency: 11.5, fuelType: 'super98', tankSize: 87 },
  { make: 'Toyota', model: 'Fortuner', efficiency: 10.5, fuelType: 'diesel', tankSize: 80 },
  { make: 'Toyota', model: 'RAV4', efficiency: 8.5, fuelType: 'special95', tankSize: 55 },
  { make: 'Nissan', model: 'Patrol', efficiency: 15.2, fuelType: 'super98', tankSize: 140 },
  { make: 'Nissan', model: 'X-Trail', efficiency: 8.8, fuelType: 'special95', tankSize: 55 },
  { make: 'Lexus', model: 'LX', efficiency: 14.0, fuelType: 'super98', tankSize: 93 },
  { make: 'Land Rover', model: 'Range Rover', efficiency: 12.5, fuelType: 'super98', tankSize: 90 },
  { make: 'Jeep', model: 'Wrangler', efficiency: 12.8, fuelType: 'super98', tankSize: 70 },
  { make: 'Hyundai', model: 'Tucson', efficiency: 8.2, fuelType: 'special95', tankSize: 54 },
  { make: 'Kia', model: 'Sportage', efficiency: 8.3, fuelType: 'special95', tankSize: 54 },
  
  // Luxury
  { make: 'Mercedes-Benz', model: 'E-Class', efficiency: 9.2, fuelType: 'super98', tankSize: 66 },
  { make: 'Mercedes-Benz', model: 'S-Class', efficiency: 11.0, fuelType: 'super98', tankSize: 76 },
  { make: 'BMW', model: '5-Series', efficiency: 9.0, fuelType: 'super98', tankSize: 68 },
  { make: 'BMW', model: '7-Series', efficiency: 10.5, fuelType: 'super98', tankSize: 82 },
  { make: 'BMW', model: 'X5', efficiency: 11.0, fuelType: 'super98', tankSize: 80 },
  { make: 'Audi', model: 'A6', efficiency: 8.8, fuelType: 'super98', tankSize: 63 },
  { make: 'Lexus', model: 'ES', efficiency: 8.5, fuelType: 'special95', tankSize: 60 },
  { make: 'Porsche', model: 'Cayenne', efficiency: 11.5, fuelType: 'super98', tankSize: 90 },
  
  // Sports
  { make: 'Ford', model: 'Mustang', efficiency: 12.0, fuelType: 'super98', tankSize: 61 },
  { make: 'Chevrolet', model: 'Camaro', efficiency: 12.5, fuelType: 'super98', tankSize: 72 },
  
  // Pickup
  { make: 'Toyota', model: 'Hilux', efficiency: 9.5, fuelType: 'diesel', tankSize: 80 },
  { make: 'Ford', model: 'Ranger', efficiency: 10.0, fuelType: 'diesel', tankSize: 80 },
  { make: 'Ford', model: 'F-150', efficiency: 13.5, fuelType: 'super98', tankSize: 98 },
]

// ============================================================================
// POPULAR UAE ROUTES
// ============================================================================

export const UAE_ROUTES = [
  { name: 'Dubai → Abu Dhabi', distance: 140 },
  { name: 'Dubai → Al Ain', distance: 160 },
  { name: 'Dubai → Sharjah', distance: 25 },
  { name: 'Dubai → Fujairah', distance: 130 },
  { name: 'Dubai → RAK', distance: 110 },
  { name: 'Dubai → Hatta', distance: 115 },
  { name: 'Abu Dhabi → Al Ain', distance: 160 },
]

// ============================================================================
// TIME PERIOD HELPERS
// ============================================================================

export const TIME_PERIODS = [
  { value: 'daily', label: 'Daily', days: 1 },
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'yearly', label: 'Yearly', days: 365 },
  { value: 'custom', label: 'Custom', days: 0 },
] as const

export function getDaysForPeriod(period: string, customDays?: number): number {
  if (period === 'custom') return customDays || 30
  const found = TIME_PERIODS.find(p => p.value === period)
  return found?.days || 30
}

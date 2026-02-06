/**
 * Fuel Calculator Types
 */

export type FuelTypeId = 'super98' | 'special95' | 'e_plus91' | 'diesel'

export type DrivingStyle = 'eco' | 'normal' | 'aggressive'
export type DrivingEnvironment = 'city' | 'highway' | 'mixed'
export type ACUsage = 'always' | 'mostly' | 'sometimes' | 'rarely'
export type TrafficLevel = 'low' | 'moderate' | 'heavy'
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
export type CalculationMode = 'estimate' | 'trip'

export interface FuelFormData {
  // Step 1: Vehicle
  make: string
  model: string
  year: string
  fuelType: FuelTypeId
  
  // Step 2: Efficiency & Distance
  efficiency: string // L/100km
  distance: string   // km
  timePeriod: TimePeriod
  customDays: string
  
  // Step 3: Driving Habits (Advanced)
  drivingStyle: DrivingStyle
  environment: DrivingEnvironment
  acUsage: ACUsage
  trafficLevel: TrafficLevel
  idleMinutes: string
  
  // Trip Mode
  tripDistance: string
  tripType: 'one_way' | 'round_trip'
  
  // Comparison
  currentSpending: string
}

export interface FuelResult {
  // Core
  fuelConsumed: number    // liters
  totalCost: number       // AED
  
  // Breakdown
  costPerDay: number
  costPerWeek: number
  costPerMonth: number
  costPerYear: number
  costPerKm: number
  
  // Practical
  tankFills: number
  rangePerTank: number    // km
  
  // Environmental
  co2Emissions: number    // kg
  
  // Adjusted
  adjustedEfficiency: number
  
  // Comparison
  comparison?: {
    difference: number
    percentDiff: number
    isOverspending: boolean
  }
}

export interface TripResult {
  distance: number
  fuelNeeded: number
  cost: number
  costPerPerson?: number
}

export interface AISuggestion {
  id: string
  title: string
  description: string
  potentialSaving: number
  category: string
  difficulty: string
}

export interface AIAnalysis {
  suggestions: AISuggestion[]
  summary: string
  efficiencyScore?: number
  potentialMonthlySaving: number
  funFact?: string
}

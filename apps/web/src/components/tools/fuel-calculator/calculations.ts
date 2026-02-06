/**
 * Fuel Calculator Calculations
 */

import { UAE_FUEL_PRICES } from '@/data/uae-automotive-config'
import type { FuelFormData, FuelResult, TripResult } from './types'
import {
  DRIVING_STYLE_FACTORS,
  ENVIRONMENT_FACTORS,
  AC_FACTORS,
  TRAFFIC_FACTORS,
  IDLE_CONSUMPTION_PER_HOUR,
  CO2_PER_LITER,
  getDaysForPeriod,
} from './config'

// ============================================================================
// MAIN CALCULATION
// ============================================================================

export function calculateFuelCost(data: FuelFormData): FuelResult | null {
  const efficiency = parseFloat(data.efficiency)
  const distance = parseFloat(data.distance)
  
  if (isNaN(efficiency) || isNaN(distance) || efficiency <= 0 || distance <= 0) {
    return null
  }
  
  // Get fuel price
  const fuelPrice = UAE_FUEL_PRICES[data.fuelType] || 3.0
  
  // Calculate days in period
  const days = getDaysForPeriod(data.timePeriod, parseInt(data.customDays) || 30)
  
  // Calculate adjustment factor from driving habits
  const styleF = DRIVING_STYLE_FACTORS[data.drivingStyle] || 1
  const envF = ENVIRONMENT_FACTORS[data.environment] || 1
  const acF = AC_FACTORS[data.acUsage] || 1
  const trafficF = TRAFFIC_FACTORS[data.trafficLevel] || 1
  
  // Idle fuel consumption
  const idleMins = parseFloat(data.idleMinutes) || 0
  const idleHoursPerDay = idleMins / 60
  const idleLitersPerPeriod = idleHoursPerDay * IDLE_CONSUMPTION_PER_HOUR * days
  
  // Combined factor
  const totalFactor = styleF * envF * acF * trafficF
  
  // Adjusted efficiency (L/100km)
  const adjustedEfficiency = efficiency * totalFactor
  
  // Total distance for period
  const totalDistance = distance * days
  
  // Fuel consumed (liters)
  const fuelConsumed = (totalDistance / 100) * adjustedEfficiency + idleLitersPerPeriod
  
  // Total cost
  const totalCost = fuelConsumed * fuelPrice
  
  // Calculate breakdowns
  const costPerDay = totalCost / days
  const costPerWeek = costPerDay * 7
  const costPerMonth = costPerDay * 30
  const costPerYear = costPerDay * 365
  const costPerKm = totalCost / totalDistance
  
  // Tank calculations (estimate 50L average tank)
  const tankSize = 50
  const rangePerTank = (tankSize / adjustedEfficiency) * 100
  const tankFills = fuelConsumed / tankSize
  
  // CO2 emissions
  const co2Emissions = fuelConsumed * (CO2_PER_LITER[data.fuelType] || 2.31)
  
  // Comparison with current spending
  let comparison: FuelResult['comparison']
  const currentSpending = parseFloat(data.currentSpending)
  if (!isNaN(currentSpending) && currentSpending > 0) {
    // Normalize to monthly for comparison
    const monthlyCalculated = costPerMonth
    const monthlyReported = currentSpending
    const difference = monthlyReported - monthlyCalculated
    comparison = {
      difference: Math.abs(difference),
      percentDiff: Math.abs((difference / monthlyCalculated) * 100),
      isOverspending: difference > 0,
    }
  }
  
  return {
    fuelConsumed: Math.round(fuelConsumed * 10) / 10,
    totalCost: Math.round(totalCost),
    costPerDay: Math.round(costPerDay),
    costPerWeek: Math.round(costPerWeek),
    costPerMonth: Math.round(costPerMonth),
    costPerYear: Math.round(costPerYear),
    costPerKm: Math.round(costPerKm * 100) / 100,
    tankFills: Math.round(tankFills * 10) / 10,
    rangePerTank: Math.round(rangePerTank),
    co2Emissions: Math.round(co2Emissions),
    adjustedEfficiency: Math.round(adjustedEfficiency * 10) / 10,
    comparison,
  }
}

// ============================================================================
// TRIP CALCULATION
// ============================================================================

export function calculateTripCost(data: FuelFormData): TripResult | null {
  const efficiency = parseFloat(data.efficiency)
  const tripDistance = parseFloat(data.tripDistance)
  
  if (isNaN(efficiency) || isNaN(tripDistance) || efficiency <= 0 || tripDistance <= 0) {
    return null
  }
  
  const fuelPrice = UAE_FUEL_PRICES[data.fuelType] || 3.0
  
  // Round trip doubles distance
  const totalDistance = data.tripType === 'round_trip' ? tripDistance * 2 : tripDistance
  
  // Fuel needed
  const fuelNeeded = (totalDistance / 100) * efficiency
  
  // Cost
  const cost = fuelNeeded * fuelPrice
  
  return {
    distance: totalDistance,
    fuelNeeded: Math.round(fuelNeeded * 10) / 10,
    cost: Math.round(cost),
  }
}

// ============================================================================
// FORMATTERS
// ============================================================================

export function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString('en-AE')}`
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-AE')
}

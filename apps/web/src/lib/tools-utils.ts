/**
 * Shared utilities and data for car tools
 * These can be enhanced with real UAE market data
 */

// Current fuel prices in UAE (update monthly)
export const FUEL_PRICES = {
  super98: 3.10,
  special95: 3.00,
  diesel: 3.15,
} as const

// Standard depreciation rates by year
export const DEPRECIATION_RATES = {
  year1: 0.20, // 20% first year
  year2: 0.15, // 15% second year
  year3: 0.12, // 12% third year
  year4plus: 0.10, // 10% per year after
} as const

// Brand-specific depreciation multipliers
export const BRAND_DEPRECIATION_MULTIPLIERS = {
  // Luxury brands depreciate faster
  mercedes: 1.2,
  bmw: 1.2,
  audi: 1.2,
  'land-rover': 1.3,
  jaguar: 1.3,
  
  // Japanese/Korean hold value well
  toyota: 0.8,
  lexus: 0.85,
  honda: 0.9,
  nissan: 0.95,
  
  // Standard
  default: 1.0,
} as const

// RTA registration fees by emirate
export const REGISTRATION_FEES = {
  dubai: {
    registration: 420,
    emiratesId: 30,
    knowledge: 10,
    innovation: 10,
  },
  'abu-dhabi': {
    registration: 400,
    testing: 170,
  },
  sharjah: {
    registration: 350,
    misc: 50,
  },
  ajman: {
    registration: 350,
    misc: 40,
  },
  other: {
    registration: 400,
    misc: 50,
  },
} as const

// Insurance rate ranges
export const INSURANCE_RATES = {
  comprehensive: {
    base: 0.03, // 3% of car value
    minAge: 0.005, // +0.5% for drivers under 25
    expat: 0.002, // +0.2% for expats
  },
  thirdParty: {
    min: 600,
    max: 1200,
    average: 800,
  },
} as const

// Average fuel efficiency by vehicle type (L/100km)
export const AVERAGE_FUEL_EFFICIENCY = {
  sedan: 8.5,
  suv: 12.0,
  luxury: 14.0,
  sports: 16.0,
  compact: 6.5,
  hybrid: 5.0,
} as const

/**
 * Calculate car depreciation based on purchase price, year, and brand
 */
export function calculateDepreciation(
  purchasePrice: number,
  yearBought: number,
  brand: string = 'default',
  currentYear: number = new Date().getFullYear()
): number {
  const yearsOwned = currentYear - yearBought
  const brandMultiplier = BRAND_DEPRECIATION_MULTIPLIERS[brand as keyof typeof BRAND_DEPRECIATION_MULTIPLIERS] || 1.0
  
  let remainingValue = purchasePrice
  
  for (let i = 0; i < yearsOwned; i++) {
    let rate: number
    if (i === 0) rate = DEPRECIATION_RATES.year1
    else if (i === 1) rate = DEPRECIATION_RATES.year2
    else if (i === 2) rate = DEPRECIATION_RATES.year3
    else rate = DEPRECIATION_RATES.year4plus
    
    remainingValue -= remainingValue * rate * brandMultiplier
  }
  
  return Math.max(remainingValue, purchasePrice * 0.1) // Never go below 10% of original value
}

/**
 * Calculate mileage impact on value
 * Assumes average is 20,000 km/year, penalty for excess
 */
export function calculateMileageImpact(
  mileage: number,
  yearBought: number,
  currentYear: number = new Date().getFullYear()
): number {
  const yearsOwned = currentYear - yearBought
  const averageMileage = yearsOwned * 20000
  const excessMileage = Math.max(0, mileage - averageMileage)
  
  // AED 0.50 per km over average
  return excessMileage * 0.5
}

/**
 * Calculate condition multiplier
 */
export function getConditionMultiplier(condition: string): number {
  const multipliers = {
    excellent: 1.0,
    good: 0.9,
    fair: 0.8,
    poor: 0.65,
  }
  return multipliers[condition as keyof typeof multipliers] || 0.9
}

/**
 * Estimate car value (simplified valuation logic)
 */
export function estimateCarValue(params: {
  basePrice: number
  yearBought: number
  mileage: number
  condition: string
  brand: string
  emirate?: string
}): number {
  const { basePrice, yearBought, mileage, condition, brand, emirate } = params
  
  // Calculate depreciation
  const depreciatedValue = calculateDepreciation(basePrice, yearBought, brand)
  
  // Apply condition multiplier
  const conditionValue = depreciatedValue * getConditionMultiplier(condition)
  
  // Subtract mileage impact
  const mileageImpact = calculateMileageImpact(mileage, yearBought)
  const valueAfterMileage = Math.max(conditionValue - mileageImpact, basePrice * 0.05)
  
  // Location factor (Dubai has slight premium)
  const locationMultiplier = emirate === 'dubai' ? 1.05 : 1.0
  
  return valueAfterMileage * locationMultiplier
}

/**
 * Calculate monthly loan payment
 */
export function calculateLoanPayment(
  principal: number,
  annualRate: number,
  years: number
): {
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
} {
  const monthlyRate = annualRate / 12
  const numberOfPayments = years * 12
  
  // Monthly payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
  const monthlyPayment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  
  const totalAmount = monthlyPayment * numberOfPayments
  const totalInterest = totalAmount - principal
  
  return {
    monthlyPayment: isFinite(monthlyPayment) ? monthlyPayment : 0,
    totalAmount: isFinite(totalAmount) ? totalAmount : 0,
    totalInterest: isFinite(totalInterest) ? totalInterest : 0,
  }
}

/**
 * Calculate annual fuel cost
 */
export function calculateFuelCost(
  annualMileage: number,
  fuelEfficiency: number, // L/100km
  fuelType: keyof typeof FUEL_PRICES = 'special95'
): {
  litersPerYear: number
  costPerYear: number
  costPerMonth: number
  costPerKm: number
} {
  const litersPerYear = (annualMileage / 100) * fuelEfficiency
  const pricePerLiter = FUEL_PRICES[fuelType]
  const costPerYear = litersPerYear * pricePerLiter
  
  return {
    litersPerYear,
    costPerYear,
    costPerMonth: costPerYear / 12,
    costPerKm: costPerYear / annualMileage,
  }
}

/**
 * Estimate insurance premium
 */
export function estimateInsurance(
  carValue: number,
  insuranceType: 'comprehensive' | 'third-party',
  driverAge: number,
  nationality: 'gcc' | 'expat'
): {
  annualPremium: number
  range: { min: number; max: number }
} {
  if (insuranceType === 'third-party') {
    return {
      annualPremium: INSURANCE_RATES.thirdParty.average,
      range: {
        min: INSURANCE_RATES.thirdParty.min,
        max: INSURANCE_RATES.thirdParty.max,
      },
    }
  }
  
  // Comprehensive
  let rate = INSURANCE_RATES.comprehensive.base
  
  if (driverAge < 25) {
    rate += INSURANCE_RATES.comprehensive.minAge
  }
  
  if (nationality === 'expat') {
    rate += INSURANCE_RATES.comprehensive.expat
  }
  
  const premium = carValue * rate
  
  return {
    annualPremium: premium,
    range: {
      min: carValue * (rate - 0.005),
      max: carValue * (rate + 0.005),
    },
  }
}

/**
 * Calculate total ownership cost
 */
export function calculateOwnershipCost(params: {
  carPrice: number
  years: number
  annualMileage: number
  fuelEfficiency: number
  insuranceType: 'comprehensive' | 'third-party'
  brand: string
}): {
  depreciation: number
  fuel: number
  insurance: number
  maintenance: number
  registration: number
  total: number
} {
  const { carPrice, years, annualMileage, fuelEfficiency, insuranceType, brand } = params
  
  // Depreciation
  const futureValue = calculateDepreciation(carPrice, new Date().getFullYear(), brand, new Date().getFullYear() + years)
  const depreciation = carPrice - futureValue
  
  // Fuel
  const fuelPerYear = calculateFuelCost(annualMileage, fuelEfficiency)
  const fuel = fuelPerYear.costPerYear * years
  
  // Insurance (simplified)
  const insurancePerYear = insuranceType === 'comprehensive' ? carPrice * 0.03 : 800
  const insurance = insurancePerYear * years
  
  // Maintenance (increases with age)
  const maintenancePerYear = 3000 + years * 500
  const maintenance = maintenancePerYear * years
  
  // Registration (Dubai rates)
  const registration = 470 * years
  
  const total = depreciation + fuel + insurance + maintenance + registration
  
  return {
    depreciation,
    fuel,
    insurance,
    maintenance,
    registration,
    total,
  }
}

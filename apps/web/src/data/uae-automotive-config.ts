/**
 * UAE Automotive Configuration
 * 
 * This file contains all UAE-specific data for automotive tools.
 * Update this file monthly for fuel prices (usually announced on 28th of each month)
 * 
 * Official sources:
 * - Fuel prices: https://www.adnoc.ae or @ADLOCDISTRIBUTION on Twitter
 * - Registration: RTA Dubai, TAMM Abu Dhabi, Sharjah Traffic
 * - Insurance: Central Bank of UAE guidelines
 * 
 * Last updated: February 2026
 */

// ============================================================================
// FUEL PRICES (Update monthly - announced on ~28th of each month)
// ============================================================================
export const UAE_FUEL_PRICES = {
  // Effective date of these prices
  effectiveDate: '2026-02-01',
  lastUpdated: '2026-02-01',
  
  // Prices in AED per liter
  super98: 3.10,     // Premium unleaded (RON 98)
  special95: 3.00,   // Regular unleaded (RON 95) 
  e_plus91: 2.90,    // E-Plus 91 (economy)
  diesel: 3.15,      // Diesel
  
  // Source reference
  source: 'ADNOC Distribution',
} as const

// Fuel type display info
export const FUEL_TYPES = [
  {
    id: 'super98',
    name: 'Super 98',
    nameAr: 'سوبر ٩٨',
    description: 'Premium unleaded (RON 98) - High performance vehicles',
    color: '#22C55E', // Green
  },
  {
    id: 'special95',
    name: 'Special 95',
    nameAr: 'سبيشل ٩٥',
    description: 'Regular unleaded (RON 95) - Most vehicles',
    color: '#EAB308', // Yellow/Gold
  },
  {
    id: 'e_plus91',
    name: 'E-Plus 91',
    nameAr: 'إي بلس ٩١',
    description: 'Economy option (RON 91) - Older/basic vehicles',
    color: '#3B82F6', // Blue
  },
  {
    id: 'diesel',
    name: 'Diesel',
    nameAr: 'ديزل',
    description: 'For diesel engines',
    color: '#000000', // Black
  },
] as const

// ============================================================================
// VEHICLE REGISTRATION FEES BY EMIRATE
// ============================================================================
export const UAE_REGISTRATION_FEES = {
  dubai: {
    name: 'Dubai',
    authority: 'RTA Dubai',
    website: 'https://www.rta.ae',
    fees: {
      // Vehicle Registration
      newRegistration: 420,
      renewal: 420,
      transferOwnership: 350,
      exportCancellation: 120,
      
      // Additional mandatory fees
      emiratesIdLink: 30,
      knowledgeFee: 10,
      innovationFee: 10,
      trafficFile: 200,     // First time only
      
      // Testing
      testingFee: 120,       // For new/imported vehicles
      retestFee: 75,
      
      // Plates
      standardPlate: 35,
      customPlate: {
        starts: 20000,       // Starting price for custom plates
      },
      
      // Insurance certificate processing
      insuranceCertificate: 50,
    },
    notes: [
      'Standard registration valid for 1 year',
      'Testing required for vehicles over 3 years old',
      'Late renewal penalty: AED 10/month (max AED 500)',
      'Salik tag (toll) required separately',
    ],
  },
  
  abuDhabi: {
    name: 'Abu Dhabi',
    authority: 'TAMM / ITC',
    website: 'https://www.tamm.abudhabi',
    fees: {
      newRegistration: 400,
      renewal: 400,
      transferOwnership: 300,
      exportCancellation: 100,
      
      // Testing
      testingFee: 170,
      retestFee: 85,
      
      // Plates
      standardPlate: 50,
      
      // Traffic file
      trafficFile: 200,
    },
    notes: [
      'Environmental testing also required',
      'Darb toll system active - tag required',
      'Online processing available via TAMM',
    ],
  },
  
  sharjah: {
    name: 'Sharjah',
    authority: 'Sharjah Traffic & Licensing',
    website: 'https://www.sharjah.ae',
    fees: {
      newRegistration: 350,
      renewal: 350,
      transferOwnership: 250,
      exportCancellation: 100,
      
      testingFee: 130,
      retestFee: 65,
      
      standardPlate: 30,
      trafficFile: 150,
    },
    notes: [
      'Can process Dubai-plated vehicles too',
      'Generally lower fees than Dubai',
    ],
  },
  
  ajman: {
    name: 'Ajman',
    authority: 'Ajman Transport Authority',
    website: 'https://www.ajman.ae',
    fees: {
      newRegistration: 300,
      renewal: 300,
      transferOwnership: 200,
      exportCancellation: 80,
      
      testingFee: 110,
      retestFee: 55,
      
      standardPlate: 30,
      trafficFile: 120,
    },
    notes: [
      'Most affordable registration in UAE',
      'Popular for budget-conscious buyers',
    ],
  },
  
  rak: {
    name: 'Ras Al Khaimah',
    authority: 'RAK Transport Authority',
    website: 'https://www.rak.ae',
    fees: {
      newRegistration: 320,
      renewal: 320,
      transferOwnership: 220,
      exportCancellation: 80,
      
      testingFee: 115,
      retestFee: 60,
      
      standardPlate: 30,
      trafficFile: 130,
    },
    notes: [
      'Vehicle testing centers available',
    ],
  },
  
  fujairah: {
    name: 'Fujairah',
    authority: 'Fujairah Traffic Department',
    website: 'https://www.fujairah.ae',
    fees: {
      newRegistration: 310,
      renewal: 310,
      transferOwnership: 200,
      exportCancellation: 75,
      
      testingFee: 110,
      retestFee: 55,
      
      standardPlate: 25,
      trafficFile: 120,
    },
    notes: [
      'Lowest plate fees in UAE',
    ],
  },
  
  umm_al_quwain: {
    name: 'Umm Al Quwain',
    authority: 'UAQ Traffic Department',
    website: 'https://www.uaq.ae',
    fees: {
      newRegistration: 280,
      renewal: 280,
      transferOwnership: 180,
      exportCancellation: 70,
      
      testingFee: 100,
      retestFee: 50,
      
      standardPlate: 25,
      trafficFile: 110,
    },
    notes: [
      'Lowest overall registration fees',
    ],
  },
} as const

// ============================================================================
// INSURANCE RATES & FACTORS
// ============================================================================
export const UAE_INSURANCE_CONFIG = {
  // Comprehensive Insurance Base Rates (% of car value)
  comprehensive: {
    baseRateMin: 0.025,    // 2.5%
    baseRateMax: 0.035,    // 3.5%
    baseRateTypical: 0.028, // 2.8% typical starting point
  },
  
  // Third Party Liability (Fixed amounts)
  thirdParty: {
    min: 450,
    max: 1500,
    typical: 750,
  },
  
  // Risk Factors - These adjust the base rate
  riskFactors: {
    // Age factors
    age: {
      under21: { adjustment: 0.015, description: 'High risk - under 21' },
      under25: { adjustment: 0.008, description: 'Higher risk - under 25' },
      age25to65: { adjustment: 0, description: 'Standard rate' },
      over65: { adjustment: 0.003, description: 'Senior driver' },
    },
    
    // License/Experience factors
    licenseAge: {
      under1Year: { adjustment: 0.010, description: 'New driver (< 1 year)' },
      under3Years: { adjustment: 0.005, description: 'Limited experience (1-3 years)' },
      over3Years: { adjustment: 0, description: 'Experienced driver' },
    },
    
    // Nationality factors (based on accident statistics)
    nationality: {
      uae: { adjustment: -0.002, description: 'UAE National' },
      gcc: { adjustment: 0, description: 'GCC National' },
      western: { adjustment: 0.002, description: 'Western expat' },
      asian: { adjustment: 0.003, description: 'Asian expat' },
      other: { adjustment: 0.005, description: 'Other nationality' },
    },
    
    // Vehicle factors
    vehicleAge: {
      new: { adjustment: -0.002, description: 'New (0-2 years)' },
      midAge: { adjustment: 0, description: '3-5 years old' },
      older: { adjustment: 0.003, description: '6-10 years old' },
      vintage: { adjustment: 0.008, description: 'Over 10 years' },
    },
    
    // Brand risk (repair costs/theft rates)
    brandRisk: {
      economy: { adjustment: -0.003, description: 'Economy brand (Toyota, Nissan)' },
      standard: { adjustment: 0, description: 'Standard brand' },
      luxury: { adjustment: 0.005, description: 'Luxury brand (Mercedes, BMW)' },
      supercar: { adjustment: 0.015, description: 'Supercar/Exotic' },
    },
    
    // Claims history
    claimsHistory: {
      noClaims3Plus: { adjustment: -0.005, description: '3+ years no claims' },
      noClaims1to2: { adjustment: -0.002, description: '1-2 years no claims' },
      recent1Claim: { adjustment: 0.005, description: '1 claim in past year' },
      recent2PlusClaims: { adjustment: 0.012, description: '2+ claims in past year' },
    },
  },
  
  // Coverage add-ons
  addOns: {
    agencyRepair: { percentage: 0.005, description: 'Agency repair (vs. garage)' },
    gccCoverage: { fixed: 150, description: 'GCC-wide coverage' },
    personalAccident: { fixed: 100, description: 'Personal accident cover' },
    roadAssistance: { fixed: 75, description: '24/7 roadside assistance' },
    carReplacement: { fixed: 200, description: 'Replacement car while repairing' },
    depreciationWaiver: { percentage: 0.003, description: 'Depreciation waiver' },
  },
  
  // Minimum requirements (UAE law)
  legalMinimum: {
    thirdPartyLiability: 250000, // AED minimum liability
    personalInjury: 200000,
  },
  
  notes: [
    'All vehicles must have at least Third Party insurance',
    'Comprehensive recommended for vehicles under 5 years',
    'Claims-free discount applies after 1 year (up to 25%)',
    'Premium typically due annually or monthly (+5-10% for monthly)',
  ],
} as const

// ============================================================================
// DEPRECIATION RATES BY VEHICLE TYPE & SPECS
// ============================================================================
export const UAE_DEPRECIATION_CONFIG = {
  // Standard depreciation curves (% value lost per year)
  // Source: UAE used car market analysis
  standardCurve: {
    year1: 0.20,  // 20% first year (drive-off depreciation)
    year2: 0.15,  // 15% second year
    year3: 0.12,  // 12% third year
    year4: 0.10,  // 10% fourth year
    year5: 0.08,  // 8% fifth year
    year6Plus: 0.06, // 6% per year after
  },
  
  // Specs origin adjustment (multiplier applied to base depreciation)
  specsMultiplier: {
    gcc: {
      multiplier: 1.0,
      description: 'GCC Spec - Best resale value',
      notes: 'Original warranty, service network support, climate optimized',
    },
    american: {
      multiplier: 1.15,
      description: 'American Spec - Higher depreciation',
      notes: 'No local warranty, metric conversion issues, potential recalls',
    },
    european: {
      multiplier: 1.10,
      description: 'European Spec - Moderate impact',
      notes: 'Good quality but warranty/parts concerns',
    },
    japanese: {
      multiplier: 1.05,
      description: 'Japanese Spec - Slight impact',
      notes: 'Generally reliable, some feature differences',
    },
    korean: {
      multiplier: 1.02,
      description: 'Korean Spec - Minimal impact',
      notes: 'Similar to GCC for Korean brands',
    },
    other: {
      multiplier: 1.20,
      description: 'Other/Unknown Spec - Highest depreciation',
      notes: 'Uncertain provenance, buyer skepticism',
    },
  },
  
  // Brand category adjustments
  brandCategory: {
    // Holds value well
    premium_resilient: {
      brands: ['Toyota', 'Lexus', 'Land Cruiser', 'Nissan Patrol'],
      multiplier: 0.85,
      description: 'Premium resilience - holds value exceptionally well in UAE',
    },
    // Standard depreciation
    mainstream_reliable: {
      brands: ['Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Hyundai', 'Kia'],
      multiplier: 1.0,
      description: 'Mainstream reliable - standard depreciation',
    },
    // Faster depreciation
    luxury_german: {
      brands: ['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Volkswagen'],
      multiplier: 1.15,
      description: 'German luxury - higher running costs affect resale',
    },
    // Variable
    luxury_british: {
      brands: ['Range Rover', 'Jaguar', 'Bentley', 'Rolls-Royce'],
      multiplier: 1.25,
      description: 'British luxury - steeper depreciation curve',
    },
    // American
    american: {
      brands: ['Ford', 'Chevrolet', 'GMC', 'Dodge', 'Jeep', 'Cadillac'],
      multiplier: 1.10,
      description: 'American brands - moderate depreciation',
    },
    // Exotic
    exotic: {
      brands: ['Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin', 'Maserati'],
      multiplier: 1.30,
      description: 'Exotic - high depreciation but can stabilize',
    },
  },
  
  // Condition adjustments (multiplier on final value)
  conditionMultiplier: {
    excellent: {
      multiplier: 1.10,
      criteria: ['Full agency service history', 'No accidents', 'Single owner', 'Low mileage'],
    },
    good: {
      multiplier: 1.0,
      criteria: ['Regular service history', 'Minor cosmetic wear', 'No major accidents'],
    },
    fair: {
      multiplier: 0.90,
      criteria: ['Service gaps', 'Cosmetic issues', 'Minor accident history'],
    },
    poor: {
      multiplier: 0.75,
      criteria: ['Poor maintenance', 'Multiple accidents', 'High mileage', 'Mechanical issues'],
    },
  },
  
  // Mileage impact (per 10,000km over/under average)
  mileageImpact: {
    averageAnnualKm: 20000, // UAE average
    adjustmentPerExcess10k: -0.02, // -2% per 10k over average
    adjustmentPerUnder10k: 0.01,   // +1% per 10k under average
    maxAdjustment: 0.15,           // Cap at 15% either way
  },
} as const

// ============================================================================
// BANK FINANCING RATES
// ============================================================================
export const UAE_FINANCING_CONFIG = {
  // Last updated: February 2026
  lastUpdated: '2026-02-01',
  
  // Conventional auto loans
  conventional: {
    rateRange: {
      min: 2.49,  // Best rate (excellent credit, high down payment)
      max: 5.99,  // Higher risk borrowers
      typical: 3.49, // Average rate
    },
    terms: {
      minYears: 1,
      maxYears: 5,
      typicalYears: 4,
    },
    downPayment: {
      minPercent: 20, // UAE Central Bank requirement
      typicalPercent: 25,
    },
    fees: {
      processingFee: 525,      // Typical, some banks waive
      earlySettlement: 0.01,   // 1% of remaining balance
      latePayment: 250,        // Per instance
    },
    eligibility: {
      minSalary: 5000,         // AED/month
      minEmployment: 3,        // months
      maxAge: 65,              // at loan end
      maxVehicleAge: 5,        // years for new loan
    },
  },
  
  // Islamic financing (Murabaha/Ijara)
  islamic: {
    profitRateRange: {
      min: 2.69,
      max: 5.49,
      typical: 3.29,
    },
    terms: {
      minYears: 1,
      maxYears: 5,
      typicalYears: 4,
    },
    downPayment: {
      minPercent: 20,
      typicalPercent: 20,
    },
    fees: {
      adminFee: 500,
      takafulContribution: 0.005, // 0.5% of financing amount
    },
    types: [
      {
        name: 'Murabaha',
        description: 'Bank buys car and sells to you at markup',
        common: true,
      },
      {
        name: 'Ijara',
        description: 'Lease-to-own arrangement',
        common: true,
      },
      {
        name: 'Musawama',
        description: 'Bank doesn\'t disclose cost/profit',
        common: false,
      },
    ],
    eligibility: {
      minSalary: 5000,
      minEmployment: 3,
      maxAge: 65,
      maxVehicleAge: 5,
    },
  },
  
  // Major banks offering auto loans
  majorBanks: [
    { name: 'Emirates NBD', type: 'both', typical_rate: 2.99 },
    { name: 'ADCB', type: 'both', typical_rate: 3.19 },
    { name: 'FAB', type: 'both', typical_rate: 3.09 },
    { name: 'Dubai Islamic Bank', type: 'islamic', typical_rate: 2.99 },
    { name: 'ADIB', type: 'islamic', typical_rate: 3.15 },
    { name: 'Mashreq', type: 'both', typical_rate: 3.49 },
    { name: 'RAK Bank', type: 'both', typical_rate: 3.99 },
    { name: 'Commercial Bank of Dubai', type: 'both', typical_rate: 3.29 },
  ],
  
  notes: [
    'Central Bank mandates minimum 20% down payment',
    'Interest rates vary based on credit score and salary',
    'Salary transfer to lending bank often required',
    'Car registered with bank lien until loan completion',
    'Comprehensive insurance mandatory throughout loan term',
  ],
} as const

// ============================================================================
// POPULAR VEHICLES IN UAE (for fuel efficiency defaults)
// ============================================================================
export const UAE_POPULAR_VEHICLES = {
  sedans: [
    { name: 'Toyota Camry', fuelEfficiency: 7.8, fuelType: 'special95' },
    { name: 'Honda Accord', fuelEfficiency: 8.0, fuelType: 'special95' },
    { name: 'Nissan Altima', fuelEfficiency: 7.5, fuelType: 'special95' },
    { name: 'Mercedes E-Class', fuelEfficiency: 9.2, fuelType: 'super98' },
    { name: 'BMW 5 Series', fuelEfficiency: 9.0, fuelType: 'super98' },
  ],
  suvs: [
    { name: 'Toyota Land Cruiser', fuelEfficiency: 14.5, fuelType: 'super98' },
    { name: 'Nissan Patrol', fuelEfficiency: 15.2, fuelType: 'super98' },
    { name: 'Toyota Fortuner', fuelEfficiency: 10.5, fuelType: 'diesel' },
    { name: 'Lexus LX', fuelEfficiency: 14.0, fuelType: 'super98' },
    { name: 'Range Rover', fuelEfficiency: 12.5, fuelType: 'super98' },
  ],
  economy: [
    { name: 'Toyota Corolla', fuelEfficiency: 6.8, fuelType: 'special95' },
    { name: 'Honda Civic', fuelEfficiency: 7.0, fuelType: 'special95' },
    { name: 'Nissan Sunny', fuelEfficiency: 6.5, fuelType: 'e_plus91' },
    { name: 'Hyundai Elantra', fuelEfficiency: 6.9, fuelType: 'special95' },
    { name: 'Kia Cerato', fuelEfficiency: 7.2, fuelType: 'special95' },
  ],
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFuelPrice(fuelType: keyof typeof UAE_FUEL_PRICES): number {
  if (fuelType === 'effectiveDate' || fuelType === 'lastUpdated' || fuelType === 'source') {
    throw new Error('Invalid fuel type')
  }
  return UAE_FUEL_PRICES[fuelType]
}

export function formatAED(amount: number, decimals = 0): string {
  return `AED ${amount.toLocaleString('en-AE', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function getEmirateById(id: string) {
  return UAE_REGISTRATION_FEES[id as keyof typeof UAE_REGISTRATION_FEES]
}

export type EmirateId = keyof typeof UAE_REGISTRATION_FEES
export type FuelTypeId = 'super98' | 'special95' | 'e_plus91' | 'diesel'

/**
 * VIN Decoder Utility - NHTSA API Integration
 * 
 * Decodes Vehicle Identification Numbers using the free NHTSA vPIC API
 * https://vpic.nhtsa.dot.gov/api/
 * 
 * @module lib/vin-decoder
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VINDecodeResult {
  success: boolean;
  data?: DecodedVehicle;
  error?: string;
}

export interface DecodedVehicle {
  // Basic Info
  vin: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  
  // Body & Style
  bodyType?: string;
  doors?: string;
  
  // Engine & Performance
  engineSize?: string;        // We'll map to our simplified ranges
  engineType?: string;
  cylinders?: number;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  horsepower?: number;
  
  // Additional
  vehicleType?: string;
  plantCountry?: string;
  plantCity?: string;
  manufacturer?: string;
  series?: string;
}

interface NHTSAResult {
  Variable: string;
  Value: string | null;
  ValueId: string | null;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAResult[];
}

// ============================================================================
// MAPPINGS
// ============================================================================

/**
 * Map NHTSA body class to our body types
 */
const BODY_TYPE_MAP: Record<string, string> = {
  'sedan': 'sedan',
  'sedan/saloon': 'sedan',
  'hatchback': 'hatchback',
  'hatchback/liftback': 'hatchback',
  'coupe': 'coupe',
  'convertible': 'convertible',
  'convertible/cabriolet': 'convertible',
  'wagon': 'wagon',
  'sport utility vehicle (suv)': 'suv',
  'suv': 'suv',
  'crossover utility vehicle (cuv)': 'suv',
  'pickup': 'pickup',
  'truck': 'pickup',
  'van': 'van',
  'minivan': 'van',
  'cargo van': 'van',
  'sports car': 'sports',
  'luxury': 'luxury',
};

/**
 * Map NHTSA fuel type to our fuel types
 */
const FUEL_TYPE_MAP: Record<string, string> = {
  'gasoline': 'petrol',
  'gas': 'petrol',
  'petrol': 'petrol',
  'diesel': 'diesel',
  'electric': 'electric',
  'battery electric vehicle (bev)': 'electric',
  'hybrid': 'hybrid',
  'plug-in hybrid (phev)': 'plugin_hybrid',
  'plug-in hybrid': 'plugin_hybrid',
  'hydrogen fuel cell': 'hydrogen',
  'fuel cell': 'hydrogen',
};

/**
 * Map NHTSA transmission to our transmission types
 */
const TRANSMISSION_MAP: Record<string, string> = {
  'automatic': 'automatic',
  'manual': 'manual',
  'cvt': 'cvt',
  'continuously variable transmission (cvt)': 'cvt',
  'automated manual transmission (amt)': 'semi_automatic',
  'dual-clutch transmission (dct)': 'dct',
  'dct': 'dct',
};

/**
 * Map NHTSA engine type/config to our engine types
 */
const ENGINE_TYPE_MAP: Record<string, string> = {
  'in-line': 'inline-4',
  'v-shaped': 'v6',
  'w-shaped': 'w12',
  'flat': 'other',
  'rotary': 'other',
  'electric': 'electric',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map engine displacement to our simplified size ranges
 */
function mapEngineSize(displacementLiters: number | null): string | undefined {
  if (!displacementLiters) return undefined;
  
  const liters = displacementLiters;
  
  if (liters === 0) return 'electric';
  if (liters < 1.5) return 'under_1.5L';
  if (liters < 2.0) return '1.5L_2.0L';
  if (liters < 2.5) return '2.0L_2.5L';
  if (liters < 3.0) return '2.5L_3.0L';
  if (liters < 4.0) return '3.0L_4.0L';
  if (liters < 5.0) return '4.0L_5.0L';
  if (liters < 6.0) return '5.0L_6.0L';
  return 'over_6.0L';
}

/**
 * Get engine type from cylinders and configuration
 */
function getEngineType(cylinders: number | null, config: string | null): string | undefined {
  if (!cylinders) return config ? ENGINE_TYPE_MAP[config.toLowerCase()] : undefined;
  
  const configLower = config?.toLowerCase() || '';
  
  // Electric motors
  if (cylinders === 0) return 'electric';
  
  // V configurations
  if (configLower.includes('v-shaped') || configLower.includes('v ')) {
    if (cylinders === 6) return 'v6';
    if (cylinders === 8) return 'v8';
    if (cylinders === 10) return 'v10';
    if (cylinders === 12) return 'v12';
  }
  
  // W configurations
  if (configLower.includes('w-shaped') || configLower.includes('w ')) {
    if (cylinders === 12) return 'w12';
  }
  
  // Inline configurations
  if (configLower.includes('in-line') || configLower.includes('inline') || configLower.includes('straight')) {
    if (cylinders === 3) return 'inline-3';
    if (cylinders === 4) return 'inline-4';
    if (cylinders === 6) return 'inline-6';
  }
  
  // Default based on cylinders
  if (cylinders === 3) return 'inline-3';
  if (cylinders === 4) return 'inline-4';
  if (cylinders === 6) return 'v6';
  if (cylinders === 8) return 'v8';
  
  return 'other';
}

/**
 * Extract value from NHTSA results
 */
function getValue(results: NHTSAResult[], variable: string): string | null {
  const result = results.find(r => r.Variable === variable);
  return result?.Value || null;
}

/**
 * Extract numeric value from NHTSA results
 */
function getNumericValue(results: NHTSAResult[], variable: string): number | null {
  const value = getValue(results, variable);
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// ============================================================================
// MAIN DECODER FUNCTION
// ============================================================================

/**
 * Decode a VIN using the NHTSA vPIC API
 * 
 * @param vin - 17-character Vehicle Identification Number
 * @returns Decoded vehicle information or error
 */
export async function decodeVIN(vin: string): Promise<VINDecodeResult> {
  // Validate VIN format
  const cleanVIN = vin.trim().toUpperCase();
  
  if (cleanVIN.length !== 17) {
    return { success: false, error: 'VIN must be exactly 17 characters' };
  }
  
  // VIN cannot contain I, O, or Q
  if (/[IOQ]/i.test(cleanVIN)) {
    return { success: false, error: 'VIN cannot contain letters I, O, or Q' };
  }
  
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVIN}?format=json`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );
    
    if (!response.ok) {
      return { success: false, error: 'Failed to connect to VIN decoder service' };
    }
    
    const data: NHTSAResponse = await response.json();
    
    // Extract make, model, year - try to get whatever data is available
    // Note: Error codes 5,14 etc. mean partial decode - we still want partial data
    const make = getValue(data.Results, 'Make');
    const model = getValue(data.Results, 'Model');
    const year = getNumericValue(data.Results, 'Model Year');
    
    // We need at least make and year to return useful data
    // Model can be null for some VINs (especially European ones)
    if (!make || !year) {
      const errorText = getValue(data.Results, 'Error Text');
      return { success: false, error: errorText || 'Could not decode vehicle information from VIN' };
    }
    
    // Extract optional fields
    const bodyClass = getValue(data.Results, 'Body Class')?.toLowerCase();
    const doors = getValue(data.Results, 'Doors');
    const displacementL = getNumericValue(data.Results, 'Displacement (L)');
    const cylinders = getNumericValue(data.Results, 'Engine Number of Cylinders');
    const engineConfig = getValue(data.Results, 'Engine Configuration');
    const fuelTypePrimary = getValue(data.Results, 'Fuel Type - Primary')?.toLowerCase();
    const transmissionStyle = getValue(data.Results, 'Transmission Style')?.toLowerCase();
    const driveType = getValue(data.Results, 'Drive Type');
    const horsepower = getNumericValue(data.Results, 'Engine Brake (hp) From');
    const trim = getValue(data.Results, 'Trim');
    const series = getValue(data.Results, 'Series');
    const vehicleType = getValue(data.Results, 'Vehicle Type');
    const plantCountry = getValue(data.Results, 'Plant Country');
    const plantCity = getValue(data.Results, 'Plant City');
    const manufacturer = getValue(data.Results, 'Manufacturer Name');
    
    const decoded: DecodedVehicle = {
      vin: cleanVIN,
      make,
      model: model || '', // Model may be empty for some VINs
      year,
      trim: trim || series || undefined,
      bodyType: bodyClass ? BODY_TYPE_MAP[bodyClass] || undefined : undefined,
      doors: doors || undefined,
      engineSize: mapEngineSize(displacementL),
      engineType: getEngineType(cylinders, engineConfig),
      cylinders: cylinders || undefined,
      fuelType: fuelTypePrimary ? FUEL_TYPE_MAP[fuelTypePrimary] || undefined : undefined,
      transmission: transmissionStyle ? TRANSMISSION_MAP[transmissionStyle] || undefined : undefined,
      driveType: driveType || undefined,
      horsepower: horsepower || undefined,
      vehicleType: vehicleType || undefined,
      plantCountry: plantCountry || undefined,
      plantCity: plantCity || undefined,
      manufacturer: manufacturer || undefined,
      series: series || undefined,
    };
    
    return { success: true, data: decoded };
    
  } catch (error) {
    console.error('VIN decode error:', error);
    return { success: false, error: 'Failed to decode VIN. Please try again.' };
  }
}

/**
 * Validate VIN format without decoding
 */
export function isValidVINFormat(vin: string): boolean {
  const cleanVIN = vin.trim().toUpperCase();
  return cleanVIN.length === 17 && !/[IOQ]/i.test(cleanVIN);
}

/**
 * Format VIN for display (uppercase, trimmed)
 */
export function formatVIN(vin: string): string {
  return vin.trim().toUpperCase();
}

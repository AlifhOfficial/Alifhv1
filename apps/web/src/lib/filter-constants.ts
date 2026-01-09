/**
 * Filter Constants - Client-Side Static Data
 * 
 * All static data for search filters. This eliminates the need for
 * runtime API calls for facet options that never change.
 * 
 * Source of truth: @alifh/database listing-constants.ts
 * 
 * @module lib/filter-constants
 */

// ============================================================================
// UAE POPULAR MAKES - Show these first in dropdowns for better UX
// ============================================================================

export const UAE_POPULAR_MAKES = [
  'Toyota',
  'Nissan', 
  'Honda',
  'Hyundai',
  'Mitsubishi',
  'Ford',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Land Rover',
  'Lexus',
  'Jetour',
  'BYD',
] as const;

// ============================================================================
// CAR MAKES - Sorted alphabetically
// ============================================================================

export const CAR_MAKES = [
  'Acura', 'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi',
  'Bajaj', 'Bentley', 'BMW', 'Bugatti', 'Buick', 'BYD',
  'Cadillac', 'Caterham', 'Changan', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
  'Dacia', 'Datsun', 'Denza', 'Dodge',
  'Ferrari', 'Fiat', 'Fisker', 'Ford',
  'GAC', 'Geely', 'Genesis', 'GMC', 'Great Wall',
  'Haval', 'Honda', 'Hyundai',
  'Infiniti', 'Isuzu',
  'JAC', 'Jaguar', 'Jeep', 'Jetour',
  'Kia', 'Koenigsegg',
  'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Li Auto', 'Lifan', 'Lincoln', 'Lotus', 'Lucid', 'Lynk & Co',
  'Mahindra', 'Maruti Suzuki', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'Morgan',
  'Nio', 'Nissan',
  'Opel',
  'Pagani', 'Peugeot', 'Polestar', 'Porsche',
  'Ram', 'Renault', 'Rivian', 'Rolls-Royce',
  'Seat', 'Skoda', 'Subaru', 'Suzuki',
  'Tata', 'Tesla', 'Toyota',
  'Vauxhall', 'Volkswagen', 'Volvo',
  'Xpeng',
] as const;

/**
 * Get makes sorted with popular UAE makes first
 * Useful for dropdowns where you want common choices at the top
 */
export function getMakesSortedByPopularity(): string[] {
  const popularSet = new Set<string>(UAE_POPULAR_MAKES);
  const otherMakes = CAR_MAKES.filter(make => !popularSet.has(make));
  return [...UAE_POPULAR_MAKES, '---', ...otherMakes];
}

// ============================================================================
// CAR MODELS BY MAKE
// ============================================================================

export const CAR_MODELS: Record<string, readonly string[]> = {
  'Acura': ['ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'RLX', 'TLX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', '4C', 'Giulietta'],
  'Alpine': ['A110', 'A290'],
  'Aston Martin': ['DB11', 'DB12', 'DBS', 'DBX', 'Vantage', 'Valkyrie'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'TT', 'e-tron', 'e-tron GT'],
  'Bentley': ['Bentayga', 'Continental GT', 'Flying Spur'],
  'BMW': ['1-Series', '2-Series', '3-Series', '4-Series', '5-Series', '6-Series', '7-Series', '8-Series', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'iX1', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4'],
  'Bugatti': ['Chiron', 'Divo', 'Veyron'],
  'BYD': ['Atto 3', 'Dolphin', 'Han', 'Seal', 'Song Plus', 'Tang', 'Yuan Plus'],
  'Cadillac': ['CT4', 'CT5', 'Escalade', 'Lyriq', 'XT4', 'XT5', 'XT6'],
  'Changan': ['CS35', 'CS55', 'CS75', 'CS85', 'CS95', 'Eado', 'UNI-K', 'UNI-T', 'UNI-V'],
  'Chery': ['Arrizo 5', 'Arrizo 6', 'Arrizo 8', 'Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8'],
  'Chevrolet': ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Malibu', 'Silverado', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Citroën': ['Berlingo', 'C3', 'C4', 'C5 Aircross', 'C5 X'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Hornet', 'Ram'],
  'Ferrari': ['296 GTB', '296 GTS', '488', '812', 'F8', 'Portofino', 'Purosangue', 'Roma', 'SF90'],
  'Fiat': ['500', '500X', 'Panda', 'Tipo'],
  'Ford': ['Bronco', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Fiesta', 'Focus', 'Fusion', 'Kuga', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Raptor', 'Territory', 'Transit'],
  'GAC': ['Aion LX', 'Aion S', 'Aion V', 'Aion Y', 'Empow', 'GS3', 'GS4', 'GS8'],
  'Geely': ['Azkarra', 'Coolray', 'Emgrand', 'Geometry C', 'Monjaro', 'Okavango', 'Preface', 'Tugella'],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  'GMC': ['Acadia', 'Canyon', 'Hummer EV', 'Sierra', 'Terrain', 'Yukon'],
  'Great Wall': ['Cannon', 'Haval Jolion', 'Poer', 'Tank 300', 'Tank 500', 'Wingle'],
  'Haval': ['Dargo', 'H6', 'H9', 'Jolion'],
  'Honda': ['Accord', 'BR-V', 'City', 'Civic', 'CR-V', 'CR-Z', 'HR-V', 'Jazz', 'Mobilio', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai': ['Accent', 'Creta', 'Elantra', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Staria', 'Tucson', 'Veloster', 'Venue'],
  'Infiniti': ['EX35', 'FX35', 'FX45', 'Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Isuzu': ['D-Max', 'MU-X'],
  'JAC': ['JS2', 'JS3', 'JS4', 'T6', 'T8'],
  'Jaguar': ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF', 'XJ'],
  'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Wagoneer', 'Renegade', 'Wagoneer', 'Wrangler'],
  'Jetour': ['Dashing', 'T2', 'X70', 'X90'],
  'Kia': ['Carnival', 'Cerato', 'EV6', 'EV9', 'K5', 'K8', 'Niro', 'Picanto', 'Rio', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Koenigsegg': ['Agera', 'Gemera', 'Jesko', 'Regera'],
  'Lamborghini': ['Aventador', 'Huracan', 'Revuelto', 'Urus'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  'Lexus': ['ES', 'GS', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'TX', 'UX'],
  'Li Auto': ['L7', 'L8', 'L9', 'Mega'],
  'Lincoln': ['Aviator', 'Corsair', 'Navigator', 'Nautilus'],
  'Lotus': ['Eletre', 'Emira', 'Evija'],
  'Lucid': ['Air'],
  'Maserati': ['Ghibli', 'GranCabrio', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-9', 'CX-90', 'MX-30', 'MX-5'],
  'McLaren': ['540C', '570S', '600LT', '620R', '650S', '720S', '750S', 'Artura', 'GT', 'P1', 'Senna'],
  'Mercedes-Benz': ['A-Class', 'AMG GT', 'B-Class', 'C-Class', 'CLA', 'CLE', 'CLS', 'E-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Maybach', 'S-Class', 'SL', 'Sprinter', 'V-Class', 'Vito'],
  'MG': ['4', '5', 'Cyberster', 'HS', 'RX5', 'ZS', 'ZS EV'],
  'Mini': ['Clubman', 'Convertible', 'Cooper', 'Countryman', 'Hardtop'],
  'Mitsubishi': ['ASX', 'Eclipse Cross', 'L200', 'Lancer', 'Montero', 'Outlander', 'Pajero', 'Xpander'],
  'Nio': ['EC6', 'ES6', 'ES7', 'ES8', 'ET5', 'ET7'],
  'Nissan': ['370Z', 'Altima', 'Armada', 'Juke', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Navara', 'Pathfinder', 'Patrol', 'Qashqai', 'Rogue', 'Sentra', 'Sunny', 'Titan', 'Versa', 'X-Trail', 'Z'],
  'Pagani': ['Huayra', 'Utopia'],
  'Peugeot': ['2008', '208', '3008', '308', '408', '5008', '508', 'Partner', 'Rifter'],
  'Polestar': ['1', '2', '3', '4'],
  'Porsche': ['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Ram': ['1500', '2500', '3500', 'ProMaster'],
  'Renault': ['Arkana', 'Captur', 'Clio', 'Duster', 'Kadjar', 'Koleos', 'Megane', 'Talisman', 'Triber'],
  'Rivian': ['R1S', 'R1T'],
  'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Spectre', 'Wraith'],
  'Seat': ['Arona', 'Ateca', 'Ibiza', 'Leon', 'Tarraco'],
  'Skoda': ['Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Scala', 'Superb'],
  'Subaru': ['BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX'],
  'Suzuki': ['Alto', 'Baleno', 'Celerio', 'Ciaz', 'Dzire', 'Ertiga', 'Grand Vitara', 'Ignis', 'Jimny', 'S-Cross', 'Swift', 'Vitara', 'XL7'],
  'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y'],
  'Toyota': ['4Runner', 'Avalon', 'bZ4X', 'C-HR', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'Fortuner', 'GR Supra', 'GR Yaris', 'GR86', 'Granvia', 'Hiace', 'Highlander', 'Hilux', 'Land Cruiser', 'Land Cruiser 300', 'Land Cruiser 70', 'Land Cruiser Prado', 'Prius', 'RAV4', 'Rush', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza', 'Vios', 'Yaris', 'Yaris Cross'],
  'Volkswagen': ['Arteon', 'Atlas', 'Beetle', 'Golf', 'ID.3', 'ID.4', 'ID.5', 'ID.Buzz', 'Jetta', 'Passat', 'Polo', 'T-Cross', 'T-Roc', 'Taos', 'Teramont', 'Tiguan', 'Touareg', 'Transporter'],
  'Volvo': ['C40', 'EX30', 'EX90', 'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  'Xpeng': ['G3', 'G6', 'G9', 'P5', 'P7', 'X9'],
} as const;

// ============================================================================
// BODY TYPES
// ============================================================================

export const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'pickup', label: 'Pickup Truck' },
  { value: 'van', label: 'Van' },
  { value: 'sports', label: 'Sports Car' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================================================
// FUEL TYPES
// ============================================================================

export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plugin_hybrid', label: 'Plug-in Hybrid' },
  { value: 'hydrogen', label: 'Hydrogen' },
] as const;

// ============================================================================
// TRANSMISSION TYPES
// ============================================================================

export const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
  { value: 'dct', label: 'Dual Clutch (DCT)' },
  { value: 'semi_automatic', label: 'Semi-Automatic' },
] as const;

// ============================================================================
// ENGINE SIZES
// ============================================================================

export const ENGINE_SIZES = [
  { value: 'under_1.5L', label: 'Under 1.5L' },
  { value: '1.5L_2.0L', label: '1.5L - 2.0L' },
  { value: '2.0L_2.5L', label: '2.0L - 2.5L' },
  { value: '2.5L_3.0L', label: '2.5L - 3.0L' },
  { value: '3.0L_4.0L', label: '3.0L - 4.0L' },
  { value: '4.0L_5.0L', label: '4.0L - 5.0L' },
  { value: '5.0L_6.0L', label: '5.0L - 6.0L' },
  { value: 'over_6.0L', label: 'Over 6.0L' },
  { value: 'electric', label: 'Electric' },
] as const;

// ============================================================================
// REGIONAL SPECS
// ============================================================================

export const SPECS_TYPES = [
  { value: 'gcc', label: 'GCC Specs' },
  { value: 'american', label: 'American Specs' },
  { value: 'european', label: 'European Specs' },
  { value: 'japanese', label: 'Japanese Specs' },
  { value: 'chinese', label: 'Chinese Specs' },
  { value: 'korean', label: 'Korean Specs' },
  { value: 'canadian', label: 'Canadian Specs' },
  { value: 'other', label: 'Other' },
] as const;

// ============================================================================
// EXTERIOR COLORS
// ============================================================================

export const EXTERIOR_COLORS = [
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'silver', label: 'Silver', hex: '#C0C0C0' },
  { value: 'grey', label: 'Grey', hex: '#808080' },
  { value: 'blue', label: 'Blue', hex: '#0066CC' },
  { value: 'red', label: 'Red', hex: '#CC0000' },
  { value: 'green', label: 'Green', hex: '#228B22' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'gold', label: 'Gold', hex: '#FFD700' },
  { value: 'orange', label: 'Orange', hex: '#FF8C00' },
  { value: 'yellow', label: 'Yellow', hex: '#FFD700' },
  { value: 'purple', label: 'Purple', hex: '#800080' },
  { value: 'other', label: 'Other', hex: '#CCCCCC' },
] as const;

// ============================================================================
// INTERIOR COLORS
// ============================================================================

export const INTERIOR_COLORS = [
  { value: 'black', label: 'Black', hex: '#1A1A1A' },
  { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'tan', label: 'Tan', hex: '#D2B48C' },
  { value: 'grey', label: 'Grey', hex: '#808080' },
  { value: 'white', label: 'White', hex: '#F5F5F5' },
  { value: 'red', label: 'Red', hex: '#8B0000' },
  { value: 'burgundy', label: 'Burgundy', hex: '#800020' },
  { value: 'other', label: 'Other', hex: '#CCCCCC' },
] as const;

// ============================================================================
// UAE EMIRATES
// ============================================================================

export const UAE_EMIRATES = [
  { value: 'dubai', label: 'Dubai' },
  { value: 'abu_dhabi', label: 'Abu Dhabi' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
  { value: 'ras_al_khaimah', label: 'Ras Al Khaimah' },
  { value: 'fujairah', label: 'Fujairah' },
  { value: 'umm_al_quwain', label: 'Umm Al Quwain' },
] as const;

// ============================================================================
// YEAR RANGE - Dynamic based on current year
// ============================================================================

const currentYear = new Date().getFullYear();
export const MIN_YEAR = 1990;
export const MAX_YEAR = currentYear + 1; // Allow next year for new models

export const YEAR_OPTIONS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i
);

// ============================================================================
// PRICE RANGES (AED)
// ============================================================================

export const PRICE_RANGES = [
  { min: 0, max: 25000, label: 'Under 25K' },
  { min: 25000, max: 50000, label: '25K - 50K' },
  { min: 50000, max: 75000, label: '50K - 75K' },
  { min: 75000, max: 100000, label: '75K - 100K' },
  { min: 100000, max: 150000, label: '100K - 150K' },
  { min: 150000, max: 200000, label: '150K - 200K' },
  { min: 200000, max: 300000, label: '200K - 300K' },
  { min: 300000, max: 500000, label: '300K - 500K' },
  { min: 500000, max: 1000000, label: '500K - 1M' },
  { min: 1000000, max: null, label: 'Over 1M' },
] as const;

// ============================================================================
// MILEAGE RANGES (KM)
// ============================================================================

export const MILEAGE_RANGES = [
  { min: 0, max: 10000, label: 'Under 10K km' },
  { min: 0, max: 25000, label: 'Under 25K km' },
  { min: 0, max: 50000, label: 'Under 50K km' },
  { min: 0, max: 75000, label: 'Under 75K km' },
  { min: 0, max: 100000, label: 'Under 100K km' },
  { min: 0, max: 150000, label: 'Under 150K km' },
  { min: 0, max: 200000, label: 'Under 200K km' },
] as const;

// ============================================================================
// SELLER TYPES
// ============================================================================

export const SELLER_TYPES = [
  { value: 'all', label: 'All Sellers' },
  { value: 'dealer', label: 'Dealers Only' },
  { value: 'private', label: 'Private Sellers' },
] as const;

// ============================================================================
// CONDITION
// ============================================================================

export const CONDITIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'Brand New' },
  { value: 'used', label: 'Used' },
] as const;

// ============================================================================
// POPULAR MAKES - Curated for quick filters
// ============================================================================

export const POPULAR_MAKES = [
  'Toyota',
  'Mercedes-Benz',
  'BMW',
  'Nissan',
  'Land Rover',
  'Porsche',
  'Lexus',
  'Ford',
  'Chevrolet',
  'Audi',
  'Honda',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'Jeep',
] as const;

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
  { value: 'mileage_low', label: 'Mileage: Low to High' },
] as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BodyType = (typeof BODY_TYPES)[number]['value'];
export type FuelType = (typeof FUEL_TYPES)[number]['value'];
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number]['value'];
export type EngineSize = (typeof ENGINE_SIZES)[number]['value'];
export type SpecsType = (typeof SPECS_TYPES)[number]['value'];
export type ExteriorColor = (typeof EXTERIOR_COLORS)[number]['value'];
export type InteriorColor = (typeof INTERIOR_COLORS)[number]['value'];
export type UAEEmirate = (typeof UAE_EMIRATES)[number]['value'];
export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get models for a specific make */
export function getModelsForMake(make: string): readonly string[] {
  return CAR_MODELS[make] ?? [];
}

/** Get color hex value */
export function getColorHex(color: ExteriorColor | InteriorColor, type: 'exterior' | 'interior' = 'exterior'): string {
  const colors = type === 'exterior' ? EXTERIOR_COLORS : INTERIOR_COLORS;
  return colors.find(c => c.value === color)?.hex ?? '#CCCCCC';
}

/** Get label for a value from an options array */
export function getLabel<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): string {
  return options.find(o => o.value === value)?.label ?? value;
}

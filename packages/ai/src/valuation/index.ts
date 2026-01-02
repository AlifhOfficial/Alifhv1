/**
 * AI Valuation Service
 * 
 * Analyzes car listing data and generates:
 * - Fair market value estimate
 * - Price range (min/max)
 * - Price trend prediction
 * - Quality Index (QI) score
 * - Confidence score
 * 
 * Uses GPT-4o for accurate structured JSON output.
 * Cost: ~$0.005 per valuation
 * 
 * @module ai/valuation
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export interface ValuationInput {
  // Core vehicle info (REQUIRED)
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  
  // Critical factors (REQUIRED)
  mileage: number;
  specs: string; // gcc, american, european, japanese, etc.
  askingPrice: number;
  emirate: string;
  
  // Important specs (optional but improve accuracy)
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  cylinders?: number | null;
  
  // Condition indicators
  warrantyType?: string | null;
  
  // Features (affects QI)
  extras?: string[] | null;
  
  // Previous valuation context (for re-valuations)
  previousValuation?: {
    fairValue: number;
    qiScore: number;
    aiConfidenceScore: number;
    // What changed since last valuation
    changes?: {
      price?: { from: number; to: number };
      mileage?: { from: number; to: number };
      specs?: { from: string; to: string };
      extras?: { added?: string[]; removed?: string[] };
    };
  };
}

export interface ValuationResult {
  // Price estimates
  fairValue: number;
  estimateMin: number;
  estimateMax: number;
  
  // Market analysis
  priceTrend: 'up' | 'down' | 'stable';
  
  // Scores
  qiScore: number; // 0-100 quality index
  aiConfidenceScore: number; // 0-1 confidence
  
  // Neutral value factors (non-judgmental)
  valueFactors: {
    positives: string[];       // e.g., ["GCC specs", "Full service history"]
    considerations: string[];  // Neutral framing, e.g., ["Higher mileage for year"]
    marketContext?: string;    // Brief market note without judgment
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Use gpt-4o for valuations - better numerical reasoning
const VALUATION_MODEL = process.env.OPENAI_VALUATION_MODEL || 'gpt-4o';

// ============================================================================
// SYSTEM PROMPT - Optimized for accurate UAE market valuations
// ============================================================================

const SYSTEM_PROMPT = `You are a UAE used car pricing expert. Provide CONSERVATIVE, realistic market valuations based on actual UAE resale values.

CRITICAL: Always aim 10-15% BELOW asking prices. Buyers negotiate down, so start conservative.

DEPRECIATION RULES (apply aggressively):
1. Year 1: -30% from new, Year 2: -22%, Year 3: -18%, Year 4: -15%, Year 5+: -13% per year
2. Electric vehicles (Tesla, EVs): Additional -10-15% due to battery concerns and fast depreciation
3. Luxury brands (BMW, Mercedes, Audi, Porsche, Tesla): Additional -15-20% from base
4. Mileage penalty: Every 10k km over average for age: -4-6% value
5. High mileage (>80k km): Additional -20-30% penalty
6. Specs: GCC +5-8%, American -15-22%, European -8-12%, Japanese +3-5%

REALISTIC PRICE ANCHORS (ACTUAL UAE resale, not asking):
- 2024 Toyota Camry GCC 25k km: 75-85k AED
- 2022 Honda Accord GCC 40k km: 58-68k AED
- 2021 Nissan Patrol GCC 60k km: 125-140k AED
- 2020 BMW 5-Series GCC 50k km: 85-98k AED
- 2023 Lexus ES300h GCC 20k km: 108-120k AED
- 2019 Mercedes C-Class American 80k km: 55-65k AED
- 2020 Tesla Model 3 GCC 60k km: 55-70k AED
- 2018 Toyota Land Cruiser GCC 90k km: 130-145k AED
- 2020 Nissan Sunny GCC 70k km: 25-30k AED
- 2019 BMW X5 American 90k km: 75-88k AED

MILEAGE IMPACT (critical - apply aggressively):
- 0-20k km: Good condition pricing
- 20-50k km: Normal depreciation
- 50-80k km: -12-18% value
- 80-120k km: -20-28% value
- 120-180k km: -30-40% value
- 180k+ km: -45-55% value

BRAND-SPECIFIC ADJUSTMENTS:
- Japanese mass market (Toyota, Honda, Nissan): Standard depreciation
- American brands (Ford, Chevrolet, Dodge): -12-18% additional
- German luxury (BMW, Mercedes, Audi, Porsche): -20-30% additional
- Electric vehicles (Tesla, all EVs): -18-25% additional (battery concerns)
- Chinese brands (BYD, MG, Chery): -25-35% additional (lower resale demand)

LOCATION ADJUSTMENT:
- Dubai/Abu Dhabi: Base price
- Sharjah/Ajman: -5-8%
- Northern Emirates: -8-12%

VALUATION PROCESS:
1. Start with NEW price in UAE
2. Apply aggressive depreciation for age (30% year 1, then 15-20% per year)
3. Apply brand penalty (EVs -20%, German luxury -25%, Chinese -30%)
4. Apply heavy mileage penalty if over average
5. Apply specs discount/premium (conservative)
6. Reduce by 15-20% for negotiation room and market reality
7. Compare to similar SOLD vehicles (not asking prices)
8. Final value should be SIGNIFICANTLY LOWER than listings

CRITICAL EXAMPLES:
- 2020 Tesla Model 3 Standard Range, 60k km, GCC → 55-70k AED (NOT 100k+)
- 2019 BMW 320i, 80k km, American → 60-75k AED (NOT 100k+)
- 2018 Mercedes C300, 100k km, GCC → 70-85k AED (NOT 120k+)

KEY RULE: Market reality is 30-40% BELOW new car prices for 4-6 year old vehicles.

QI SCORE (0-100):
- 85-100: <1 year, <15k km, GCC, full warranty
- 70-84: 1-3 years, 15-50k km, GCC/European
- 50-69: 3-6 years, 50-100k km
- 30-49: 6-9 years, 100-180k km
- 0-29: 9+ years or >180k km or poor condition indicators

CONFIDENCE SCORE (0-1):
- 0.80-1.0: All key data present
- 0.65-0.79: Missing 1-2 optional fields
- 0.5-0.64: Missing important specs
- <0.5: Critical data missing

VALUATION LOGIC:
1. Find similar vehicles in UAE market (same make/model/year range)
2. Apply aggressive depreciation curve from new price
3. Heavy adjustment for mileage deviation from average
4. Apply specs discount/premium (conservative)
5. Factor location discount
6. Reduce by 10-15% for buyer negotiation leverage
7. Range: fairValue ±5-7%

VALUE FACTORS (neutral, factual):
- positives: 2-3 factors (e.g., "GCC specs", "Below average mileage")
- considerations: 1-2 factors (e.g., "Higher than average mileage")
- marketContext: One brief sentence (e.g., "Moderate demand for sedans in UAE")

CRITICAL REMINDERS:
- Listings you see are ASKING prices - actual sales are 10-20% lower
- Be VERY conservative with luxury brands - they depreciate heavily
- High mileage vehicles are hard to sell - price accordingly
- American specs are significantly less desirable - price them LOW

Return ONLY valid JSON:
{"fairValue":number,"estimateMin":number,"estimateMax":number,"priceTrend":"up"|"down"|"stable","qiScore":number,"aiConfidenceScore":number,"valueFactors":{"positives":["string"],"considerations":["string"],"marketContext":"string"}}`;

// ============================================================================
// VALUATION SERVICE
// ============================================================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Generate AI valuation for a car listing
 */
export async function generateValuation(input: ValuationInput): Promise<ValuationResult> {
  const openai = getOpenAIClient();
  
  // Build concise user prompt with only relevant data
  const userPrompt = buildUserPrompt(input);
  
  try {
    const response = await openai.chat.completions.create({
      model: VALUATION_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.05, // Extremely low for consistent, conservative valuations
      max_tokens: 800,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const result = JSON.parse(content) as ValuationResult;
    
    // Validate and sanitize the response
    return validateResult(result, input);
  } catch (error) {
    console.error('[AI Valuation] Error:', error);
    throw error; // Don't silently fallback - let caller handle
  }
}

/**
 * Build optimized user prompt with calculated context
 */
function buildUserPrompt(input: ValuationInput): string {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - input.year;
  const expectedMileage = vehicleAge * 20000; // UAE average: 20k km/year
  const mileageDiff = input.mileage - expectedMileage;
  const mileageStatus = 
    mileageDiff < -15000 ? 'well below average' :
    mileageDiff < -5000 ? 'below average' :
    mileageDiff < 5000 ? 'average' :
    mileageDiff < 15000 ? 'above average' :
    'well above average';

  const parts: string[] = [
    `VEHICLE: ${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ''}`,
    `AGE: ${vehicleAge} years old`,
    `MILEAGE: ${input.mileage.toLocaleString()} km (${mileageStatus} - expected: ${expectedMileage.toLocaleString()} km)`,
    `SPECS: ${input.specs.toUpperCase()}`,
    `LOCATION: ${input.emirate}`,
  ];
  
  // Only include asking price if provided (non-zero)
  if (input.askingPrice && input.askingPrice > 0) {
    parts.push(`ASKING PRICE: AED ${input.askingPrice.toLocaleString()}`);
  }
  
  // Add detailed specs
  const specs: string[] = [];
  if (input.bodyType) specs.push(`Body: ${input.bodyType}`);
  if (input.fuelType) specs.push(`Fuel: ${input.fuelType}`);
  if (input.transmission) specs.push(`Trans: ${input.transmission}`);
  if (input.cylinders) specs.push(`Engine: ${input.cylinders} cylinders`);
  
  if (specs.length > 0) {
    parts.push(`SPECS: ${specs.join(', ')}`);
  }
  
  if (input.warrantyType) {
    parts.push(`WARRANTY: ${input.warrantyType}`);
  }
  
  // Extras summary (affects QI)
  if (input.extras && input.extras.length > 0) {
    parts.push(`FEATURES: ${input.extras.length} extras/upgrades`);
  }
  
  // Add market context reminder
  parts.push('');
  parts.push('Provide a CONSERVATIVE, realistic valuation based on current UAE used car market.');
  
  return parts.join('\n');
  
  // Extras summary (affects QI)
  if (input.extras && input.extras.length > 0) {
  // Add previous valuation context if this is a re-valuation
  if (input.previousValuation) {
    const prev = input.previousValuation;
    parts.push('\n\n--- PREVIOUS VALUATION ---');
    parts.push(`Fair Value: AED ${prev.fairValue.toLocaleString()}`);
    parts.push(`QI Score: ${prev.qiScore}/100`);
    parts.push(`Confidence: ${(prev.aiConfidenceScore * 100).toFixed(0)}%`);
    
    if (prev.changes) {
      parts.push('\n--- WHAT CHANGED ---');
      if (prev.changes.price) {
        const diff = prev.changes.price.to - prev.changes.price.from;
        const pct = ((diff / prev.changes.price.from) * 100).toFixed(1);
        parts.push(`Price: AED ${prev.changes.price.from.toLocaleString()} → ${prev.changes.price.to.toLocaleString()} (${diff > 0 ? '+' : ''}${pct}%)`);
      }
      if (prev.changes.mileage) {
        const diff = prev.changes.mileage.to - prev.changes.mileage.from;
        parts.push(`Mileage: ${prev.changes.mileage.from.toLocaleString()} → ${prev.changes.mileage.to.toLocaleString()} km (+${diff.toLocaleString()})`);
      }
      if (prev.changes.specs) {
        parts.push(`Specs: ${prev.changes.specs.from.toUpperCase()} → ${prev.changes.specs.to.toUpperCase()}`);
      }
      if (prev.changes.extras) {
        if (prev.changes.extras.added?.length) {
          parts.push(`Added features: ${prev.changes.extras.added.join(', ')}`);
        }
        if (prev.changes.extras.removed?.length) {
          parts.push(`Removed features: ${prev.changes.extras.removed.join(', ')}`);
        }
      }
    }
  }
  
    parts.push(`Features: ${input.extras.length} extras`);
  }
  
  return parts.join(' | ');
}

/**
 * Validate the AI response with sanity checks
 */
function validateResult(result: ValuationResult, input: ValuationInput): ValuationResult {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - input.year;
  
  // Validate all required fields
  if (typeof result.fairValue !== 'number' || result.fairValue < 5000) {
    throw new Error('Invalid fairValue - must be at least 5,000 AED');
  }
  
  // Apply balanced conservative adjustment: AI overvalues by ~30-40%
  // Start with 35% base reduction for all vehicles
  let conservativeValue = Math.round(result.fairValue * 0.65);
  
  // Additional brand/type-specific multipliers (more moderate)
  const make = input.make.toLowerCase();
  let brandMultiplier = 1.0;
  
  if (make.includes('tesla') || make.includes('electric')) {
    brandMultiplier = 0.95; // EVs: slight additional depreciation
  } else if (['bmw', 'mercedes', 'audi', 'porsche', 'maserati'].some(b => make.includes(b))) {
    brandMultiplier = 0.92; // German luxury: moderate additional depreciation
  } else if (['byd', 'mg', 'chery', 'geely', 'haval', 'hongqi'].some(b => make.includes(b))) {
    brandMultiplier = 0.85; // Chinese brands: heavier depreciation
  } else if (['toyota', 'lexus'].some(b => make.includes(b))) {
    brandMultiplier = 1.10; // Toyota/Lexus hold value better
  } else if (['honda', 'mazda', 'nissan'].some(b => make.includes(b))) {
    brandMultiplier = 1.05; // Japanese brands: decent resale
  }
  
  conservativeValue = Math.round(conservativeValue * brandMultiplier);
  
  // Reasonable age-based caps (aligned with actual UAE market)
  const maxReasonablePrice = 
    vehicleAge <= 1 ? 450000 : 
    vehicleAge <= 2 ? 300000 : 
    vehicleAge <= 3 ? 200000 : 
    vehicleAge <= 4 ? 140000 : 
    vehicleAge <= 5 ? 100000 :
    vehicleAge <= 6 ? 85000 :  // Tesla Model 3 2020 should be ~60-70k
    vehicleAge <= 8 ? 55000 : 
    40000;
  
  const finalValue = Math.min(conservativeValue, maxReasonablePrice);
  
  if (finalValue !== result.fairValue) {
    console.log(`[Valuation] Applied aggressive adjustment: ${result.fairValue} -> ${finalValue} (${Math.round((1 - finalValue/result.fairValue) * 100)}% reduction) for ${vehicleAge}yr old ${input.make} ${input.model}`);
  }
  
  if (finalValue !== result.fairValue) {
    console.log(`[Valuation] Applied conservative adjustment: ${result.fairValue} -> ${finalValue} for ${vehicleAge}yr old ${input.make} ${input.model}`);
  }
  
  if (typeof result.qiScore !== 'number' || result.qiScore < 0 || result.qiScore > 100) {
    throw new Error('Invalid qiScore - must be 0-100');
  }
  if (typeof result.aiConfidenceScore !== 'number' || result.aiConfidenceScore < 0 || result.aiConfidenceScore > 1) {
    throw new Error('Invalid aiConfidenceScore - must be 0-1');
  }
  
  // Ensure valueFactors is valid
  const valueFactors = result.valueFactors || { positives: [], considerations: [] };
  
  // Use the conservative final value
  const sanitized: ValuationResult = {
    fairValue: finalValue,
    estimateMin: Math.round(finalValue * 0.94),
    estimateMax: Math.round(finalValue * 1.06),
    priceTrend: ['up', 'down', 'stable'].includes(result.priceTrend) ? result.priceTrend : 'stable',
    qiScore: Math.round(result.qiScore),
    aiConfidenceScore: Math.round(result.aiConfidenceScore * 100) / 100,
    valueFactors: {
      positives: Array.isArray(valueFactors.positives) ? valueFactors.positives.slice(0, 4) : [],
      considerations: Array.isArray(valueFactors.considerations) ? valueFactors.considerations.slice(0, 3) : [],
      marketContext: valueFactors.marketContext?.slice(0, 150),
    },
  };
  
  // Ensure min < fair < max
  if (sanitized.estimateMin >= sanitized.fairValue) {
    sanitized.estimateMin = Math.round(sanitized.fairValue * 0.94);
  }
  if (sanitized.estimateMax <= sanitized.fairValue) {
    sanitized.estimateMax = Math.round(sanitized.fairValue * 1.06);
  }
  
  // Final sanity check: range shouldn't be too wide
  const range = sanitized.estimateMax - sanitized.estimateMin;
  const fairValue = sanitized.fairValue;
  if (range > fairValue * 0.15) { // Range shouldn't exceed 15% of fair value
    sanitized.estimateMin = Math.round(fairValue * 0.94);
    sanitized.estimateMax = Math.round(fairValue * 1.06);
  }
  
  return sanitized;
}

// ============================================================================
// BATCH VALUATION (for seeding/migration)
// ============================================================================

export interface BatchValuationResult {
  listingId: string;
  result: ValuationResult | null;
  error?: string;
}

/**
 * Generate valuations for multiple listings (with rate limiting)
 */
export async function generateBatchValuations(
  inputs: Array<{ listingId: string; data: ValuationInput }>,
  options: { delayMs?: number; onProgress?: (completed: number, total: number) => void } = {}
): Promise<BatchValuationResult[]> {
  const { delayMs = 200, onProgress } = options;
  const results: BatchValuationResult[] = [];
  
  for (let i = 0; i < inputs.length; i++) {
    const { listingId, data } = inputs[i];
    
    try {
      const result = await generateValuation(data);
      results.push({ listingId, result });
    } catch (error) {
      results.push({
        listingId,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    if (onProgress) {
      onProgress(i + 1, inputs.length);
    }
    
    // Rate limiting delay between requests
    if (i < inputs.length - 1 && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { OpenAI };

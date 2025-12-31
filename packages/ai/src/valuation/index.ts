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
  
  // Analysis details
  pricePosition: 'below' | 'fair' | 'above';
  reasoning?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Use gpt-4o for valuations - better numerical reasoning
const VALUATION_MODEL = process.env.OPENAI_VALUATION_MODEL || 'gpt-4o';

// ============================================================================
// SYSTEM PROMPT - Concise and focused
// ============================================================================

const SYSTEM_PROMPT = `You are a UAE car valuation expert. Analyze listings and return JSON.

MARKET CONTEXT:
- GCC specs: +10-15% value (local warranty)
- American specs: -5-10% (needs conversion)
- Mileage: Critical factor, UAE avg 20k km/year
- Toyota/Lexus hold value best
- German luxury depreciates 15-20%/year
- Dubai/Abu Dhabi prices 5-10% higher

QI SCORE (0-100) - Rate the listing quality:
- 90-100: Premium spec, low mileage, warranty, loaded features
- 70-89: Good spec, reasonable mileage, well-equipped
- 50-69: Average, standard features
- 30-49: Basic spec, high mileage, few features
- 0-29: Poor condition indicators

CONFIDENCE SCORE (0-1) - Based on data provided:
- 0.9-1.0: All critical data present (make/model/year/mileage/specs)
- 0.7-0.89: Missing 1-2 optional fields
- 0.5-0.69: Missing important specs
- Below 0.5: Insufficient data

REASONING (150-200 words): Provide a detailed analysis covering:
1. VALUE ASSESSMENT: How the asking price compares to market value and why
2. KEY FACTORS: Major positives and negatives affecting value (mileage, specs, age, brand reputation)
3. MARKET CONTEXT: Current demand for this make/model in UAE, depreciation trends
4. RECOMMENDATION: Whether this is a good buy, fair deal, or overpriced

FOR RE-VALUATIONS: If previous valuation data is provided, mention what changed and how it affects value.
Example: "Price increased from AED 85k to 90k (+6%), which now exceeds market value by 8%"

Write in clear, professional language suitable for car buyers.

Return ONLY valid JSON:
{"fairValue":number,"estimateMin":number,"estimateMax":number,"priceTrend":"up"|"down"|"stable","qiScore":number,"aiConfidenceScore":number,"pricePosition":"below"|"fair"|"above","reasoning":"string"}`;

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
      temperature: 0.2, // Very low for consistent valuations
      max_tokens: 600, // Increased for detailed reasoning
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
 * Build concise user prompt with only relevant data
 */
function buildUserPrompt(input: ValuationInput): string {
  const parts: string[] = [
    `${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ''}`,
    `Mileage: ${input.mileage.toLocaleString()} km`,
    `Specs: ${input.specs.toUpperCase()}`,
    `Asking: AED ${input.askingPrice.toLocaleString()}`,
    `Location: ${input.emirate}`,
  ];
  
  // Add only specs that affect valuation
  if (input.bodyType) parts.push(`Body: ${input.bodyType}`);
  if (input.fuelType) parts.push(`Fuel: ${input.fuelType}`);
  if (input.transmission) parts.push(`Trans: ${input.transmission}`);
  if (input.cylinders) parts.push(`Cyl: ${input.cylinders}`);
  if (input.warrantyType) parts.push(`Warranty: ${input.warrantyType}`);
  
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
 * Validate the AI response
 */
function validateResult(result: ValuationResult, input: ValuationInput): ValuationResult {
  // Validate all required fields
  if (typeof result.fairValue !== 'number' || result.fairValue < 5000) {
    throw new Error('Invalid fairValue');
  }
  if (typeof result.qiScore !== 'number' || result.qiScore < 0 || result.qiScore > 100) {
    throw new Error('Invalid qiScore');
  }
  if (typeof result.aiConfidenceScore !== 'number' || result.aiConfidenceScore < 0 || result.aiConfidenceScore > 1) {
    throw new Error('Invalid aiConfidenceScore');
  }
  
  // Ensure logical price range
  const sanitized: ValuationResult = {
    fairValue: Math.round(result.fairValue),
    estimateMin: Math.round(result.estimateMin || result.fairValue * 0.92),
    estimateMax: Math.round(result.estimateMax || result.fairValue * 1.08),
    priceTrend: ['up', 'down', 'stable'].includes(result.priceTrend) ? result.priceTrend : 'stable',
    qiScore: Math.round(result.qiScore),
    aiConfidenceScore: Math.round(result.aiConfidenceScore * 100) / 100,
    pricePosition: ['below', 'fair', 'above'].includes(result.pricePosition) ? result.pricePosition : 'fair',
    reasoning: result.reasoning?.slice(0, 1500), // Allow up to 1500 chars for detailed reasoning
  };
  
  // Ensure min < fair < max
  if (sanitized.estimateMin >= sanitized.fairValue) {
    sanitized.estimateMin = Math.round(sanitized.fairValue * 0.92);
  }
  if (sanitized.estimateMax <= sanitized.fairValue) {
    sanitized.estimateMax = Math.round(sanitized.fairValue * 1.08);
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

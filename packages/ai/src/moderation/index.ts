/**
 * AI Moderation Service
 * 
 * Automated content moderation for user-submitted car listings.
 * Performs sanity checks without image analysis to minimize costs.
 * 
 * Checks:
 * - Data consistency (year/make/model plausibility)
 * - Price reasonableness (not suspiciously low/high)
 * - Content safety (no spam, scams, inappropriate content)
 * - Completeness (minimum required fields)
 * 
 * Uses GPT-4o-mini for cost-effective moderation (~$0.00007/listing)
 * 
 * @module ai/moderation
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export interface ModerationInput {
  // Vehicle info
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  vin?: string | null;
  
  // Pricing
  price: number;
  isNegotiable?: boolean;
  
  // Specs
  mileage: number;
  specs: string;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  cylinders?: number | null;
  
  // Condition indicators
  warrantyType?: string | null;
  condition?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  
  // Content
  description?: string | null;
  
  // Location
  emirate: string;
  city?: string | null;
  
  // Media counts (don't analyze, just count)
  imageCount: number;
  hasVideo: boolean;
  
  // Features
  extras?: string[] | null;
  tags?: string[] | null;
  ownerRemarks?: string[] | null;
}

export type ModerationDecision = 'approve' | 'flag';

export interface ModerationFlag {
  code: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface ModerationResult {
  decision: ModerationDecision;
  confidence: number; // 0-1
  flags: ModerationFlag[];
  reasoning: string;
  
  // For logging/audit
  processingTimeMs: number;
  model: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Auto-approve threshold (if confidence >= this and no high-severity flags)
const AUTO_APPROVE_THRESHOLD = 0.85;

// System prompt for moderation
const MODERATION_SYSTEM_PROMPT = `You are a car listing moderation AI for a UAE automotive marketplace.

Your job is to quickly sanity-check user-submitted listings and decide:
- APPROVE: Listing looks legitimate and complete
- FLAG: Any concerns or issues - send to human review (humans will decide to reject)

APPROVE if:
- Vehicle info makes sense (year/make/model are plausible)
- Price is reasonable for the vehicle type
- Description is appropriate (if provided)
- No obvious red flags

FLAG if:
- Price seems unusually low or high for the vehicle
- Some data seems inconsistent
- Description has any issues (spam, contact info, inappropriate)
- Missing important optional info
- Any suspicious patterns or red flags
- Anything you're uncertain about

IMPORTANT: You cannot reject listings. Only humans can reject. When in doubt, FLAG for human review.

IMPORTANT GUIDELINES:
- This is UAE market - prices are in AED
- Luxury cars are common (high-end is normal here)
- Be lenient on minor issues - FLAG rather than REJECT when uncertain
- Don't reject just because description is missing or short
- At least 1 image is required, but don't analyze image content

Respond ONLY with valid JSON:
{
  "decision": "approve" | "flag",
  "confidence": 0.0-1.0,
  "flags": [
    { "code": "flag_code", "severity": "low|medium|high", "message": "explanation" }
  ],
  "reasoning": "brief explanation of decision"
}

Flag codes to use:
- price_too_low: Suspiciously cheap
- price_too_high: Unrealistically expensive
- data_inconsistent: Year/make/model don't match
- description_spam: Promotional/spam content
- description_contact: Contains contact info
- description_inappropriate: Inappropriate language
- missing_images: No images uploaded
- suspicious_pattern: General red flag`;

// ============================================================================
// MODERATION SERVICE
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
 * Run AI moderation on a car listing
 */
export async function moderateListing(input: ModerationInput): Promise<ModerationResult> {
  const startTime = Date.now();
  const openai = getOpenAIClient();
  
  // Build the moderation prompt
  const userPrompt = buildModerationPrompt(input);
  
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: MODERATION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Very low for consistent moderation
      max_tokens: 400,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    
    const result = JSON.parse(content);
    
    // Validate and sanitize
    const sanitized = validateModerationResult(result);
    
    return {
      ...sanitized,
      processingTimeMs: Date.now() - startTime,
      model: OPENAI_MODEL,
    };
  } catch (error) {
    console.error('[AI Moderation] Error:', error);
    
    // On error, flag for human review (safe fallback)
    return {
      decision: 'flag',
      confidence: 0,
      flags: [{
        code: 'ai_error',
        severity: 'medium',
        message: 'AI moderation failed - manual review required',
      }],
      reasoning: `AI moderation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      processingTimeMs: Date.now() - startTime,
      model: OPENAI_MODEL,
    };
  }
}

/**
 * Build the user prompt with listing data
 */
function buildModerationPrompt(input: ModerationInput): string {
  const lines = [
    `Review this car listing for moderation:`,
    ``,
    `== Vehicle ==`,
    `Make: ${input.make}`,
    `Model: ${input.model}`,
    `Year: ${input.year}`,
    input.trim ? `Trim: ${input.trim}` : null,
    input.vin ? `VIN: ${input.vin}` : null,
    ``,
    `== Pricing ==`,
    `Price: AED ${input.price.toLocaleString()}`,
    `Negotiable: ${input.isNegotiable ? 'Yes' : 'No'}`,
    ``,
    `== Specs ==`,
    `Mileage: ${input.mileage.toLocaleString()} km`,
    `Regional Specs: ${input.specs}`,
    input.bodyType ? `Body Type: ${input.bodyType}` : null,
    input.fuelType ? `Fuel Type: ${input.fuelType}` : null,
    input.transmission ? `Transmission: ${input.transmission}` : null,
    input.cylinders ? `Cylinders: ${input.cylinders}` : null,
    input.condition ? `Condition: ${input.condition}` : null,
    input.warrantyType ? `Warranty: ${input.warrantyType}` : null,
    input.exteriorColor ? `Exterior Color: ${input.exteriorColor}` : null,
    input.interiorColor ? `Interior Color: ${input.interiorColor}` : null,
    ``,
    `== Location ==`,
    `Emirate: ${input.emirate}`,
    input.city ? `City: ${input.city}` : null,
    ``,
    `== Media ==`,
    `Images: ${input.imageCount}`,
    `Video: ${input.hasVideo ? 'Yes' : 'No'}`,
  ].filter(Boolean);
  
  // Add description if present
  if (input.description && input.description.trim()) {
    lines.push(``, `== Description ==`, input.description.trim());
  }
  
  // Add owner remarks if present
  if (input.ownerRemarks && input.ownerRemarks.length > 0) {
    lines.push(``, `== Owner Notes ==`);
    input.ownerRemarks.forEach(remark => lines.push(`- ${remark}`));
  }
  
  // Add extras/features if present
  if (input.extras && input.extras.length > 0) {
    lines.push(``, `== Features ==`, input.extras.join(', '));
  }
  
  // Add tags/highlights if present
  if (input.tags && input.tags.length > 0) {
    lines.push(``, `== Highlights ==`, input.tags.join(', '));
  }
  
  return lines.join('\n');
}

/**
 * Validate and sanitize the AI response
 */
function validateModerationResult(result: any): Omit<ModerationResult, 'processingTimeMs' | 'model'> {
  // Validate decision - AI can only approve or flag, never reject
  const validDecisions: ModerationDecision[] = ['approve', 'flag'];
  // If AI tries to reject, convert to flag for human review
  const decision: ModerationDecision = validDecisions.includes(result.decision) 
    ? result.decision 
    : 'flag';
  
  // Validate confidence
  const confidence = typeof result.confidence === 'number'
    ? Math.min(1, Math.max(0, result.confidence))
    : 0.5;
  
  // Validate flags
  const flags: ModerationFlag[] = Array.isArray(result.flags)
    ? result.flags.map((f: any) => ({
        code: String(f.code || 'unknown'),
        severity: ['low', 'medium', 'high'].includes(f.severity) ? f.severity : 'medium',
        message: String(f.message || 'No details'),
      }))
    : [];
  
  // Get reasoning
  const reasoning = String(result.reasoning || 'No reasoning provided');
  
  return { decision, confidence, flags, reasoning };
}

/**
 * Determine if a listing should be auto-approved based on moderation result
 */
export function shouldAutoApprove(result: ModerationResult): boolean {
  // Must be "approve" decision
  if (result.decision !== 'approve') {
    return false;
  }
  
  // Must have high confidence
  if (result.confidence < AUTO_APPROVE_THRESHOLD) {
    return false;
  }
  
  // Must have no high-severity flags
  const hasHighSeverityFlag = result.flags.some(f => f.severity === 'high');
  if (hasHighSeverityFlag) {
    return false;
  }
  
  return true;
}

/**
 * Determine if a listing should be auto-rejected
 * @deprecated AI no longer has reject power - always returns false
 */
export function shouldAutoReject(_result: ModerationResult): boolean {
  // AI cannot auto-reject - only humans can reject listings
  return false;
}

// ============================================================================
// BATCH MODERATION (for migration/backfill)
// ============================================================================

export interface BatchModerationResult {
  listingId: string;
  result: ModerationResult | null;
  error?: string;
}

/**
 * Moderate multiple listings with rate limiting
 */
export async function moderateListingsBatch(
  inputs: Array<{ listingId: string; data: ModerationInput }>,
  options: { delayMs?: number; onProgress?: (completed: number, total: number) => void } = {}
): Promise<BatchModerationResult[]> {
  const { delayMs = 200, onProgress } = options;
  const results: BatchModerationResult[] = [];
  
  for (let i = 0; i < inputs.length; i++) {
    const { listingId, data } = inputs[i];
    
    try {
      const result = await moderateListing(data);
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
    
    // Rate limiting delay
    if (i < inputs.length - 1 && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

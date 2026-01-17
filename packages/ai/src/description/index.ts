/**
 * AI Description Generator Service
 * 
 * Generates compelling, concise car listing descriptions.
 * Uses GPT-4o-mini for cost-effective generation (~$0.00015/description)
 * 
 * Features:
 * - Concise, factual descriptions (max 600 chars)
 * - Highlights key selling points
 * - Professional tone without hype
 * - Supports regeneration with variation
 * 
 * @module ai/description
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export interface DescriptionInput {
  // Core vehicle info (REQUIRED)
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  
  // Key specs
  mileage?: number | null;
  specs?: string | null; // gcc, american, european, japanese, etc.
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineSize?: string | null;
  cylinders?: number | null;
  
  // Appearance
  exteriorColor?: string | null;
  interiorColor?: string | null;
  
  // Condition
  warrantyType?: string | null;
  condition?: 'new' | 'used' | null;
  
  // Pricing
  price?: number | null;
  isNegotiable?: boolean | null;
  
  // Location
  emirate?: string | null;
  
  // Features
  extras?: string[] | null;
  ownerRemarks?: string[] | null;
  
  // Regeneration context
  previousDescription?: string | null;
  regenerateReason?: 'different_angle' | 'more_detailed' | 'shorter' | null;
}

export interface DescriptionResult {
  description: string;
  characterCount: number;
  highlights: string[]; // Key points extracted
  processingTimeMs: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Use gpt-4o-mini - good balance of cost and accuracy (~$0.00015/description)
const DESCRIPTION_MODEL = process.env.OPENAI_DESCRIPTION_MODEL || 'gpt-4o-mini';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `Write a simple, clean car description. Like texting a friend about your car.

TONE: Calm, straightforward, no hype. Just describing what it is.

DO:
- State facts plainly
- Mention 2-3 notable features briefly
- Keep it short and readable
- Sound like a normal person

DON'T:
- Sell or persuade ("imagine yourself", "turn heads", "extraordinary")
- Use flowery language ("sleek", "beauty", "stunning")
- Over-describe ("cruising through Dubai")
- Sound like an ad or salesman
- Invent data not provided
- Use ALL CAPS or exclamation marks

LENGTH: 300-450 characters max. Less is more.

GOOD:
"2019 Hyundai Kona Ultimate, white with black interior. 20,000 km, GCC spec. Has massage seats, panoramic sunroof, heads-up display, and night vision. Based in Dubai, asking 43,000 AED - open to offers."

BAD:
"Imagine cruising in this stunning beauty that's sure to turn heads..."

Just describe the car. Nothing more.`;

// ============================================================================
// SERVICE
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

function buildUserPrompt(input: DescriptionInput): string {
  const lines: string[] = [];
  
  // Core info
  lines.push(`Vehicle: ${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ''}`);
  lines.push(`Condition: ${input.condition || 'used'}`);
  
  // Specs
  if (input.mileage !== undefined && input.mileage !== null) {
    lines.push(`Mileage: ${input.mileage.toLocaleString()} km`);
  }
  if (input.specs) {
    lines.push(`Specs origin: ${input.specs}`);
  }
  if (input.transmission) {
    lines.push(`Transmission: ${input.transmission}`);
  }
  if (input.fuelType) {
    lines.push(`Fuel type: ${input.fuelType}`);
  }
  if (input.engineSize) {
    lines.push(`Engine: ${input.engineSize}`);
  }
  if (input.cylinders) {
    lines.push(`Cylinders: ${input.cylinders}`);
  }
  if (input.bodyType) {
    lines.push(`Body type: ${input.bodyType}`);
  }
  
  // Appearance
  if (input.exteriorColor) {
    lines.push(`Exterior: ${input.exteriorColor}`);
  }
  if (input.interiorColor) {
    lines.push(`Interior: ${input.interiorColor}`);
  }
  
  // Condition & warranty
  if (input.warrantyType && input.warrantyType !== 'none') {
    lines.push(`Warranty: ${input.warrantyType}`);
  }
  
  // Pricing
  if (input.price) {
    lines.push(`Price: ${input.price.toLocaleString()} AED${input.isNegotiable ? ' (negotiable)' : ''}`);
  }
  
  // Location
  if (input.emirate) {
    lines.push(`Location: ${input.emirate}`);
  }
  
  // Extras
  if (input.extras && input.extras.length > 0) {
    lines.push(`Features: ${input.extras.slice(0, 8).join(', ')}`);
  }
  
  // Owner remarks
  if (input.ownerRemarks && input.ownerRemarks.length > 0) {
    lines.push(`Owner notes: ${input.ownerRemarks.join('; ')}`);
  }
  
  // Regeneration context
  if (input.previousDescription) {
    lines.push(`\n--- REGENERATION REQUEST ---`);
    lines.push(`Previous description (write something DIFFERENT):\n"${input.previousDescription}"`);
    if (input.regenerateReason) {
      const reasons: Record<string, string> = {
        different_angle: 'Focus on different selling points',
        more_detailed: 'Include more specific details',
        shorter: 'Make it more concise',
      };
      lines.push(`Reason: ${reasons[input.regenerateReason] || 'Try a fresh approach'}`);
    }
  }
  
  lines.push(`\nWrite the description now (max 600 characters):`);
  
  return lines.join('\n');
}

function extractHighlights(input: DescriptionInput): string[] {
  const highlights: string[] = [];
  
  if (input.mileage !== undefined && input.mileage !== null && input.mileage < 30000) {
    highlights.push('Low mileage');
  }
  if (input.specs === 'gcc') {
    highlights.push('GCC specs');
  }
  if (input.warrantyType && input.warrantyType !== 'none') {
    highlights.push('Under warranty');
  }
  if (input.condition === 'new') {
    highlights.push('Brand new');
  }
  if (input.extras && input.extras.length >= 5) {
    highlights.push('Well-equipped');
  }
  
  return highlights;
}

export async function generateDescription(
  input: DescriptionInput
): Promise<DescriptionResult> {
  const startTime = Date.now();
  
  // Validate required fields
  if (!input.make || !input.model || !input.year) {
    throw new Error('Missing required fields: make, model, year');
  }
  
  const client = getOpenAIClient();
  const userPrompt = buildUserPrompt(input);
  
  try {
    const response = await client.chat.completions.create({
      model: DESCRIPTION_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7, // Some creativity for varied regenerations
      max_tokens: 200, // ~600 chars max
    });
    
    const description = response.choices[0]?.message?.content?.trim() || '';
    
    // Ensure we don't exceed 700 chars (hard limit)
    const finalDescription = description.length > 700 
      ? description.slice(0, 697) + '...'
      : description;
    
    return {
      description: finalDescription,
      characterCount: finalDescription.length,
      highlights: extractHighlights(input),
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[AI Description] Error:', error);
    throw error;
  }
}

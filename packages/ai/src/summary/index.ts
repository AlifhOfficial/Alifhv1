/**
 * DarkWeave — AI Insight Engine
 * 
 * The brain behind the thread. Sharp, direct, no fluff.
 * Powered by carbon fiber logic and real talk.
 * 
 * Uses GPT-4o-mini for cost-effective generation (~$0.0001/insight)
 * 
 * DarkWeave reads what's there and tells you what matters.
 * Bold observations, not boring summaries.
 * 
 * @module ai/summary
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export interface SummaryInput {
  // Core vehicle info (REQUIRED)
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  
  // Key specs
  mileage: number;
  price: number;
  specs?: string | null;
  emirate?: string | null;
  condition?: 'new' | 'used' | null;
  
  // Vehicle details
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineSize?: string | null;
  cylinders?: number | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  
  // Listing meta
  description?: string | null;
  extras?: string[] | null;
  isNegotiable?: boolean | null;
  isBlkListing?: boolean | null;
  viewCount?: number | null;
  favouriteCount?: number | null;

  // Seller info
  sellerType: 'partner' | 'user';
  sellerName?: string | null;
  sellerDescription?: string | null;
  sellerVerified?: boolean;
  sellerTier?: string | null;
  sellerLocation?: string | null;
  sellerRating?: number | null;
  sellerReviewCount?: number | null;
  sellerActiveListings?: number | null;
  sellerBadges?: string[] | null;
  sellerSpecialties?: string[] | null;
}

/** A flag — either a red flag (problem) or a green flag (good sign) */
export interface DarkWeaveFlag {
  type: 'red' | 'green';
  text: string;
}

export interface SummaryResult {
  /** The headline — punchy, direct, says it like it is */
  darkTake: string;
  /** Deal positioning — where this sits */
  dealRating: 'steal' | 'solid' | 'fair' | 'steep' | 'unclear';
  /** Car read — sharp observations, not boring specs */
  machineNotes: string[];
  /** Worth noting — only if genuinely relevant, not forced */
  flags: DarkWeaveFlag[];
  /** Seller read — direct take on who you're dealing with */
  sellerVibe: string;
  /** Seller info level */
  sellerTrust: 'solid' | 'decent' | 'limited' | 'unknown';
  /** Negotiation context — something useful to know */
  negotiationTip: string;
  /** Processing metadata */
  processingTimeMs: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini';

// ============================================================================
// SYSTEM PROMPT — THE DARKWEAVE PERSONALITY
// ============================================================================

const SYSTEM_PROMPT = `You are DarkWeave — unapologetic, sharp, data-obsessed. You've seen ten thousand listings and nothing gets past you. You don't hedge. You don't play safe. You call it exactly how the data reads.

YOUR PERSONALITY:
- You have SWAGGER. You're not a boring analysis tool — you're the sharpest friend in the room.
- Unapologetic. When the data says something, you SAY it.
- Use actual numbers everywhere. "52k on a 2020" not "relatively low mileage."
- Dry wit when it fits. "That's a lot of km asking for that kind of money" hits harder than "high mileage relative to price."
- UAE market native — GCC spec premium, import trade-offs, emirate pricing, you know the game.
- When data is thin, OWN IT. "Not much to go on" is more honest than a made-up read.

YOUR JOB — STUDY EVERY DATA POINT:
You are given mileage, price, year, specs, condition, body type, fuel type, transmission, engine, colors, features, description, seller info, and listing engagement. USE ALL OF IT. Don't ignore data.

- darkTake: Your headline. Max 85 chars. Must reference actual numbers. Not generic — specific. Show personality. Examples: "GCC V8 at 48k km for 85k — someone's sleeping on this" or "190k km asking 120k AED — you're buying the badge at this point"
- dealRating: Your honest call. "steal" = seriously underpriced, you'd buy it yourself. "solid" = good deal, you'd tell a friend. "fair" = nothing wrong, nothing special. "steep" = overpriced for what it is. "unclear" = not enough data to call it — SAY SO, don't guess.
- machineNotes: 3-5 sharp, data-backed reads. Reference the ACTUAL numbers. Study mileage vs year, price vs spec, condition vs asking, features vs segment. "52k km on a 2020 GCC — that's clean for the segment" not "good condition." Each max 70 chars.
- flags: ONLY when the data genuinely warrants it. Most listings need ZERO flags. Default is []. Don't pad. Don't manufacture. If nothing stands out, return []. 0-3 max.
- sellerVibe: One honest line. Reference seller data if available — rating, review count, verified status. Max 80 chars.
- sellerTrust: "solid" = verified + rated. "decent" = some signals. "limited" = thin profile. "unknown" = nothing.
- negotiationTip: One tactical read from the data. Max 90 chars.

CRITICAL RULES:
- NEVER invent data. If a field is missing, don't reference it.
- Study ALL data points given to you. Don't ignore features, description, engagement, seller info.
- When data is insufficient for a confident read, own it — "not enough info to call this one" with a punchy darkTake is better than a fake confident read.
- dealRating "unclear" is valid and honest. Use it when warranted.
- Currency: AED. Market: UAE.
- Show personality. You're DarkWeave, not a spreadsheet.

RESPOND WITH VALID JSON ONLY.

{
  "darkTake": "string",
  "dealRating": "steal | solid | fair | steep | unclear",
  "machineNotes": ["string", ...],
  "flags": [{"type": "red | green", "text": "string"}, ...] or [],
  "sellerVibe": "string",
  "sellerTrust": "solid | decent | limited | unknown",
  "negotiationTip": "string"
}`;

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

function buildUserPrompt(input: SummaryInput): string {
  const lines: string[] = [];
  
  lines.push(`=== MACHINE ===`);
  lines.push(`Vehicle: ${input.year} ${input.make} ${input.model}${input.trim ? ` ${input.trim}` : ''}`);
  lines.push(`Price: ${input.price.toLocaleString()} AED${input.isNegotiable ? ' (negotiable)' : ''}`);
  lines.push(`Mileage: ${input.mileage.toLocaleString()} km`);
  lines.push(`Condition: ${input.condition || 'used'}`);
  
  if (input.specs) lines.push(`Specs: ${input.specs}`);
  if (input.emirate) lines.push(`Location: ${input.emirate}`);
  if (input.bodyType) lines.push(`Body: ${input.bodyType}`);
  if (input.fuelType) lines.push(`Fuel: ${input.fuelType}`);
  if (input.transmission) lines.push(`Transmission: ${input.transmission}`);
  if (input.engineSize) lines.push(`Engine: ${input.engineSize}`);
  if (input.cylinders) lines.push(`Cylinders: ${input.cylinders}`);
  if (input.exteriorColor) lines.push(`Exterior: ${input.exteriorColor}`);
  if (input.interiorColor) lines.push(`Interior: ${input.interiorColor}`);
  if (input.isBlkListing) lines.push(`BLK (premium) listing`);
  if (input.viewCount) lines.push(`Views: ${input.viewCount}`);
  if (input.favouriteCount) lines.push(`Favourites: ${input.favouriteCount}`);
  
  if (input.extras && input.extras.length > 0) {
    lines.push(`Features: ${input.extras.slice(0, 10).join(', ')}`);
  }
  
  if (input.description) {
    lines.push(`Description: ${input.description.slice(0, 300)}`);
  }
  
  lines.push(`\n=== SELLER ===`);
  lines.push(`Type: ${input.sellerType === 'partner' ? 'Dealer' : 'Private Seller'}`);
  if (input.sellerName) lines.push(`Name: ${input.sellerName}`);
  if (input.sellerVerified) lines.push(`Verified: Yes`);
  if (input.sellerTier) lines.push(`Tier: ${input.sellerTier}`);
  if (input.sellerLocation) lines.push(`Location: ${input.sellerLocation}`);
  if (input.sellerRating) lines.push(`Rating: ${input.sellerRating}${input.sellerReviewCount ? ` (${input.sellerReviewCount} reviews)` : ''}`);
  if (input.sellerActiveListings) lines.push(`Active listings: ${input.sellerActiveListings}`);
  if (input.sellerBadges && input.sellerBadges.length > 0) {
    lines.push(`Badges: ${input.sellerBadges.join(', ')}`);
  }
  if (input.sellerSpecialties && input.sellerSpecialties.length > 0) {
    lines.push(`Specialties: ${input.sellerSpecialties.join(', ')}`);
  }
  if (input.sellerDescription) {
    lines.push(`About: ${input.sellerDescription.slice(0, 200)}`);
  }
  
  lines.push(`\nRead the thread.`);
  
  return lines.join('\n');
}

export async function generateSummary(input: SummaryInput): Promise<SummaryResult> {
  const startTime = Date.now();
  
  if (!input.make || !input.model || !input.year) {
    throw new Error('Missing required fields: make, model, year');
  }
  
  const client = getOpenAIClient();
  const userPrompt = buildUserPrompt(input);
  
  try {
    const response = await client.chat.completions.create({
      model: SUMMARY_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6, // Personality needs room to breathe
      max_tokens: 450, // Room for structured insights
      response_format: { type: 'json_object' },
    });
    
    const raw = response.choices[0]?.message?.content?.trim() || '{}';
    
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('[DarkWeave] Failed to parse JSON:', raw);
      throw new Error('Failed to parse DarkWeave response');
    }

    // Parse flags array
    const rawFlags = Array.isArray(parsed.flags) ? parsed.flags : [];
    const flags: DarkWeaveFlag[] = rawFlags
      .filter((f: any) => f && typeof f === 'object' && (f.type === 'red' || f.type === 'green') && typeof f.text === 'string')
      .map((f: any) => ({ type: f.type as 'red' | 'green', text: f.text as string }));

    // Validate dealRating
    const validRatings = ['steal', 'solid', 'fair', 'steep', 'unclear'] as const;
    const dealRating = validRatings.includes(parsed.dealRating as any) 
      ? (parsed.dealRating as SummaryResult['dealRating']) 
      : 'fair';

    // Validate sellerTrust
    const validTrust = ['solid', 'decent', 'limited', 'unknown'] as const;
    const sellerTrust = validTrust.includes(parsed.sellerTrust as any)
      ? (parsed.sellerTrust as SummaryResult['sellerTrust'])
      : 'unknown';
    
    return {
      darkTake: (parsed.darkTake as string) || '',
      dealRating,
      machineNotes: Array.isArray(parsed.machineNotes) ? parsed.machineNotes as string[] : [],
      flags,
      sellerVibe: (parsed.sellerVibe as string) || '',
      sellerTrust,
      negotiationTip: (parsed.negotiationTip as string) || '',
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[DarkWeave] Error:', error);
    throw error;
  }
}

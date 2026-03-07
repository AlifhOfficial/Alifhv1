/**
 * AI Search Intent Parser
 * 
 * Converts natural language queries into structured SearchParams.
 * The LLM never touches the DB — it's a pure intent parser.
 * 
 * Flow:
 *   User text → normalize → cache check → LLM parse → SearchParams → existing search pipeline
 * 
 * Cost: GPT-4o-mini ~$0.0001/request (~$10/month for 100K uncached requests)
 * Latency: ~300-500ms uncached, <1ms cached
 * 
 * @module ai/search
 */

import OpenAI from 'openai';
import { createHash } from 'crypto';
import {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  UAE_EMIRATES,
  VEHICLE_EXTRAS,
  LISTING_TAGS,
} from './constants';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Structured output from the LLM intent parser.
 * Maps directly to the platform's SearchParams.
 */
export interface ParsedSearchIntent {
  // Vehicle identification
  make?: string[];
  model?: string[];
  trim?: string[];
  
  // Price range
  priceMin?: number;
  priceMax?: number;
  
  // Year range
  yearMin?: number;
  yearMax?: number;
  
  // Mileage
  mileageMax?: number;
  
  // Vehicle attributes
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  exteriorColor?: string[];
  interiorColor?: string[];
  engineSize?: string[];
  
  // Condition & seller
  condition?: 'new' | 'used';
  sellerType?: 'dealer' | 'private';
  
  // Tags (quality indicators)
  tags?: string[];
  
  // Features/extras
  extras?: string[];
  
  // Location
  emirate?: string[];
  
  // Booleans
  underWarranty?: boolean;
  isNegotiable?: boolean;
  
  // Sorting preference
  sortBy?: 'newest' | 'cheapest' | 'price_low' | 'price_high' | 'mileage_low' | 'mileage_high' | 'year_new' | 'popular';
  
  // Fallback: if the query has something the LLM can't map to structured filters,
  // pass it as a text search for our existing keyword matching
  q?: string;
  
  // Confidence: how well the LLM understood the user's intent (0-1)
  confidence: number;
  
  // Brief natural language summary of what was understood
  summary: string;
  
  // Amna's short conversational reply to the user (shown in UI before redirect)
  message?: string;
}

export interface AISearchResult {
  intent: ParsedSearchIntent;
  cached: boolean;
  processingTimeMs: number;
  /** Estimated cost in USD for this request (0 if cached) */
  estimatedCost: number;
}

export interface AISearchOptions {
  /** Skip cache lookup (for testing) */
  skipCache?: boolean;
  /** Max tokens for the response */
  maxTokens?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SEARCH_MODEL = process.env.OPENAI_SEARCH_MODEL || 'gpt-4o-mini';

// Cost per million tokens (gpt-4o-mini pricing as of 2025)
const INPUT_COST_PER_M = 0.15;   // $0.15 per 1M input tokens
const OUTPUT_COST_PER_M = 0.60;  // $0.60 per 1M output tokens

// Cache settings
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 10_000; // Max entries in memory cache

// ============================================================================
// IN-MEMORY CACHE (Tier 1 — exact match on normalized input)
// ============================================================================

interface CacheEntry {
  intent: ParsedSearchIntent;
  timestamp: number;
}

const intentCache = new Map<string, CacheEntry>();

/**
 * Normalize user input for consistent cache keys.
 * Lowercase, collapse whitespace, trim, remove trailing punctuation.
 */
function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s,.-]/g, ' ')  // Keep alphanumeric, spaces, commas, dots, hyphens
    .replace(/\s+/g, ' ')          // Collapse whitespace
    .replace(/[.,!?;:]+$/, '')     // Remove trailing punctuation
    .trim();
}

/**
 * Generate a cache key from normalized input.
 */
function getCacheKey(normalizedInput: string): string {
  return createHash('sha256').update(normalizedInput).digest('hex').slice(0, 16);
}

/**
 * Evict oldest entries when cache exceeds max size.
 */
function evictOldEntries(): void {
  if (intentCache.size <= MAX_CACHE_SIZE) return;
  
  // Sort by timestamp, remove oldest 20%
  const entries = [...intentCache.entries()]
    .sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
  for (let i = 0; i < toRemove; i++) {
    intentCache.delete(entries[i]![0]);
  }
}

/**
 * Get from cache (returns null if miss or expired).
 */
function getFromCache(normalizedInput: string): ParsedSearchIntent | null {
  const key = getCacheKey(normalizedInput);
  const entry = intentCache.get(key);
  
  if (!entry) return null;
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    intentCache.delete(key);
    return null;
  }
  
  return entry.intent;
}

/**
 * Store in cache.
 */
function setInCache(normalizedInput: string, intent: ParsedSearchIntent): void {
  const key = getCacheKey(normalizedInput);
  intentCache.set(key, { intent, timestamp: Date.now() });
  evictOldEntries();
}

/** Get current cache stats (for monitoring). */
export function getSearchCacheStats() {
  return {
    size: intentCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMs: CACHE_TTL_MS,
  };
}

/** Clear the search intent cache. */
export function clearSearchCache(): void {
  intentCache.clear();
}

// ============================================================================
// SYSTEM PROMPT — THE BRAIN (built dynamically from listing constants)
// ============================================================================

// Natural-language hints so the LLM can map casual phrasing → tag values
const TAG_HINTS: Record<string, string> = {
  serviceHistory: 'user says: "service history", "maintained", "serviced regularly"',
  singleOwner: 'user says: "one owner", "first owner", "single owner"',
  accidentFree: 'user says: "no accidents", "clean", "accident free"',
  underWarranty: 'user says: "warranty", "still under warranty"',
  lowMileage: 'user says: "low km", "barely driven", "low mileage"',
  garageKept: 'user says: "garage kept", "indoor", "covered parking"',
  nonSmoker: 'user says: "non smoker", "no smoking", "smoke free"',
  recentlyServiced: 'user says: "just serviced", "fresh service"',
  originalPaint: 'user says: "original paint", "no respray", "factory paint"',
  companyMaintained: 'user says: "company maintained", "fleet maintained", "agency serviced"',
};

function buildSystemPrompt(): string {
  // Build makes list from actual constants
  const makes = CAR_MAKES.join(', ');

  // Build models per make (compact format)
  const modelLines = Object.entries(CAR_MODELS)
    .filter(([, models]) => (models as readonly string[]).length > 0)
    .map(([make, models]) => `  ${make}: ${(models as readonly string[]).join(', ')}`)
    .join('\n');

  // Build enum values from constants
  const bodyTypes = BODY_TYPES.map(b => b.value).join(', ');
  const fuelTypes = FUEL_TYPES.map(f => f.value).join(', ');
  const transmissions = TRANSMISSION_TYPES.map(t => t.value).join(', ');
  const specs = SPECS_TYPES.map(s => s.value).join(', ');
  const engineSizes = ENGINE_SIZES.map(e => e.value).join(', ');
  const extColors = EXTERIOR_COLORS.map(c => c.value).join(', ');
  const intColors = INTERIOR_COLORS.map(c => c.value).join(', ');
  const emirates = UAE_EMIRATES.map(e => `${e.value} (${e.label})`).join(', ');
  const extras = VEHICLE_EXTRAS.map(e => `${e.value} → "${e.label}"`).join(', ');
  const tags = LISTING_TAGS.map(t => {
    const hint = TAG_HINTS[t.value] || '';
    return `- ${t.value} → "${t.label}"${hint ? ` (${hint})` : ''}`;
  }).join('\n');

  return `You are Amna — the sassy, car-obsessed AI of alifh.com (UAE's car marketplace). You have STRONG opinions about cars, dramatic flair, and the humor of a petrolhead who's seen too many questionable car choices. Think: your funniest friend who happens to know everything about cars.

YOUR VIBE:
- Witty, a little roasty, but always helpful underneath the attitude
- You talk like a car-savvy friend who'll tease their taste but still find them the perfect ride
- Light automotive roasts, car metaphors, and emoji used with PURPOSE (not spam)
- You're dramatic about ugly color combos, bad specs, and questionable life choices — in a fun way
- You LOVE creative and weird questions — lean into them hard

PLATFORM CONTEXT:
- UAE car marketplace (prices in AED, locations are UAE emirates)
- Supports dealer and private sellers
- Listings have tags, extras/features, and full vehicle specs

YOUR JOB: Parse the user's message into a JSON object matching our SearchParams schema AND give them a witty reply in the "message" field. Never make up filter data. If unsure about a filter value, leave it out.

CRITICAL REQUIREMENTS (read these first):
- You MUST ALWAYS return at least ONE filter field when the query has ANY car intent. A witty message with zero filters is USELESS.
- If someone mentions a car by name ("RS5", "Camry", "Patrol", "G-Wagon"), you MUST return make + model. Model names uniquely identify their make: RS5=Audi, Camry=Toyota, Patrol=Nissan, Wrangler=Jeep, G-Wagon/G-Class=Mercedes-Benz, Cayenne=Porsche, Range Rover=Land Rover, Mustang=Ford, Civic=Honda, Corolla=Toyota, etc.
- "Do you have X?" / "show me X" / "find me X" = SEARCH for X. Always return filters.
- For "surprise me" / random, use POPULAR UAE makes (Toyota, Nissan, Mercedes-Benz, BMW, Audi, Land Rover, Porsche, Lexus). Always return real filter fields.
- If you can't map anything to filters, set confidence to 0.0. Confidence > 0 with zero filters is INVALID.

SPECIAL QUERIES YOU MUST HANDLE CREATIVELY:

1. "Surprise me" / "random car" / "pick something" / "idk what I want"
   → Pick a random interesting combo: fun color + body type, or a popular make at a price range. VARY it every time — don't repeat yourself.
   → Confidence: 0.8. Always return real filters.

2. Personality/lifestyle queries ("I'm a CEO", "college student", "dad with 4 kids", "gym bro")
   → Infer the PERFECT car profile: body type, price range, features, maybe color
   → Go ALL IN on creative inference. Be opinionated.

3. Vibe queries ("something that turns heads", "sleeper car", "date night whip", "road trip beast")
   → Map to filters creatively — body type, color, features, price range
   → Commit to a bold recommendation

4. Comparisons ("BMW or Mercedes?", "Patrol or Land Cruiser?")
   → Pick ONE. Commit with attitude. Return those filters.
   → You're not Wikipedia — you have opinions.

5. Roast requests ("roast my car", "what do you think of Sunny drivers")
   → Still return relevant filters so results show. Confidence 0.7+
   → But absolutely roast them in the message

6. Budget reality checks ("Lamborghini for 50K")
   → Return the filters (older models might exist!)
   → But be honest and funny about the odds

7. Car advice ("what's good for a first car?", "best family car?", "most reliable?")
   → Commit to specific recommendations with real filters
   → Amna has TASTE. No wishy-washy "it depends" answers.

AVAILABLE FILTER FIELDS (all array fields MUST be JSON arrays, e.g. ["Audi"] not "Audi"):

- make: string[] — EXACT values: ${makes}
- model: string[] — EXACT values by make:
${modelLines}
- trim: string[] — Specific trims like "Sport", "Platinum", "RS"
- yearMin/yearMax: number — Year range (e.g. 2020-2024)
- priceMin/priceMax: number — Price in AED. Common conversions: 100K = 100000, 500K = 500000, 1M = 1000000
- mileageMax: number — Max km. "low mileage" ≈ 50000, "very low" ≈ 20000

BODY & SPECS:
- bodyType: string[] — EXACT values: ${bodyTypes}
- fuelType: string[] — EXACT values: ${fuelTypes}
- transmission: string[] — EXACT values: ${transmissions}
- specs: string[] — Regional specs. EXACT values: ${specs}
- engineSize: string[] — EXACT values: ${engineSizes}
- exteriorColor: string[] — EXACT values: ${extColors}
- interiorColor: string[] — EXACT values: ${intColors}

CONDITION & SELLER:
- condition: "new" | "used"
- sellerType: "dealer" | "private"
- underWarranty: boolean
- isNegotiable: boolean

TAGS (quality indicators — the user might describe these naturally):
${tags}

EXTRAS (vehicle features — use the value, not the label):
${extras}

LOCATION:
- emirate: string[] — EXACT values: ${emirates}

SORTING:
- sortBy: "newest" | "price_low" | "price_high" | "mileage_low" | "mileage_high" | "year_new" | "popular"
  (User says "cheapest" → price_low, "newest" → newest, "most popular" → popular, "lowest mileage" → mileage_low, "highest mileage" → mileage_high)

METADATA FIELDS (always include these):
- confidence: number (0-1) — How well you understood the intent. 1.0 = crystal clear, 0.5 = partial, 0.1 = guessing
- summary: string — One-sentence internal summary (not shown to user)
- message: string — Your reply. MAX 20 words. MUST have personality. Examples:
  "Red Audi? Someone's having a midlife crisis early. I respect it 😏"
  "SUV under 70K for the desert? Say less, habibi 🏜️"
  "Black G-Wagon in Dubai? Groundbreaking. Never seen that before 😂"
  "Surprise! Throwing a yellow coupe at you. Live a little ☀️"
  "Nissan Patrol? The UAE national bird. Nothing but respect 🦅"
  "Lambo for 50K? Bold. Let me check the miracles section 💀"
  "First car? Corolla. It's not exciting but it'll outlive us all 🪨"
  "CEO energy = black Range Rover. It's basically the law 👔"
  "Date night whip? Red coupe, low mileage. You're welcome 💅"
  "Eco-friendly AND saving money? Look at you being responsible 🌱"
  If confidence is low: "Habibi I sell cars not riddles. Try again? 🤔"

RULES:
1. Only output valid JSON. No markdown, no explanation, no code blocks.
2. Only include filter fields you're confident about. Omit uncertain ones.
3. Make/model must use EXACT values from the lists above.
4. Prices are always in AED. If user says "$", convert roughly (1 USD ≈ 3.67 AED).
5. If query is pure nonsense with ZERO car angle, set confidence 0.0: { "confidence": 0.0, "summary": "No car intent", "message": "I sell cars not therapy. But tell me what you drive and I'll judge you free 🚗" }
6. For personality/lifestyle queries — go HARD on inference. Be creative with body types, price ranges, colors, features. Commit to bold picks.
7. "GCC" means GCC specs, not a location.
8. "American specs" or "imported" → specs: ["american"]
9. Handle Arabic transliterations: "dubai" = dubai, "abu dhabi" = abu_dhabi, "sharjah" = sharjah
10. Budget/affordable → sort by price_low, possibly priceMax
11. "Surprise me" → pick a random fun combo. VARY your picks — don't always suggest the same thing.
12. NEVER include a "q" field. Everything maps to structured filters. Can't map it? Leave it out.
13. The "message" field is REQUIRED. Always have personality. Never. Be. Boring.
14. You roast, but you never insult. Think comedy not cruelty. Light teasing, not mean.
15. When someone asks for advice, COMMIT to an opinion. Amna doesn't say "it depends." Amna has TASTE.

EXAMPLES OF CORRECT OUTPUT:
User: "do you have RS5?" → { "make": ["Audi"], "model": ["RS5"], "confidence": 0.9, "summary": "Looking for Audi RS5", "message": "RS5? Taste. Pure taste. Let me find you one 🔥" }
User: "surprise me" → { "make": ["Porsche"], "bodyType": ["coupe"], "confidence": 0.8, "summary": "Random pick: Porsche coupe", "message": "Plot twist — how about a Porsche coupe? You're welcome 😏" }
User: "cheap family car" → { "bodyType": ["suv","van"], "priceMax": 80000, "sortBy": "price_low", "confidence": 0.8, "summary": "Budget family car", "message": "Family car on a budget? SUV it is, dad 🏆" }`;
}

// Build once at module load time
const SYSTEM_PROMPT = buildSystemPrompt();

// ============================================================================
// OpenAI CLIENT
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

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Parse natural language into structured search filters.
 * 
 * @example
 * ```ts
 * const result = await parseSearchIntent("red bmw suv under 200k with sunroof");
 * // result.intent = {
 * //   make: ["BMW"],
 * //   bodyType: ["suv"],
 * //   exteriorColor: ["red"],
 * //   priceMax: 200000,
 * //   extras: ["panoramicSunroof"],
 * //   confidence: 0.95,
 * //   summary: "Looking for a red BMW SUV under 200K AED with panoramic sunroof"
 * // }
 * ```
 */
export async function parseSearchIntent(
  userInput: string,
  options: AISearchOptions = {},
): Promise<AISearchResult> {
  const startTime = Date.now();
  
  // Validate input
  const trimmed = userInput.trim();
  if (!trimmed || trimmed.length > 2000) {
    return {
      intent: {
        confidence: 0,
        summary: trimmed ? 'Input too long' : 'Empty input',
      },
      cached: false,
      processingTimeMs: Date.now() - startTime,
      estimatedCost: 0,
    };
  }
  
  // Normalize for cache
  const normalized = normalizeInput(trimmed);
  
  // Check cache first
  if (!options.skipCache) {
    const cached = getFromCache(normalized);
    if (cached) {
      return {
        intent: cached,
        cached: true,
        processingTimeMs: Date.now() - startTime,
        estimatedCost: 0,
      };
    }
  }
  
  // Call LLM
  const client = getOpenAIClient();
  
  try {
    const response = await client.chat.completions.create({
      model: SEARCH_MODEL,
      temperature: 0.4,  // Enough creativity for personality, reliable enough for filters
      max_tokens: options.maxTokens || 600,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: trimmed },
      ],
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }
    
    // Parse the JSON response
    const intent = JSON.parse(content) as ParsedSearchIntent;
    
    // Clean up: remove empty arrays and undefined values
    const cleaned = cleanIntent(intent);
    
    // Calculate estimated cost
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const estimatedCost = (inputTokens * INPUT_COST_PER_M + outputTokens * OUTPUT_COST_PER_M) / 1_000_000;
    
    // Cache the result (only if confidence > 0)
    if (cleaned.confidence > 0) {
      setInCache(normalized, cleaned);
    }
    
    return {
      intent: cleaned,
      cached: false,
      processingTimeMs: Date.now() - startTime,
      estimatedCost,
    };
  } catch (error) {
    // On LLM failure, fall back to passing raw text as q
    console.error('[AI Search] LLM parse failed:', error);
    
    const fallbackIntent: ParsedSearchIntent = {
      q: trimmed,
      confidence: 0,
      summary: 'AI parsing failed, falling back to text search',
    };
    
    return {
      intent: fallbackIntent,
      cached: false,
      processingTimeMs: Date.now() - startTime,
      estimatedCost: 0,
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Remove empty arrays, null values, and normalize the intent object.
 */
function cleanIntent(raw: ParsedSearchIntent): ParsedSearchIntent {
  const cleaned: ParsedSearchIntent = {
    confidence: raw.confidence ?? 0,
    summary: raw.summary ?? '',
  };
  
  // Copy arrays only if non-empty
  const arrayFields = [
    'make', 'model', 'trim', 'bodyType', 'fuelType', 'transmission',
    'specs', 'exteriorColor', 'interiorColor', 'engineSize', 'tags',
    'extras', 'emirate',
  ] as const;
  
  for (const field of arrayFields) {
    const val = raw[field];
    if (Array.isArray(val) && val.length > 0) {
      (cleaned as any)[field] = val;
    } else if (typeof val === 'string' && (val as unknown as string).trim()) {
      // LLM sometimes returns a single string instead of an array — normalize it
      (cleaned as any)[field] = [(val as unknown as string).trim()];
    }
  }
  
  // Copy numbers only if positive
  const numberFields = ['priceMin', 'priceMax', 'yearMin', 'yearMax', 'mileageMax'] as const;
  for (const field of numberFields) {
    const val = raw[field];
    if (typeof val === 'number' && val > 0) {
      (cleaned as any)[field] = val;
    }
  }
  
  // Copy strings
  if (raw.condition) cleaned.condition = raw.condition;
  if (raw.sellerType) cleaned.sellerType = raw.sellerType;
  if (raw.sortBy) cleaned.sortBy = raw.sortBy;
  if (raw.message && raw.message.trim()) cleaned.message = raw.message.trim();
  
  // NEVER pass q — the AI should only produce structured filters.
  // If the LLM still outputs q, discard it to prevent raw conversational
  // text from being sent as keyword search.
  
  // Copy booleans (only if explicitly set)
  if (typeof raw.underWarranty === 'boolean') cleaned.underWarranty = raw.underWarranty;
  if (typeof raw.isNegotiable === 'boolean') cleaned.isNegotiable = raw.isNegotiable;
  
  // RESCUE: If AI returned confidence > 0 but zero filter fields,
  // try to extract make/model from the summary text.
  // This catches cases like "User is looking for an Audi RS5" with no filters.
  const hasAnyFilter = arrayFields.some(f => (cleaned as any)[f]?.length > 0) ||
    numberFields.some(f => (cleaned as any)[f] > 0) ||
    cleaned.condition || cleaned.sellerType || cleaned.sortBy ||
    cleaned.underWarranty !== undefined || cleaned.isNegotiable !== undefined;
  
  if (cleaned.confidence > 0 && !hasAnyFilter) {
    const text = `${raw.summary || ''} ${raw.message || ''}`.toLowerCase();
    
    // Strategy 1: Find a known make in the text, then look for its models
    for (const make of CAR_MAKES) {
      if (text.includes(make.toLowerCase())) {
        cleaned.make = [make];
        
        // Try to find a model for that make
        const models = CAR_MODELS[make as keyof typeof CAR_MODELS] as readonly string[] | undefined;
        if (models) {
          for (const model of models) {
            if (model.length >= 2 && text.includes(model.toLowerCase())) {
              cleaned.model = [model];
              break;
            }
          }
        }
        break;
      }
    }
    
    // Strategy 2: If no make found, try reverse — find a model name and infer its make
    if (!cleaned.make?.length) {
      for (const [make, models] of Object.entries(CAR_MODELS)) {
        for (const model of (models as readonly string[])) {
          if (model.length >= 2 && text.includes(model.toLowerCase())) {
            cleaned.make = [make];
            cleaned.model = [model];
            break;
          }
        }
        if (cleaned.make?.length) break;
      }
    }
    
    // If still no filters after rescue, downgrade confidence
    const hasFilterNow = (cleaned.make?.length ?? 0) > 0;
    if (!hasFilterNow) {
      cleaned.confidence = 0;
    }
  }
  
  return cleaned;
}

/**
 * Convert ParsedSearchIntent to the platform's SearchParams format.
 * This bridges the AI output to the existing search pipeline.
 */
export function intentToSearchParams(intent: ParsedSearchIntent): Record<string, any> {
  const params: Record<string, any> = {};
  
  // Direct mappings (same field names)
  if (intent.make?.length) params.make = intent.make;
  if (intent.model?.length) params.model = intent.model;
  if (intent.trim?.length) params.trim = intent.trim;
  if (intent.bodyType?.length) params.bodyType = intent.bodyType;
  if (intent.fuelType?.length) params.fuelType = intent.fuelType;
  if (intent.transmission?.length) params.transmission = intent.transmission;
  if (intent.specs?.length) params.specs = intent.specs;
  if (intent.exteriorColor?.length) params.exteriorColor = intent.exteriorColor;
  if (intent.interiorColor?.length) params.interiorColor = intent.interiorColor;
  if (intent.engineSize?.length) params.engineSize = intent.engineSize;
  if (intent.tags?.length) params.tags = intent.tags;
  if (intent.extras?.length) params.extras = intent.extras;
  if (intent.emirate?.length) params.emirate = intent.emirate;
  
  // Numbers
  if (intent.priceMin) params.priceMin = intent.priceMin;
  if (intent.priceMax) params.priceMax = intent.priceMax;
  if (intent.yearMin) params.yearMin = intent.yearMin;
  if (intent.yearMax) params.yearMax = intent.yearMax;
  if (intent.mileageMax) params.mileageMax = intent.mileageMax;
  
  // Enums
  if (intent.condition) params.condition = intent.condition;
  if (intent.sellerType) params.sellerType = intent.sellerType;
  if (intent.sortBy) params.sortBy = intent.sortBy;
  
  // Booleans
  if (typeof intent.underWarranty === 'boolean') params.underWarranty = intent.underWarranty;
  if (typeof intent.isNegotiable === 'boolean') params.isNegotiable = intent.isNegotiable;
  
  // Note: q is intentionally not passed — AI output should be fully structured.
  // This prevents raw conversational text from polluting keyword search.
  
  return params;
}

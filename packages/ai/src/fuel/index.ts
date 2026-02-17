/**
 * AI Fuel Efficiency Service
 * 
 * Uses GPT-3.5-turbo for cost-effective personalized suggestions
 * Estimated cost: ~$0.0005 per analysis (very cheap)
 * 
 * @module ai/fuel
 */

import OpenAI from 'openai'

// ============================================================================
// TYPES
// ============================================================================

export interface FuelAnalysisInput {
  // Vehicle info
  vehicleName: string
  fuelType: string
  efficiency: number // L/100km
  
  // Driving patterns
  monthlyDistance: number // km
  drivingStyle: 'eco' | 'normal' | 'aggressive'
  drivingEnvironment: 'city' | 'highway' | 'mixed'
  acUsage: 'always' | 'mostly' | 'sometimes' | 'rarely'
  trafficLevel: 'low' | 'moderate' | 'heavy'
  idleTimeMinutes: number
  
  // Current costs
  monthlyFuelCost: number
  currentSpending?: number // what user thinks they spend
  
  // Context
  emirate?: string
}

export interface FuelSuggestion {
  id: string
  title: string
  description: string
  potentialSaving: number // AED per month
  category: 'driving' | 'maintenance' | 'planning' | 'vehicle' | 'lifestyle'
  difficulty: 'easy' | 'medium' | 'hard'
  timeToImplement: string // "immediate", "1-2 weeks", etc.
}

export interface FuelAnalysisResult {
  suggestions: FuelSuggestion[]
  summary: string
  efficiencyScore: number // 1-100
  potentialMonthlySaving: number
  funFact: string
}

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const SYSTEM_PROMPT = `You are a UAE-based automotive fuel efficiency expert. Provide practical, actionable advice for reducing fuel costs in the UAE context.

Consider:
- UAE's hot climate (AC is essential, but optimization is possible)
- UAE driving conditions (SZR traffic, long highways, desert heat)
- Local fuel prices and station locations
- UAE-specific tips (tinting, parking in shade, mall parking)
- Local alternatives (metro, carpooling in UAE)

Be specific with numbers and savings estimates. Keep suggestions practical and achievable.
Respond in JSON format only.`

const getUserPrompt = (input: FuelAnalysisInput) => `Analyze this driver's fuel consumption and provide personalized money-saving suggestions.

DRIVER PROFILE:
- Vehicle: ${input.vehicleName}
- Fuel Type: ${input.fuelType}
- Current Efficiency: ${input.efficiency} L/100km
- Monthly Distance: ${input.monthlyDistance} km
- Monthly Fuel Cost: AED ${input.monthlyFuelCost}
${input.currentSpending ? `- User's perceived spending: AED ${input.currentSpending}/month` : ''}

DRIVING HABITS:
- Style: ${input.drivingStyle}
- Environment: ${input.drivingEnvironment}
- AC Usage: ${input.acUsage}
- Traffic Level: ${input.trafficLevel}
- Daily Idle Time: ${input.idleTimeMinutes} minutes
${input.emirate ? `- Based in: ${input.emirate}` : ''}

Respond with exactly this JSON structure (no markdown, no code blocks, just JSON):
{
  "efficiencyScore": <number 1-100>,
  "summary": "<brief 2-sentence assessment>",
  "potentialMonthlySaving": <realistic AED amount>,
  "funFact": "<interesting UAE-specific fact about fuel/driving>",
  "suggestions": [
    {
      "id": "unique_id",
      "title": "<short actionable title>",
      "description": "<specific how-to with UAE context>",
      "potentialSaving": <AED per month>,
      "category": "driving|maintenance|planning|vehicle|lifestyle",
      "difficulty": "easy|medium|hard",
      "timeToImplement": "<immediate|1-2 weeks|1 month|etc>"
    }
  ]
}

Provide 4-6 suggestions ranked by impact. Be realistic with savings estimates.`

// ============================================================================
// ANALYSIS FUNCTION
// ============================================================================

let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

export async function analyzeFuelEfficiency(
  input: FuelAnalysisInput
): Promise<FuelAnalysisResult> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo', // Very cost-effective
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: getUserPrompt(input) },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    const result = JSON.parse(content) as FuelAnalysisResult

    // Validate and sanitize
    return {
      efficiencyScore: Math.min(100, Math.max(1, result.efficiencyScore || 50)),
      summary: result.summary || 'Analysis complete.',
      potentialMonthlySaving: Math.max(0, result.potentialMonthlySaving || 0),
      funFact: result.funFact || '',
      suggestions: (result.suggestions || []).map((s, i) => ({
        id: s.id || `suggestion_${i}`,
        title: s.title || 'Suggestion',
        description: s.description || '',
        potentialSaving: Math.max(0, s.potentialSaving || 0),
        category: s.category || 'driving',
        difficulty: s.difficulty || 'medium',
        timeToImplement: s.timeToImplement || 'varies',
      })),
    }
  } catch (error) {
    console.error('AI Fuel Analysis Error:', error)
    
    // Return fallback suggestions
    return getFallbackAnalysis(input)
  }
}

// ============================================================================
// FALLBACK (if AI fails or for offline)
// ============================================================================

function getFallbackAnalysis(input: FuelAnalysisInput): FuelAnalysisResult {
  const suggestions: FuelSuggestion[] = []
  let totalSaving = 0

  // Driving style suggestions
  if (input.drivingStyle === 'aggressive') {
    const saving = input.monthlyFuelCost * 0.20
    totalSaving += saving
    suggestions.push({
      id: 'eco_driving',
      title: 'Adopt Eco Driving Habits',
      description: 'Accelerate gently, maintain steady speeds (100-110 km/h on SZR), and anticipate traffic to brake gradually. This alone can save 15-25% on fuel.',
      potentialSaving: saving,
      category: 'driving',
      difficulty: 'medium',
      timeToImplement: 'immediate',
    })
  }

  // AC suggestions for UAE
  if (input.acUsage === 'always') {
    const saving = input.monthlyFuelCost * 0.08
    totalSaving += saving
    suggestions.push({
      id: 'ac_optimization',
      title: 'Optimize Your AC Usage',
      description: 'Park in shade or covered parking, use sunshades, get quality window tinting (if not already). Pre-cool your car while still plugged in if electric, or use remote start briefly.',
      potentialSaving: saving,
      category: 'maintenance',
      difficulty: 'easy',
      timeToImplement: '1-2 weeks',
    })
  }

  // Traffic suggestions
  if (input.trafficLevel === 'heavy') {
    const saving = input.monthlyFuelCost * 0.12
    totalSaving += saving
    suggestions.push({
      id: 'avoid_traffic',
      title: 'Avoid Peak Hour Traffic',
      description: 'SZR rush hour (7-9 AM, 5-8 PM) can double your fuel consumption. Leave 30 mins earlier or use Waze for real-time routing. Consider Dubai Metro for part of commute.',
      potentialSaving: saving,
      category: 'planning',
      difficulty: 'medium',
      timeToImplement: 'immediate',
    })
  }

  // Idle time
  if (input.idleTimeMinutes > 10) {
    const saving = (input.idleTimeMinutes / 60) * 0.8 * 3.0 * 30 // liters * price * days
    totalSaving += saving
    suggestions.push({
      id: 'reduce_idling',
      title: 'Reduce Engine Idling',
      description: `You idle ~${input.idleTimeMinutes} mins daily. In UAE heat, AC idling uses 0.8L/hour. Turn off engine when waiting more than 1 minute (except in extreme heat).`,
      potentialSaving: saving,
      category: 'driving',
      difficulty: 'easy',
      timeToImplement: 'immediate',
    })
  }

  // Maintenance
  suggestions.push({
    id: 'maintenance',
    title: 'Keep Up with Maintenance',
    description: 'Proper tire pressure (check weekly in UAE heat), clean air filter, and fresh oil can improve efficiency 3-5%. Many stations offer free tire pressure checks.',
    potentialSaving: input.monthlyFuelCost * 0.04,
    category: 'maintenance',
    difficulty: 'easy',
    timeToImplement: '1-2 weeks',
  })

  // Fuel type (if using super98 unnecessarily)
  if (input.fuelType === 'super98' && input.efficiency < 10) {
    const saving = input.monthlyFuelCost * 0.03
    totalSaving += saving
    suggestions.push({
      id: 'fuel_grade',
      title: 'Check If You Need Super 98',
      description: 'Many cars run perfectly on Special 95. Check your manual - using premium when not needed is just extra cost. Save AED 0.10 per liter.',
      potentialSaving: saving,
      category: 'planning',
      difficulty: 'easy',
      timeToImplement: 'immediate',
    })
  }

  // Calculate efficiency score
  let score = 70 // base
  if (input.drivingStyle === 'eco') score += 15
  if (input.drivingStyle === 'aggressive') score -= 20
  if (input.trafficLevel === 'heavy') score -= 10
  if (input.acUsage === 'rarely') score += 5
  if (input.idleTimeMinutes > 20) score -= 10

  return {
    efficiencyScore: Math.min(100, Math.max(1, score)),
    summary: `Based on your ${input.drivingStyle} driving style in ${input.trafficLevel} traffic, there's room for improvement. ${input.acUsage === 'always' ? 'UAE heat requires AC, but optimization helps.' : ''}`,
    potentialMonthlySaving: Math.round(totalSaving),
    funFact: 'UAE drivers spend an average of 45 minutes daily in traffic, consuming up to 30% more fuel than free-flowing conditions.',
    suggestions: suggestions.sort((a, b) => b.potentialSaving - a.potentialSaving).slice(0, 5),
  }
}

export { getFallbackAnalysis }

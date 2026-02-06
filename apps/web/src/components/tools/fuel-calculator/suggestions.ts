/**
 * Instant Fuel-Saving Suggestions
 * 
 * No API call - instant results based on user inputs
 * Fast, free, and always available
 */

import type { FuelFormData, FuelResult, AIAnalysis, AISuggestion } from './types'

interface SuggestionRule {
  id: string
  condition: (form: FuelFormData, result: FuelResult) => boolean
  generate: (form: FuelFormData, result: FuelResult) => AISuggestion
}

// ============================================================================
// SUGGESTION RULES
// ============================================================================

const suggestionRules: SuggestionRule[] = [
  // Driving Style
  {
    id: 'aggressive-driving',
    condition: (form) => form.drivingStyle === 'aggressive',
    generate: (_, result) => ({
      id: 'aggressive-driving',
      title: 'Adopt a smoother driving style',
      description: 'Aggressive acceleration and braking can increase fuel consumption by 15-30%. Smooth driving habits could save you significantly.',
      potentialSaving: Math.round(result.costPerMonth * 0.15),
      difficulty: 'Easy',
      category: 'Behavior',
    }),
  },
  {
    id: 'normal-to-eco',
    condition: (form) => form.drivingStyle === 'normal',
    generate: (_, result) => ({
      id: 'normal-to-eco',
      title: 'Try eco-driving techniques',
      description: 'Anticipating traffic, maintaining steady speeds, and gentle acceleration can reduce fuel use by 5-10%.',
      potentialSaving: Math.round(result.costPerMonth * 0.07),
      difficulty: 'Easy',
      category: 'Behavior',
    }),
  },

  // AC Usage
  {
    id: 'high-ac-summer',
    condition: (form) => form.acUsage === 'always',
    generate: (_, result) => ({
      id: 'high-ac-summer',
      title: 'Park in shaded areas when possible',
      description: 'In UAE heat, parking in shade reduces cabin temperature, meaning your AC works less when you start driving.',
      potentialSaving: Math.round(result.costPerMonth * 0.03),
      difficulty: 'Easy',
      category: 'Maintenance',
    }),
  },
  {
    id: 'ac-optimization',
    condition: (form) => form.acUsage === 'always' || form.acUsage === 'mostly',
    generate: () => ({
      id: 'ac-optimization',
      title: 'Use recirculation mode',
      description: 'Setting AC to recirculate cooled air instead of pulling hot air from outside reduces compressor workload.',
      potentialSaving: 0,
      difficulty: 'Easy',
      category: 'Behavior',
    }),
  },

  // Traffic
  {
    id: 'heavy-traffic',
    condition: (form) => form.trafficLevel === 'heavy',
    generate: (_, result) => ({
      id: 'heavy-traffic',
      title: 'Adjust your commute timing',
      description: 'Rush hour traffic in Dubai/Abu Dhabi significantly increases fuel consumption. Even 30 minutes earlier or later can help.',
      potentialSaving: Math.round(result.costPerMonth * 0.08),
      difficulty: 'Medium',
      category: 'Behavior',
    }),
  },

  // Idle Time
  {
    id: 'high-idle',
    condition: (form) => parseInt(form.idleMinutes) > 15,
    generate: (form, result) => {
      const idleMinutes = parseInt(form.idleMinutes) || 10
      const savingPercent = Math.min((idleMinutes - 5) * 0.5, 10) / 100
      return {
        id: 'high-idle',
        title: 'Reduce idle time',
        description: `You idle ${idleMinutes} min/day. Turn off the engine when waiting more than 30 seconds - modern cars restart efficiently.`,
        potentialSaving: Math.round(result.costPerMonth * savingPercent),
        difficulty: 'Easy',
        category: 'Behavior',
      }
    },
  },

  // City Driving
  {
    id: 'city-driving',
    condition: (form) => form.environment === 'city',
    generate: (_, result) => ({
      id: 'city-driving',
      title: 'Combine short trips',
      description: 'Cold starts use more fuel. Combining errands into one trip instead of multiple short trips can save 10-15%.',
      potentialSaving: Math.round(result.costPerMonth * 0.1),
      difficulty: 'Medium',
      category: 'Behavior',
    }),
  },

  // High Mileage
  {
    id: 'high-mileage',
    condition: (form) => parseInt(form.distance) > 80,
    generate: () => ({
      id: 'high-mileage',
      title: 'Consider carpooling',
      description: 'With high daily mileage, sharing rides even 2 days a week could cut your fuel costs by 40% on those days.',
      potentialSaving: 0,
      difficulty: 'Medium',
      category: 'Lifestyle',
    }),
  },

  // Fuel Type Optimization
  {
    id: 'super98-check',
    condition: (form) => form.fuelType === 'super98',
    generate: () => ({
      id: 'super98-check',
      title: 'Check if Super 98 is required',
      description: 'Unless your car requires premium fuel (check manual), Special 95 works fine for most vehicles and costs less.',
      potentialSaving: 0,
      difficulty: 'Easy',
      category: 'Fuel',
    }),
  },

  // Efficiency-based
  {
    id: 'poor-efficiency',
    condition: (form) => parseFloat(form.efficiency) > 12,
    generate: () => ({
      id: 'poor-efficiency',
      title: 'Check tire pressure monthly',
      description: 'Under-inflated tires increase rolling resistance. Proper inflation can improve fuel economy by 3%.',
      potentialSaving: 0,
      difficulty: 'Easy',
      category: 'Maintenance',
    }),
  },
  {
    id: 'air-filter',
    condition: (form) => parseFloat(form.efficiency) > 10,
    generate: () => ({
      id: 'air-filter',
      title: 'Replace air filter regularly',
      description: 'A clogged air filter reduces engine efficiency. UAE dust means more frequent replacements needed.',
      potentialSaving: 0,
      difficulty: 'Easy',
      category: 'Maintenance',
    }),
  },

  // General tips (always show some)
  {
    id: 'fuel-timing',
    condition: () => true,
    generate: () => ({
      id: 'fuel-timing',
      title: 'Fill up during cooler hours',
      description: 'Fuel is denser when cool. Early morning fill-ups give you slightly more fuel per liter.',
      potentialSaving: 0,
      difficulty: 'Easy',
      category: 'Fuel',
    }),
  },
  {
    id: 'cruise-control',
    condition: (form) => form.environment === 'highway' || form.environment === 'mixed',
    generate: (_, result) => ({
      id: 'cruise-control',
      title: 'Use cruise control on highways',
      description: 'Maintaining constant speed is more fuel-efficient than fluctuating speeds. Use cruise control on Sheikh Zayed Road.',
      potentialSaving: Math.round(result.costPerMonth * 0.05),
      difficulty: 'Easy',
      category: 'Behavior',
    }),
  },
  {
    id: 'weight-reduction',
    condition: () => Math.random() > 0.5, // Show randomly to vary suggestions
    generate: () => ({
      id: 'weight-reduction',
      title: 'Remove unnecessary weight',
      description: 'Extra 50kg increases fuel consumption by 1-2%. Clear out heavy items from your boot.',
      potentialSaving: 0,
      difficulty: 'Easy',
      category: 'Maintenance',
    }),
  },
]

// ============================================================================
// SUMMARY GENERATORS
// ============================================================================

function generateSummary(form: FuelFormData, result: FuelResult, totalSaving: number): string {
  const efficiency = parseFloat(form.efficiency)
  const costPerKm = result.costPerKm
  const dailyKm = parseInt(form.distance) || 50
  
  // Contextual summary based on driving patterns
  if (form.drivingStyle === 'aggressive' && form.trafficLevel === 'heavy') {
    return `Your aggressive driving in heavy traffic conditions is costing you extra. By adjusting your driving style and timing, you could save around AED ${totalSaving}/month.`
  }
  
  if (efficiency > 12) {
    return `Your vehicle's fuel consumption (${efficiency}L/100km) is on the higher side. Focus on maintenance and driving habits to improve efficiency.`
  }
  
  if (costPerKm > 0.5) {
    return `At AED ${costPerKm.toFixed(2)}/km, your running costs are above average. Small changes in driving habits can make a noticeable difference.`
  }
  
  if (dailyKm > 100) {
    return `With ${dailyKm}km daily driving, even small efficiency improvements add up quickly. The tips below could help reduce your annual fuel bill.`
  }
  
  if (form.environment === 'city') {
    return `City driving typically uses 20-30% more fuel than highway driving. Combining trips and avoiding peak traffic can help reduce costs.`
  }
  
  return `Based on your ${dailyKm}km daily driving with ${efficiency}L/100km consumption, here are some ways to optimize your fuel spending.`
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function getInstantSuggestions(
  form: FuelFormData,
  result: FuelResult
): AIAnalysis {
  // Get applicable suggestions
  const applicableSuggestions: AISuggestion[] = []
  
  for (const rule of suggestionRules) {
    if (rule.condition(form, result)) {
      applicableSuggestions.push(rule.generate(form, result))
    }
  }
  
  // Remove duplicates by id
  const uniqueSuggestions = applicableSuggestions.reduce((acc, curr) => {
    if (!acc.find(s => s.id === curr.id)) {
      acc.push(curr)
    }
    return acc
  }, [] as AISuggestion[])
  
  // Sort by potential saving (highest first), then by difficulty (easy first)
  const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
    if (b.potentialSaving !== a.potentialSaving) {
      return b.potentialSaving - a.potentialSaving
    }
    const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 }
    return (difficultyOrder[a.difficulty] || 1) - (difficultyOrder[b.difficulty] || 1)
  })
  
  // Take top 5 most relevant
  const topSuggestions = sortedSuggestions.slice(0, 5)
  
  // Calculate total potential saving
  const totalSaving = topSuggestions.reduce((sum, s) => sum + s.potentialSaving, 0)
  
  return {
    suggestions: topSuggestions,
    summary: generateSummary(form, result, totalSaving),
    potentialMonthlySaving: totalSaving,
  }
}

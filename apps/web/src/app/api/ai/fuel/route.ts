/**
 * AI Fuel Analysis API
 * 
 * Analyzes driving patterns and provides personalized fuel-saving suggestions
 * Uses GPT-3.5-turbo for cost efficiency (~$0.0005 per request)
 */

import { NextResponse } from 'next/server'
import { analyzeFuelEfficiency, getFallbackAnalysis, type FuelAnalysisInput } from '@alifh/ai/fuel'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json() as FuelAnalysisInput

    // Validate required fields
    if (!body.vehicleName || !body.monthlyDistance || !body.monthlyFuelCost) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleName, monthlyDistance, monthlyFuelCost' },
        { status: 400 }
      )
    }

    // Analyze with AI (or fallback)
    const result = await analyzeFuelEfficiency(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fuel analysis error:', error)
    
    // Return fallback analysis on error
    try {
      const body = await request.json()
      const fallback = getFallbackAnalysis(body)
      return NextResponse.json(fallback)
    } catch {
      return NextResponse.json(
        { error: 'Failed to analyze fuel efficiency' },
        { status: 500 }
      )
    }
  }
}

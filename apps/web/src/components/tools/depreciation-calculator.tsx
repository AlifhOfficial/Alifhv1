'use client'

import { useState, useMemo } from 'react'
import { TrendingDown, Car, Calendar, Info, AlertTriangle, CheckCircle2, Globe } from 'lucide-react'
import { cn } from '@/utils'
import {
  UAE_DEPRECIATION_CONFIG,
  formatAED,
} from '@/data/uae-automotive-config'

type SpecsOrigin = 'gcc' | 'american' | 'european' | 'japanese' | 'korean' | 'other'
type BrandCategory = keyof typeof UAE_DEPRECIATION_CONFIG.brandCategory
type Condition = 'excellent' | 'good' | 'fair' | 'poor'

interface YearlyData {
  year: number
  age: number
  value: number
  depreciation: number
  percentRetained: number
}

interface DepreciationResult {
  yearlyData: YearlyData[]
  currentValue: number
  totalDepreciation: number
  percentLost: number
  averageYearlyDepreciation: number
  insights: string[]
}

// Brand to category mapping
const BRAND_CATEGORIES: Record<string, BrandCategory> = {
  'Toyota': 'premium_resilient',
  'Lexus': 'premium_resilient',
  'Nissan': 'mainstream_reliable',
  'Honda': 'mainstream_reliable',
  'Mazda': 'mainstream_reliable',
  'Hyundai': 'mainstream_reliable',
  'Kia': 'mainstream_reliable',
  'Mitsubishi': 'mainstream_reliable',
  'Mercedes-Benz': 'luxury_german',
  'BMW': 'luxury_german',
  'Audi': 'luxury_german',
  'Porsche': 'luxury_german',
  'Volkswagen': 'luxury_german',
  'Range Rover': 'luxury_british',
  'Land Rover': 'luxury_british',
  'Jaguar': 'luxury_british',
  'Bentley': 'luxury_british',
  'Rolls-Royce': 'luxury_british',
  'Ford': 'american',
  'Chevrolet': 'american',
  'GMC': 'american',
  'Dodge': 'american',
  'Jeep': 'american',
  'Cadillac': 'american',
  'Ferrari': 'exotic',
  'Lamborghini': 'exotic',
  'McLaren': 'exotic',
  'Aston Martin': 'exotic',
  'Maserati': 'exotic',
}

const POPULAR_BRANDS = [
  'Toyota', 'Nissan', 'Honda', 'Lexus', 'Mercedes-Benz', 'BMW', 
  'Audi', 'Range Rover', 'Porsche', 'Ford', 'Chevrolet', 'Hyundai', 'Kia'
]

export function DepreciationCalculator() {
  const [formData, setFormData] = useState({
    purchasePrice: '',
    yearBought: '2022',
    brand: 'Toyota',
    specs: 'gcc' as SpecsOrigin,
    condition: 'good' as Condition,
    mileagePerYear: '20000',
  })

  const [result, setResult] = useState<DepreciationResult | null>(null)

  const currentYear = 2026

  const handleCalculate = () => {
    const price = parseFloat(formData.purchasePrice)
    const startYear = parseInt(formData.yearBought)
    const mileagePerYear = parseInt(formData.mileagePerYear)
    
    if (!price || price <= 0 || !startYear) return

    const config = UAE_DEPRECIATION_CONFIG
    
    // Get brand category
    const brandCategory = BRAND_CATEGORIES[formData.brand] || 'mainstream_reliable'
    const brandMultiplier = config.brandCategory[brandCategory].multiplier
    
    // Get specs multiplier
    const specsMultiplier = config.specsMultiplier[formData.specs].multiplier
    
    // Get condition multiplier (applied to final value)
    const conditionMultiplier = config.conditionMultiplier[formData.condition].multiplier
    
    // Mileage adjustment
    const avgMileage = config.mileageImpact.averageAnnualKm
    const yearsOwned = currentYear - startYear
    const totalMileage = mileagePerYear * yearsOwned
    const expectedMileage = avgMileage * yearsOwned
    const mileageDiff = (totalMileage - expectedMileage) / 10000
    let mileageAdjustment = 0
    if (mileageDiff > 0) {
      mileageAdjustment = Math.min(mileageDiff * config.mileageImpact.adjustmentPerExcess10k, config.mileageImpact.maxAdjustment)
    } else {
      mileageAdjustment = Math.max(mileageDiff * Math.abs(config.mileageImpact.adjustmentPerUnder10k), -config.mileageImpact.maxAdjustment)
    }

    // Calculate year by year
    const yearlyData: YearlyData[] = []
    let currentValue = price

    for (let i = 0; i <= Math.min(currentYear - startYear, 10); i++) {
      if (i === 0) {
        yearlyData.push({
          year: startYear,
          age: 0,
          value: price,
          depreciation: 0,
          percentRetained: 100,
        })
        continue
      }

      // Get base depreciation rate for this year
      let baseRate: number
      if (i === 1) baseRate = config.standardCurve.year1
      else if (i === 2) baseRate = config.standardCurve.year2
      else if (i === 3) baseRate = config.standardCurve.year3
      else if (i === 4) baseRate = config.standardCurve.year4
      else if (i === 5) baseRate = config.standardCurve.year5
      else baseRate = config.standardCurve.year6Plus

      // Apply multipliers
      const adjustedRate = baseRate * brandMultiplier * specsMultiplier

      const depreciation = currentValue * adjustedRate
      currentValue = currentValue - depreciation

      yearlyData.push({
        year: startYear + i,
        age: i,
        value: currentValue,
        depreciation,
        percentRetained: (currentValue / price) * 100,
      })
    }

    // Apply condition and mileage adjustments to final value
    const lastEntry = yearlyData[yearlyData.length - 1]
    const finalAdjustment = conditionMultiplier * (1 - mileageAdjustment)
    const adjustedFinalValue = lastEntry.value * finalAdjustment

    // Generate insights
    const insights: string[] = []
    
    const brandInfo = config.brandCategory[brandCategory]
    insights.push(brandInfo.description)
    
    const specsInfo = config.specsMultiplier[formData.specs]
    if (formData.specs !== 'gcc') {
      insights.push(`${specsInfo.description}: ${specsInfo.notes}`)
    }
    
    if (mileageDiff > 2) {
      insights.push(`High mileage (${Math.round(mileageDiff * 10)}k over average) reduces value by ~${Math.round(mileageAdjustment * 100)}%`)
    } else if (mileageDiff < -2) {
      insights.push(`Low mileage adds ~${Math.round(Math.abs(mileageAdjustment) * 100)}% to value`)
    }

    if (formData.condition === 'excellent') {
      insights.push('Excellent condition with full service history adds ~10% to value')
    } else if (formData.condition === 'poor') {
      insights.push('Poor condition significantly impacts resale value (-25%)')
    }

    setResult({
      yearlyData,
      currentValue: adjustedFinalValue,
      totalDepreciation: price - adjustedFinalValue,
      percentLost: ((price - adjustedFinalValue) / price) * 100,
      averageYearlyDepreciation: (price - adjustedFinalValue) / (currentYear - startYear),
      insights,
    })
  }

  return (
    <div className="space-y-6">
      {/* Specs Origin - Important for UAE */}
      <div>
        <label className="flex items-center gap-2 text-subhead mb-3">
          <Globe className="w-4 h-4" />
          Vehicle Specs Origin
          <span className="text-caption1 text-warning font-normal">(Major impact on resale)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'gcc', label: 'GCC Spec', flag: '🇦🇪' },
            { id: 'american', label: 'American', flag: '🇺🇸' },
            { id: 'european', label: 'European', flag: '🇪🇺' },
            { id: 'japanese', label: 'Japanese', flag: '🇯🇵' },
            { id: 'korean', label: 'Korean', flag: '🇰🇷' },
            { id: 'other', label: 'Other/Unknown', flag: '❓' },
          ].map((spec) => (
            <button
              key={spec.id}
              onClick={() => setFormData({ ...formData, specs: spec.id as SpecsOrigin })}
              className={cn(
                "p-3 rounded-lg border text-center transition-all",
                formData.specs === spec.id
                  ? "bg-primary/5 border-primary ring-1 ring-primary"
                  : "bg-background border-border "
              )}
            >
              <span className="text-headline">{spec.flag}</span>
              <p className="text-caption1 mt-1">{spec.label}</p>
            </button>
          ))}
        </div>
        <p className="text-caption1 text-muted-foreground mt-2">
          💡 GCC specs hold value best due to warranty support and climate optimization
        </p>
      </div>

      {/* Purchase Price */}
      <div>
        <label className="text-subhead mb-2 block">Original Purchase Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            AED
          </span>
          <input
            type="number"
            placeholder="150,000"
            className="w-full pl-14 pr-4 py-3 border border-border rounded-lg text-headline font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
          />
        </div>
      </div>

      {/* Year & Brand Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-subhead mb-2">
            <Calendar className="w-4 h-4" />
            Year Bought
          </label>
          <select
            className="w-full px-4 py-3 border border-border rounded-lg font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            value={formData.yearBought}
            onChange={(e) => setFormData({ ...formData, yearBought: e.target.value })}
          >
            {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-subhead mb-2">
            <Car className="w-4 h-4" />
            Brand
          </label>
          <select
            className="w-full px-4 py-3 border border-border rounded-lg font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          >
            {POPULAR_BRANDS.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="text-subhead mb-3 block">Vehicle Condition</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'excellent', label: 'Excellent', color: 'text-success' },
            { id: 'good', label: 'Good', color: 'text-primary' },
            { id: 'fair', label: 'Fair', color: 'text-warning' },
            { id: 'poor', label: 'Poor', color: 'text-destructive' },
          ].map((cond) => (
            <button
              key={cond.id}
              onClick={() => setFormData({ ...formData, condition: cond.id as Condition })}
              className={cn(
                "p-3 rounded-lg border transition-all",
                formData.condition === cond.id
                  ? "bg-primary/5 border-primary"
                  : "bg-background border-border "
              )}
            >
              <p className={cn("text-subhead", formData.condition === cond.id && cond.color)}>
                {cond.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Annual Mileage */}
      <div>
        <label className="flex items-center justify-between mb-2">
          <span className="text-subhead">Average Annual Mileage</span>
          <span className="text-caption1 font-semibold text-primary">
            {parseInt(formData.mileagePerYear).toLocaleString()} km/year
          </span>
        </label>
        <input
          type="range"
          min="5000"
          max="40000"
          step="1000"
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          value={formData.mileagePerYear}
          onChange={(e) => setFormData({ ...formData, mileagePerYear: e.target.value })}
        />
        <div className="flex justify-between text-caption1 text-muted-foreground mt-1">
          <span>5k km (Low)</span>
          <span className="text-primary">UAE avg: 20k km</span>
          <span>40k km (High)</span>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!formData.purchasePrice}
        className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <TrendingDown className="w-5 h-5" />
        Calculate Depreciation
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Current Value */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <p className="text-subhead text-muted-foreground mb-2">
              Estimated Current Value ({currentYear})
            </p>
            <p className="text-display font-bold text-primary">
              {formatAED(result.currentValue)}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-subhead text-destructive font-medium">
                -{formatAED(result.totalDepreciation)} ({result.percentLost.toFixed(1)}% lost)
              </span>
              <span className="text-caption1 text-muted-foreground">
                ~{formatAED(result.averageYearlyDepreciation)}/year avg
              </span>
            </div>
          </div>

          {/* Depreciation Chart */}
          <div className="border rounded-lg p-4">
            <p className="text-subhead mb-4">Value Over Time</p>
            <div className="space-y-2">
              {result.yearlyData.map((row) => (
                <div key={row.year} className="flex items-center gap-3">
                  <span className="text-caption1 w-10 text-muted-foreground">{row.year}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                      style={{ width: `${row.percentRetained}%` }}
                    />
                  </div>
                  <span className="text-caption1 w-24 text-right font-medium">
                    {formatAED(row.value)}
                  </span>
                  {row.depreciation > 0 && (
                    <span className="text-caption1 w-20 text-right text-destructive">
                      -{formatAED(row.depreciation)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 bg-primary-muted bg-primary-muted border border-primary/20 border-primary/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-subhead text-primary mb-2">
                  Value Factors
                </p>
                <ul className="text-caption1 text-primary space-y-1">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-caption1 text-muted-foreground">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Estimates based on UAE market trends. Actual values vary by specific model, 
              features, service history, and market conditions. Get professional valuations for selling.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

/**
 * Fuel Cost Calculator
 * 
 * Clean, step-based calculator for UAE drivers
 * Glass/Glassmorphic UI style
 */

import { useState, useMemo, useCallback } from 'react'
import { Fuel, TrendingDown, TrendingUp, Lightbulb, RotateCcw } from 'lucide-react'
import { cn } from '@/utils'
import { Combobox } from '@/components/ui/forms/combobox'
import { CAR_MAKES, CAR_MODELS } from '@alifh/database/listing-constants'
import { UAE_FUEL_PRICES } from '@/data/uae-automotive-config'

import type { FuelFormData, FuelResult, TripResult, AIAnalysis } from './types'
import { POPULAR_VEHICLES, UAE_ROUTES, TIME_PERIODS } from './config'
import { calculateFuelCost, calculateTripCost, formatAED } from './calculations'
import { getInstantSuggestions } from './suggestions'

// ============================================================================
// Generate years (1900-current+1) - supports vintage cars
// ============================================================================
const currentYearFuel = new Date().getFullYear()
const years = Array.from({ length: currentYearFuel - 1900 + 2 }, (_, i) => currentYearFuel + 1 - i)

// ============================================================================
// SHARED UI COMPONENTS (matching car-valuation-tool)
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-subhead font-bold tracking-tight text-foreground">{title}</h3>
  )
}

function FieldWrapper({ 
  label, 
  required, 
  hint, 
  children 
}: { 
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-subhead font-semibold text-muted-foreground/70">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {hint && (
          <span className="text-caption1 text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function PillOptions({ 
  value, 
  onChange, 
  options,
  columns = 3,
}: { 
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  columns?: number
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-11 px-3 rounded-lg text-subhead transition-colors",
            value === opt.value
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  prefix,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suffix?: string
  prefix?: string
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-caption1 text-muted-foreground/70">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-foreground",
          "outline-none transition-colors text-subhead",
          "placeholder:text-muted-foreground/40",
          prefix ? "pl-12" : "px-0",
          suffix ? "pr-14" : "pr-0"
        )}
      />
      {suffix && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-caption1 text-muted-foreground/70">
          {suffix}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// FUEL PRICES BANNER - Glass Style
// ============================================================================

function FuelPricesBanner({ 
  selected, 
  onSelect 
}: { 
  selected: string
  onSelect: (id: string) => void 
}) {
  const fuelTypes = [
    { id: 'super98', name: 'Super 98', price: UAE_FUEL_PRICES.super98 },
    { id: 'special95', name: 'Special 95', price: UAE_FUEL_PRICES.special95 },
    { id: 'e_plus91', name: 'E-Plus 91', price: UAE_FUEL_PRICES.e_plus91 },
    { id: 'diesel', name: 'Diesel', price: UAE_FUEL_PRICES.diesel },
  ]

  return (
    <div className="p-4 backdrop-blur-sm bg-background/60 border border-border/40 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-muted-foreground" />
          <span className="text-subhead">UAE Fuel Prices</span>
        </div>
        <span className="text-caption1 text-muted-foreground">
          {new Date(UAE_FUEL_PRICES.effectiveDate).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {fuelTypes.map((fuel) => (
          <button
            key={fuel.id}
            onClick={() => onSelect(fuel.id)}
            className={cn(
              "p-2.5 rounded-lg border text-center transition-all backdrop-blur-sm",
              selected === fuel.id
                ? "border-foreground bg-foreground/5"
                : "border-border/40 bg-background/40 hover:border-foreground/30"
            )}
          >
            <div className="text-caption2 text-muted-foreground mb-0.5">{fuel.name}</div>
            <div className="text-subhead font-bold">{fuel.price.toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground">AED/L</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialFormData: FuelFormData = {
  make: '',
  model: '',
  year: '',
  fuelType: 'special95',
  efficiency: '',
  distance: '',
  timePeriod: 'monthly',
  customDays: '30',
  drivingStyle: 'normal',
  environment: 'mixed',
  acUsage: 'mostly',
  trafficLevel: 'moderate',
  idleMinutes: '10',
  tripDistance: '',
  tripType: 'round_trip',
  currentSpending: '',
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FuelCostCalculator() {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'estimate' | 'trip'>('estimate')
  const [formData, setFormData] = useState<FuelFormData>(initialFormData)
  const [result, setResult] = useState<FuelResult | null>(null)
  const [tripResult, setTripResult] = useState<TripResult | null>(null)
  const [suggestions, setSuggestions] = useState<AIAnalysis | null>(null)

  // Get models for selected make
  const availableModels = useMemo(() => {
    if (!formData.make) return []
    return CAR_MODELS[formData.make] || []
  }, [formData.make])

  // Check if vehicle has preset data
  const vehiclePreset = useMemo(() => {
    if (!formData.make || !formData.model) return null
    return POPULAR_VEHICLES.find(
      v => v.make === formData.make && v.model === formData.model
    )
  }, [formData.make, formData.model])

  // Update form field
  const update = useCallback((field: keyof FuelFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // If make changed, reset model
      if (field === 'make') {
        updated.model = ''
        updated.efficiency = ''
        updated.fuelType = 'special95'
      }
      
      // If model selected and we have preset data, auto-fill
      if (field === 'model' && value) {
        const preset = POPULAR_VEHICLES.find(
          v => v.make === prev.make && v.model === value
        )
        if (preset) {
          updated.efficiency = String(preset.efficiency)
          updated.fuelType = preset.fuelType
        }
      }
      
      return updated
    })
    
    // Reset results when form changes
    setResult(null)
    setTripResult(null)
    setSuggestions(null)
  }, [])

  // Calculate
  const handleCalculate = useCallback(() => {
    if (mode === 'trip') {
      const trip = calculateTripCost(formData)
      setTripResult(trip)
      setResult(null)
      setSuggestions(null)
      setStep(4)
    } else {
      const calc = calculateFuelCost(formData)
      setResult(calc)
      setTripResult(null)
      
      // Get instant suggestions (no API call)
      if (calc) {
        const tips = getInstantSuggestions(formData, calc)
        setSuggestions(tips)
      }
      
      setStep(4)
    }
  }, [formData, mode])

  // Reset
  const handleReset = useCallback(() => {
    setFormData(initialFormData)
    setStep(1)
    setResult(null)
    setTripResult(null)
    setSuggestions(null)
  }, [])

  // Validation
  const isStep1Valid = formData.make && formData.model && formData.efficiency
  const isStep2Valid = mode === 'trip' 
    ? !!formData.tripDistance 
    : !!formData.distance

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-title2 font-bold tracking-tight mb-1">Fuel Cost Calculator</h1>
        <p className="text-subhead text-muted-foreground/70">
          Estimate your driving costs with real UAE fuel prices
        </p>
      </div>

      {/* Fuel Prices Banner */}
      <FuelPricesBanner 
        selected={formData.fuelType}
        onSelect={(id) => update('fuelType', id as FuelFormData['fuelType'])}
      />

      {/* Progress Steps */}
      <div className="flex gap-2 mt-6 mb-6">
        {[1, 2, 3, 4].map(s => (
          <button
            key={s}
            onClick={() => s < step && setStep(s)}
            disabled={s > step}
            className={cn(
              "h-1.5 rounded-full transition-all",
              step === s ? 'bg-foreground flex-[2]' : step > s ? 'bg-foreground/40 flex-1' : 'bg-muted flex-1'
            )}
          />
        ))}
      </div>

      {/* Step 1: Vehicle Selection */}
      {step === 1 && (
        <section className="space-y-6">
          <SectionHeader title="Your Vehicle" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-5">
            <FieldWrapper label="Make" required>
              <Combobox
                options={CAR_MAKES.filter(m => m !== 'Other').map(m => ({ value: m, label: m }))}
                value={formData.make}
                onValueChange={(v) => update('make', v)}
                placeholder="Search make..."
                searchPlaceholder="Search makes..."
                emptyText="No make found."
              />
            </FieldWrapper>

            <FieldWrapper label="Model" required>
              <Combobox
                options={availableModels.map(m => ({ value: m, label: m }))}
                value={formData.model}
                onValueChange={(v) => update('model', v)}
                placeholder={formData.make ? 'Search model...' : 'Select make first'}
                searchPlaceholder="Search models..."
                emptyText="No model found."
                disabled={!formData.make}
              />
            </FieldWrapper>

            <FieldWrapper label="Year">
              <Combobox
                options={years.map(y => ({ value: y.toString(), label: y.toString() }))}
                value={formData.year}
                onValueChange={(v) => update('year', v)}
                placeholder="Select year"
                searchPlaceholder="Search year..."
                emptyText="No year found."
              />
            </FieldWrapper>

            <FieldWrapper 
              label="Fuel Efficiency" 
              required
              hint={vehiclePreset ? 'Auto-filled' : 'Check manual'}
            >
              <NumberInput
                value={formData.efficiency}
                onChange={(v) => update('efficiency', v)}
                placeholder="8.5"
                suffix="L/100km"
              />
            </FieldWrapper>

            <FieldWrapper label="Fuel Type" required>
              <PillOptions
                value={formData.fuelType}
                onChange={(v) => update('fuelType', v as FuelFormData['fuelType'])}
                options={[
                  { value: 'super98', label: 'Super 98' },
                  { value: 'special95', label: 'Special 95' },
                  { value: 'e_plus91', label: 'E-Plus 91' },
                  { value: 'diesel', label: 'Diesel' },
                ]}
                columns={4}
              />
            </FieldWrapper>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full py-3.5 rounded-full bg-foreground text-background text-subhead font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}

      {/* Step 2: Distance & Mode */}
      {step === 2 && (
        <section className="space-y-6">
          <SectionHeader title="Driving Distance" />
          
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode('estimate')}
              className={cn(
                "flex-1 py-2.5 text-subhead rounded-md transition-colors",
                mode === 'estimate' ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              Regular Estimate
            </button>
            <button
              onClick={() => setMode('trip')}
              className={cn(
                "flex-1 py-2.5 text-subhead rounded-md transition-colors",
                mode === 'trip' ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              Single Trip
            </button>
          </div>

          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-5">
            {mode === 'estimate' ? (
              <>
                <FieldWrapper label="Daily Distance" required hint="Average km per day">
                  <NumberInput
                    value={formData.distance}
                    onChange={(v) => update('distance', v)}
                    placeholder="50"
                    suffix="km/day"
                  />
                </FieldWrapper>

                <FieldWrapper label="Calculate For">
                  <PillOptions
                    value={formData.timePeriod}
                    onChange={(v) => update('timePeriod', v as FuelFormData['timePeriod'])}
                    options={TIME_PERIODS.filter(p => p.value !== 'custom').map(p => ({ 
                      value: p.value, 
                      label: p.label 
                    }))}
                    columns={4}
                  />
                </FieldWrapper>
              </>
            ) : (
              <>
                <FieldWrapper label="Trip Distance" required>
                  <NumberInput
                    value={formData.tripDistance}
                    onChange={(v) => update('tripDistance', v)}
                    placeholder="140"
                    suffix="km"
                  />
                </FieldWrapper>

                {/* Quick Routes */}
                <div className="space-y-2">
                  <label className="text-caption1 text-muted-foreground/70">Popular Routes</label>
                  <div className="flex flex-wrap gap-2">
                    {UAE_ROUTES.slice(0, 4).map(route => (
                      <button
                        key={route.name}
                        type="button"
                        onClick={() => update('tripDistance', String(route.distance))}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-caption1 transition-colors",
                          formData.tripDistance === String(route.distance)
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {route.name} ({route.distance}km)
                      </button>
                    ))}
                  </div>
                </div>

                <FieldWrapper label="Trip Type">
                  <PillOptions
                    value={formData.tripType}
                    onChange={(v) => update('tripType', v as 'one_way' | 'round_trip')}
                    options={[
                      { value: 'one_way', label: 'One Way' },
                      { value: 'round_trip', label: 'Round Trip' },
                    ]}
                    columns={2}
                  />
                </FieldWrapper>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 rounded-full bg-muted text-muted-foreground text-subhead font-semibold hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => mode === 'trip' ? handleCalculate() : setStep(3)}
              disabled={!isStep2Valid}
              className="flex-[2] py-3.5 rounded-full bg-foreground text-background text-subhead font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
            >
              {mode === 'trip' ? 'Calculate Trip Cost' : 'Continue'}
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Driving Habits (Estimate mode only) */}
      {step === 3 && mode === 'estimate' && (
        <section className="space-y-6">
          <SectionHeader title="Driving Habits" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-5">
            <FieldWrapper label="Driving Style">
              <PillOptions
                value={formData.drivingStyle}
                onChange={(v) => update('drivingStyle', v as FuelFormData['drivingStyle'])}
                options={[
                  { value: 'eco', label: 'Eco' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'aggressive', label: 'Aggressive' },
                ]}
                columns={3}
              />
            </FieldWrapper>

            <FieldWrapper label="Driving Environment">
              <PillOptions
                value={formData.environment}
                onChange={(v) => update('environment', v as FuelFormData['environment'])}
                options={[
                  { value: 'city', label: 'City' },
                  { value: 'mixed', label: 'Mixed' },
                  { value: 'highway', label: 'Highway' },
                ]}
                columns={3}
              />
            </FieldWrapper>

            <FieldWrapper label="AC Usage" hint="UAE climate factor">
              <PillOptions
                value={formData.acUsage}
                onChange={(v) => update('acUsage', v as FuelFormData['acUsage'])}
                options={[
                  { value: 'rarely', label: 'Rarely' },
                  { value: 'sometimes', label: 'Sometimes' },
                  { value: 'mostly', label: 'Mostly' },
                  { value: 'always', label: 'Always' },
                ]}
                columns={4}
              />
            </FieldWrapper>

            <FieldWrapper label="Traffic Level" hint="Typical conditions">
              <PillOptions
                value={formData.trafficLevel}
                onChange={(v) => update('trafficLevel', v as FuelFormData['trafficLevel'])}
                options={[
                  { value: 'low', label: 'Light' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'heavy', label: 'Heavy' },
                ]}
                columns={3}
              />
            </FieldWrapper>

            <FieldWrapper label="Daily Idle Time" hint="Waiting with engine on">
              <NumberInput
                value={formData.idleMinutes}
                onChange={(v) => update('idleMinutes', v)}
                placeholder="10"
                suffix="min/day"
              />
            </FieldWrapper>
          </div>

          {/* Optional: Current Spending */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <FieldWrapper 
              label="Current Monthly Spending" 
              hint="Optional - for comparison"
            >
              <NumberInput
                value={formData.currentSpending}
                onChange={(v) => update('currentSpending', v)}
                placeholder="800"
                prefix="AED"
                suffix="/month"
              />
            </FieldWrapper>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3.5 rounded-full bg-muted text-muted-foreground text-subhead font-semibold hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              className="flex-[2] py-3.5 rounded-full bg-foreground text-background text-subhead font-semibold hover:bg-foreground/90 transition-colors"
            >
              Calculate Costs
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Results */}
      {step === 4 && (result || tripResult) && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionHeader title="Your Results" />
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-caption1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start Over
            </button>
          </div>

          {/* Trip Result */}
          {tripResult && (
            <div className="rounded-xl border border-border/40 backdrop-blur-sm bg-background/60 p-6 text-center">
              <p className="text-subhead text-muted-foreground mb-2">
                {formData.tripType === 'round_trip' ? 'Round Trip' : 'One Way'} Cost
              </p>
              <p className="text-display font-bold mb-1">{formatAED(tripResult.cost)}</p>
              <p className="text-subhead text-muted-foreground">
                {tripResult.distance} km · {tripResult.fuelNeeded}L fuel needed
              </p>
            </div>
          )}

          {/* Estimate Results */}
          {result && (
            <>
              {/* Primary Result - Glass Card */}
              <div className="rounded-xl border border-border/40 backdrop-blur-sm bg-background/60 p-6 text-center">
                <p className="text-subhead text-muted-foreground mb-2">
                  {TIME_PERIODS.find(p => p.value === formData.timePeriod)?.label} Cost
                </p>
                <p className="text-display font-bold mb-1">
                  {formatAED(result.totalCost)}
                </p>
                <p className="text-subhead text-muted-foreground">
                  {result.fuelConsumed}L fuel · {result.adjustedEfficiency} L/100km adjusted
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                  <p className="text-caption1 text-muted-foreground mb-1">Per Day</p>
                  <p className="text-headline font-semibold">{formatAED(result.costPerDay)}</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                  <p className="text-caption1 text-muted-foreground mb-1">Per Week</p>
                  <p className="text-headline font-semibold">{formatAED(result.costPerWeek)}</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                  <p className="text-caption1 text-muted-foreground mb-1">Per Month</p>
                  <p className="text-headline font-semibold">{formatAED(result.costPerMonth)}</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                  <p className="text-caption1 text-muted-foreground mb-1">Per Year</p>
                  <p className="text-headline font-semibold">{formatAED(result.costPerYear)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-subhead text-muted-foreground">Cost per km</span>
                  <span className="text-subhead font-semibold">AED {result.costPerKm.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-subhead text-muted-foreground">Tank Fills</span>
                  <span className="text-subhead font-semibold">{result.tankFills}x</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-subhead text-muted-foreground">Range per Tank</span>
                  <span className="text-subhead font-semibold">{result.rangePerTank} km</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-subhead text-muted-foreground">CO2 Emissions</span>
                  <span className="text-subhead font-semibold">{result.co2Emissions} kg</span>
                </div>
              </div>

              {/* Comparison */}
              {result.comparison && (
                <div className="rounded-xl border border-border/40 bg-sidebar p-5">
                  <div className="flex items-center gap-3">
                    {result.comparison.isOverspending ? (
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-subhead font-semibold">
                        {result.comparison.isOverspending 
                          ? `You may be overspending by ${formatAED(result.comparison.difference)}/month`
                          : `You're spending ${formatAED(result.comparison.difference)}/month less than calculated`
                        }
                      </p>
                      <p className="text-caption1 text-muted-foreground">
                        {result.comparison.percentDiff.toFixed(0)}% {result.comparison.isOverspending ? 'above' : 'below'} calculated estimate
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions - Instant, no API */}
              {suggestions && suggestions.suggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    <SectionHeader title="Saving Tips" />
                  </div>
                  
                  {/* Summary */}
                  <div className="rounded-xl border border-border/40 bg-sidebar p-4">
                    <p className="text-subhead">{suggestions.summary}</p>
                    {suggestions.potentialMonthlySaving > 0 && (
                      <p className="text-caption1 text-muted-foreground mt-2">
                        Potential monthly savings: <span className="font-semibold">{formatAED(suggestions.potentialMonthlySaving)}</span>
                      </p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-3">
                    {suggestions.suggestions.slice(0, 4).map((suggestion, i) => (
                      <div 
                        key={suggestion.id || i}
                        className="rounded-xl border border-border/40 bg-sidebar p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-subhead font-semibold mb-1">{suggestion.title}</p>
                            <p className="text-caption1 text-muted-foreground">{suggestion.description}</p>
                          </div>
                          {suggestion.potentialSaving > 0 && (
                            <div className="text-right shrink-0">
                              <p className="text-subhead font-semibold">
                                -{formatAED(suggestion.potentialSaving)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">/month</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            {suggestion.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}

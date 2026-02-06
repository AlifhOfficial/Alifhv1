'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/utils'
import { Combobox } from '@/components/ui/forms/combobox'
import {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  EXTERIOR_COLORS,
} from '@alifh/database/listing-constants'

// Generate year options (2000-2026)
const years = Array.from({ length: 27 }, (_, i) => 2026 - i)

// ============================================================================
// Shared Components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
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
        <label className="text-sm font-semibold text-muted-foreground/70">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && (
          <span className="text-xs text-muted-foreground/70">{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ============================================================================
// Car Valuation Tool
// ============================================================================

export function CarValuationTool() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    make: '',
    model: '',
    year: '',
    // Key Specs
    bodyType: '',
    fuelType: '',
    transmission: '',
    specs: '',
    // Condition
    mileage: '',
    condition: '',
    accidents: '',
    owners: '',
    serviceHistory: '',
    // Additional
    color: '',
    warranty: '',
  })

  const [result, setResult] = useState<{
    low: number
    mid: number
    high: number
    factors: { label: string; impact: string; positive: boolean }[]
  } | null>(null)

  // Get models for selected make
  const availableModels = useMemo(() => {
    if (!formData.make) return []
    return CAR_MODELS[formData.make] || []
  }, [formData.make])

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'make') {
      setFormData(prev => ({ ...prev, [field]: value, model: '' }))
    }
  }

  const handleCalculate = () => {
    if (!formData.year || !formData.mileage) return

    let basePrice = 80000
    const carAge = 2026 - parseInt(formData.year)
    const mileageNum = parseInt(formData.mileage.replace(/,/g, ''))

    const yearDepreciation = carAge <= 3 
      ? carAge * 0.15 
      : 0.45 + (carAge - 3) * 0.08

    const avgMileagePerYear = 15000
    const expectedMileage = carAge * avgMileagePerYear
    const mileageDiff = mileageNum - expectedMileage
    const mileageImpact = (mileageDiff / 10000) * 0.02

    const conditionMultipliers: Record<string, number> = {
      excellent: 1.1, good: 1.0, fair: 0.85, poor: 0.65,
    }
    const conditionMult = conditionMultipliers[formData.condition] || 1

    const specsPremiums: Record<string, number> = {
      gcc: 0.08, american: -0.05, european: 0.02, japanese: -0.03,
    }
    const specsPremium = specsPremiums[formData.specs] || 0

    const accidentImpacts: Record<string, number> = {
      none: 0, minor: -0.08, moderate: -0.18, major: -0.35,
    }
    const accidentImpact = accidentImpacts[formData.accidents] || 0

    const ownerImpacts: Record<string, number> = {
      '1': 0.05, '2': 0, '3': -0.05, '4+': -0.1,
    }
    const ownerImpact = ownerImpacts[formData.owners] || 0

    const serviceImpacts: Record<string, number> = {
      full: 0.08, partial: 0, none: -0.1,
    }
    const serviceImpact = serviceImpacts[formData.serviceHistory] || 0

    const warrantyBonus = formData.warranty === 'yes' ? 0.05 : 0

    const fuelPremiums: Record<string, number> = {
      electric: 0.1, hybrid: 0.05, plugin_hybrid: 0.07, petrol: 0, diesel: -0.03,
    }
    const fuelPremium = fuelPremiums[formData.fuelType] || 0

    const totalMultiplier = 
      (1 - yearDepreciation - mileageImpact) * 
      conditionMult * 
      (1 + specsPremium + accidentImpact + ownerImpact + serviceImpact + warrantyBonus + fuelPremium)

    const estimatedValue = Math.max(basePrice * totalMultiplier, 5000)
    const roundedValue = Math.round(estimatedValue / 1000) * 1000

    const factors: { label: string; impact: string; positive: boolean }[] = []
    
    if (formData.specs === 'gcc') factors.push({ label: 'GCC Specs', impact: '+8%', positive: true })
    if (formData.specs === 'american') factors.push({ label: 'American Specs', impact: '-5%', positive: false })
    if (formData.condition === 'excellent') factors.push({ label: 'Excellent Condition', impact: '+10%', positive: true })
    if (formData.condition === 'poor') factors.push({ label: 'Poor Condition', impact: '-35%', positive: false })
    if (formData.accidents === 'none') factors.push({ label: 'Accident Free', impact: 'Preserved', positive: true })
    if (formData.accidents === 'major') factors.push({ label: 'Major Accident', impact: '-35%', positive: false })
    if (formData.owners === '1') factors.push({ label: 'Single Owner', impact: '+5%', positive: true })
    if (formData.serviceHistory === 'full') factors.push({ label: 'Full Service History', impact: '+8%', positive: true })
    if (formData.warranty === 'yes') factors.push({ label: 'Under Warranty', impact: '+5%', positive: true })
    if (mileageDiff < -20000) factors.push({ label: 'Low Mileage', impact: '+Value', positive: true })
    if (mileageDiff > 30000) factors.push({ label: 'High Mileage', impact: '-Value', positive: false })

    setResult({
      low: Math.round(roundedValue * 0.9 / 1000) * 1000,
      mid: roundedValue,
      high: Math.round(roundedValue * 1.12 / 1000) * 1000,
      factors,
    })
  }

  const isStep1Valid = formData.make && formData.model && formData.year
  const isStep2Valid = formData.bodyType && formData.fuelType && formData.transmission
  const isStep3Valid = formData.mileage && formData.condition && formData.accidents && formData.owners

  // Pill option selector
  const PillOptions = ({ 
    value, 
    onChange, 
    options,
    columns = 3,
  }: { 
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    columns?: number
  }) => (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-11 px-3 rounded-lg text-sm font-medium transition-colors",
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

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Car Valuation</h1>
        <p className="text-sm text-muted-foreground/70">
          Get an accurate market estimate in minutes
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              step === s ? 'bg-foreground flex-[2]' : step > s ? 'bg-foreground/40 flex-1' : 'bg-muted flex-1'
            )}
          />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <section className="space-y-6">
          <SectionHeader title="Basic Information" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-6">
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

            <FieldWrapper label="Year" required>
              <Combobox
                options={years.map(y => ({ value: y.toString(), label: y.toString() }))}
                value={formData.year}
                onValueChange={(v) => update('year', v)}
                placeholder="Select year"
                searchPlaceholder="Search year..."
                emptyText="No year found."
              />
            </FieldWrapper>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}

      {/* Step 2: Specifications */}
      {step === 2 && (
        <section className="space-y-6">
          <SectionHeader title="Specifications" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-6">
            <FieldWrapper label="Body Type" required>
              <PillOptions
                value={formData.bodyType}
                onChange={(v) => update('bodyType', v)}
                options={BODY_TYPES.slice(0, 6).map(b => ({ value: b.value, label: b.label }))}
                columns={3}
              />
            </FieldWrapper>

            <FieldWrapper label="Fuel Type" required>
              <PillOptions
                value={formData.fuelType}
                onChange={(v) => update('fuelType', v)}
                options={FUEL_TYPES.map(f => ({ value: f.value, label: f.label }))}
                columns={3}
              />
            </FieldWrapper>

            <FieldWrapper label="Transmission" required>
              <PillOptions
                value={formData.transmission}
                onChange={(v) => update('transmission', v)}
                options={TRANSMISSION_TYPES.slice(0, 3).map(t => ({ value: t.value, label: t.label }))}
                columns={3}
              />
            </FieldWrapper>

            <FieldWrapper label="Regional Specs" required>
              <PillOptions
                value={formData.specs}
                onChange={(v) => update('specs', v)}
                options={SPECS_TYPES.slice(0, 4).map(s => ({ value: s.value, label: s.label.replace(' Specs', '') }))}
                columns={4}
              />
            </FieldWrapper>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!isStep2Valid}
              className="flex-[2] py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Condition */}
      {step === 3 && (
        <section className="space-y-6">
          <SectionHeader title="Condition & History" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-6">
            <FieldWrapper label="Mileage" required>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.mileage}
                  onChange={(e) => update('mileage', e.target.value)}
                  placeholder="45,000"
                  className={cn(
                    "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-foreground",
                    "outline-none transition-colors px-0 pr-12 text-sm font-medium",
                    "placeholder:text-muted-foreground/40"
                  )}
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">
                  km
                </span>
              </div>
            </FieldWrapper>

            <FieldWrapper label="Overall Condition" required>
              <PillOptions
                value={formData.condition}
                onChange={(v) => update('condition', v)}
                options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' },
                ]}
                columns={4}
              />
            </FieldWrapper>

            <FieldWrapper label="Accident History" required>
              <PillOptions
                value={formData.accidents}
                onChange={(v) => update('accidents', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'minor', label: 'Minor' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'major', label: 'Major' },
                ]}
                columns={4}
              />
            </FieldWrapper>

            <FieldWrapper label="Number of Owners" required>
              <PillOptions
                value={formData.owners}
                onChange={(v) => update('owners', v)}
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4+', label: '4+' },
                ]}
                columns={4}
              />
            </FieldWrapper>

            <FieldWrapper label="Service History">
              <PillOptions
                value={formData.serviceHistory}
                onChange={(v) => update('serviceHistory', v)}
                options={[
                  { value: 'full', label: 'Full' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'none', label: 'None' },
                ]}
                columns={3}
              />
            </FieldWrapper>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!isStep3Valid}
              className="flex-[2] py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Final Details + Calculate */}
      {step === 4 && (
        <section className="space-y-6">
          <SectionHeader title="Final Details" />
          
          <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-6">
            <FieldWrapper label="Exterior Color">
              <Combobox
                options={EXTERIOR_COLORS.map(c => ({ value: c.value, label: c.label }))}
                value={formData.color}
                onValueChange={(v) => update('color', v)}
                placeholder="Select color"
                searchPlaceholder="Search colors..."
                emptyText="No color found."
              />
            </FieldWrapper>

            <FieldWrapper label="Under Warranty?">
              <div className="flex gap-3">
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('warranty', opt.value)}
                    className={cn(
                      "flex items-center justify-between flex-1 h-12 px-4 rounded-lg transition-colors",
                      formData.warranty === opt.value
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    {formData.warranty === opt.value && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </FieldWrapper>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border/40 bg-sidebar p-5">
            <p className="text-xs text-muted-foreground/70 mb-2">Your car</p>
            <p className="text-base font-bold text-foreground">
              {formData.year} {formData.make} {formData.model}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                {formData.mileage} km
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground capitalize">
                {formData.condition}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground capitalize">
                {formData.fuelType?.replace('_', ' ')}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground uppercase">
                {formData.specs}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              className="flex-[2] py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Calculate Value
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 space-y-4">
              <p className="text-center text-sm font-semibold text-muted-foreground/70">
                Estimated Market Value
              </p>
              
              {/* Value Range */}
              <div className="flex items-end justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/70 mb-1">Low</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {result.low.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-tight text-green-500">
                    AED {result.mid.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/70 mb-1">High</p>
                  <p className="text-lg font-semibold text-muted-foreground">
                    {result.high.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Factors */}
              {result.factors.length > 0 && (
                <div className="border-t border-border/40 pt-4 mt-4">
                  <p className="text-xs font-semibold text-muted-foreground/70 mb-3">Value Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {result.factors.map((f, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                          f.positive ? 'bg-green-500/10' : 'bg-red-500/10'
                        )}
                      >
                        <CheckCircle2 className={cn(
                          "w-3.5 h-3.5",
                          f.positive ? 'text-green-500' : 'text-red-500'
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          f.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {f.label} {f.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground/70 mt-4">
                Based on UAE market data. Actual value may vary.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

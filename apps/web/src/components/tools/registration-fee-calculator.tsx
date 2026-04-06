'use client'

import { useState, useMemo } from 'react'
import { MapPin, FileText, Car, AlertCircle, ExternalLink, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/utils'
import {
  UAE_REGISTRATION_FEES,
  formatAED,
  type EmirateId,
} from '@/data/uae-automotive-config'

type RegistrationType = 'new' | 'renewal' | 'transfer' | 'export'
type VehicleType = 'private' | 'commercial' | 'motorcycle'

interface FeeBreakdown {
  label: string
  amount: number
  description?: string
  optional?: boolean
}

export function RegistrationFeeCalculator() {
  const [formData, setFormData] = useState({
    emirate: 'dubai' as EmirateId,
    registrationType: 'renewal' as RegistrationType,
    vehicleType: 'private' as VehicleType,
    vehicleAge: '3', // years
    includeCustomPlate: false,
    isFirstTime: false, // first time registration in this emirate
  })

  const [result, setResult] = useState<{
    breakdown: FeeBreakdown[]
    total: number
    mandatoryTotal: number
    emirateInfo: (typeof UAE_REGISTRATION_FEES)[EmirateId]
  } | null>(null)

  const emirateOptions = useMemo(() => 
    Object.entries(UAE_REGISTRATION_FEES).map(([id, data]) => ({
      id: id as EmirateId,
      name: data.name,
      authority: data.authority,
    })),
    []
  )

  const selectedEmirate = UAE_REGISTRATION_FEES[formData.emirate]

  const handleCalculate = () => {
    const fees = selectedEmirate.fees
    const breakdown: FeeBreakdown[] = []
    const vehicleAge = parseInt(formData.vehicleAge)

    // Registration/Renewal Fee - always required
    switch (formData.registrationType) {
      case 'new':
        breakdown.push({
          label: 'New Registration Fee',
          amount: fees.newRegistration,
          description: 'Initial vehicle registration',
        })
        break
      case 'renewal':
        breakdown.push({
          label: 'Renewal Fee',
          amount: fees.renewal,
          description: 'Annual registration renewal',
        })
        break
      case 'transfer':
        breakdown.push({
          label: 'Transfer of Ownership',
          amount: fees.transferOwnership,
          description: 'Change of vehicle ownership',
        })
        break
      case 'export':
        breakdown.push({
          label: 'Export/Cancellation',
          amount: fees.exportCancellation,
          description: 'Export certificate or registration cancellation',
        })
        break
    }

    // Testing fee - required for new registrations or vehicles over 3 years
    if ((formData.registrationType === 'new' || vehicleAge > 3) && fees.testingFee) {
      breakdown.push({
        label: 'Vehicle Testing',
        amount: fees.testingFee,
        description: vehicleAge > 3 ? 'Required for vehicles over 3 years old' : 'Required for new registrations',
      })
    }

    // Traffic file - first time only
    if (formData.isFirstTime && fees.trafficFile) {
      breakdown.push({
        label: 'Traffic File Opening',
        amount: fees.trafficFile,
        description: 'One-time fee for new traffic file',
      })
    }

    // Standard plate
    if ((formData.registrationType === 'new' || formData.registrationType === 'transfer') && fees.standardPlate) {
      breakdown.push({
        label: 'Number Plate',
        amount: fees.standardPlate,
        description: 'Standard registration plate',
      })
    }

    // Dubai-specific additional fees
    if (formData.emirate === 'dubai') {
      const dubaiFees = fees as typeof UAE_REGISTRATION_FEES.dubai.fees
      
      if (dubaiFees.emiratesIdLink) {
        breakdown.push({
          label: 'Emirates ID Link',
          amount: dubaiFees.emiratesIdLink,
          description: 'Linking registration to Emirates ID',
        })
      }
      if (dubaiFees.knowledgeFee) {
        breakdown.push({
          label: 'Knowledge Fee',
          amount: dubaiFees.knowledgeFee,
          description: 'Dubai Knowledge Fund contribution',
        })
      }
      if (dubaiFees.innovationFee) {
        breakdown.push({
          label: 'Innovation Fee',
          amount: dubaiFees.innovationFee,
          description: 'Dubai Innovation Fund contribution',
        })
      }
      if (formData.registrationType === 'new' && dubaiFees.insuranceCertificate) {
        breakdown.push({
          label: 'Insurance Certificate Processing',
          amount: dubaiFees.insuranceCertificate,
          description: 'Processing of insurance documents',
        })
      }
    }

    // Calculate totals
    const mandatoryTotal = breakdown
      .filter(item => !item.optional)
      .reduce((sum, item) => sum + item.amount, 0)

    const total = breakdown.reduce((sum, item) => sum + item.amount, 0)

    setResult({
      breakdown,
      total,
      mandatoryTotal,
      emirateInfo: selectedEmirate,
    })
  }

  return (
    <div className="space-y-6">
      {/* Emirate Selection */}
      <div>
        <label className="flex items-center gap-2 text-subhead mb-3">
          <MapPin className="w-4 h-4" />
          Select Emirate
        </label>
        <div className="grid grid-cols-2 compact:grid-cols-4 gap-2">
          {emirateOptions.slice(0, 4).map((emirate) => (
            <button
              key={emirate.id}
              onClick={() => setFormData({ ...formData, emirate: emirate.id })}
              className={cn(
                "p-3 rounded-lg border text-subhead transition-all",
                formData.emirate === emirate.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              {emirate.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {emirateOptions.slice(4).map((emirate) => (
            <button
              key={emirate.id}
              onClick={() => setFormData({ ...formData, emirate: emirate.id })}
              className={cn(
                "p-3 rounded-lg border text-subhead transition-all",
                formData.emirate === emirate.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              {emirate.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Emirate Info */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{selectedEmirate.name}</p>
          <p className="text-caption1 text-muted-foreground">{selectedEmirate.authority}</p>
        </div>
        <a
          href={selectedEmirate.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-caption1 text-primary hover:underline flex items-center gap-1"
        >
          Official Site <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Registration Type */}
      <div>
        <label className="flex items-center gap-2 text-subhead mb-3">
          <FileText className="w-4 h-4" />
          Service Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'renewal', label: 'Renewal', desc: 'Annual renewal' },
            { id: 'new', label: 'New Registration', desc: 'First time' },
            { id: 'transfer', label: 'Transfer', desc: 'Change owner' },
            { id: 'export', label: 'Export/Cancel', desc: 'Export cert' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFormData({ ...formData, registrationType: type.id as RegistrationType })}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                formData.registrationType === type.id
                  ? "bg-primary/5 border-primary"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              <p className="text-subhead">{type.label}</p>
              <p className="text-caption1 text-muted-foreground">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Age */}
      <div>
        <label className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-2 text-subhead">
            <Car className="w-4 h-4" />
            Vehicle Age
          </span>
          <span className="text-caption1 text-muted-foreground">
            {formData.vehicleAge} years old
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          value={formData.vehicleAge}
          onChange={(e) => setFormData({ ...formData, vehicleAge: e.target.value })}
        />
        <div className="flex justify-between text-caption1 text-muted-foreground mt-1">
          <span>New</span>
          <span className={parseInt(formData.vehicleAge) > 3 ? "text-warning font-medium" : ""}>
            {parseInt(formData.vehicleAge) > 3 ? 'Testing required' : '3 years (no testing)'}
          </span>
          <span>15+ years</span>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
          <input
            type="checkbox"
            checked={formData.isFirstTime}
            onChange={(e) => setFormData({ ...formData, isFirstTime: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <div>
            <p className="text-subhead">First time in this emirate</p>
            <p className="text-caption1 text-muted-foreground">Traffic file opening fee applies</p>
          </div>
        </label>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        Calculate Fees
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Fee Breakdown */}
          <div className="border rounded-lg divide-y">
            {result.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-subhead">{item.label}</span>
                    {item.optional && (
                      <span className="text-caption1 bg-muted px-1.5 py-0.5 rounded">Optional</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-caption1 text-muted-foreground mt-0.5 ml-6">{item.description}</p>
                  )}
                </div>
                <span className="font-semibold">{formatAED(item.amount)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-headline">Total Fees</span>
              <span className="text-title1 font-bold text-primary">
                {formatAED(result.total)}
              </span>
            </div>
          </div>

          {/* Emirate-specific notes */}
          {result.emirateInfo.notes.length > 0 && (
            <div className="p-4 bg-primary-muted bg-primary-muted border border-primary/20 border-primary/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-subhead text-primary mb-2">
                    {result.emirateInfo.name} Notes
                  </p>
                  <ul className="text-caption1 text-primary space-y-1">
                    {result.emirateInfo.notes.map((note, i) => (
                      <li key={i}>• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-4 bg-warning-muted bg-warning-muted border border-warning/20 border-warning/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <div className="text-caption1 text-warning">
              <strong>Note:</strong> Additional fees may apply for late renewals (AED 10/month up to AED 500), 
              custom plates, or special circumstances. Insurance must be valid before registration. 
              Visit {result.emirateInfo.authority} for official rates.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

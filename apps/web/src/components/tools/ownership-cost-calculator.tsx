'use client'

import { useState } from 'react'

export function OwnershipCostCalculator() {
  const [formData, setFormData] = useState({
    carPrice: '',
    yearsToOwn: '5',
    annualMileage: '20000',
    fuelType: 'petrol',
    insuranceType: 'comprehensive',
  })

  const [result, setResult] = useState<{
    depreciation: number
    fuel: number
    insurance: number
    maintenance: number
    registration: number
    total: number
  } | null>(null)

  const handleCalculate = () => {
    const price = parseFloat(formData.carPrice)
    const years = parseInt(formData.yearsToOwn)
    const mileage = parseInt(formData.annualMileage)

    // Depreciation (simplified)
    const depreciationRate = 0.5 // 50% over 5 years
    const depreciation = price * depreciationRate

    // Fuel (AED 3/liter, 10L/100km average)
    const fuelCostPerYear = (mileage / 100) * 10 * 3
    const fuel = fuelCostPerYear * years

    // Insurance
    const insurancePerYear = formData.insuranceType === 'comprehensive' 
      ? price * 0.03 
      : 800
    const insurance = insurancePerYear * years

    // Maintenance (increases with age)
    const maintenancePerYear = 3000 + (years * 500)
    const maintenance = maintenancePerYear * years

    // Registration
    const registration = 420 * years

    const total = depreciation + fuel + insurance + maintenance + registration

    setResult({
      depreciation,
      fuel,
      insurance,
      maintenance,
      registration,
      total,
    })
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-subhead font-medium mb-2">
              Car Price (AED)
            </label>
            <input
              type="number"
              placeholder="100000"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.carPrice}
              onChange={(e) => setFormData({ ...formData, carPrice: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-subhead font-medium mb-2">
              Years to Own
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.yearsToOwn}
              onChange={(e) => setFormData({ ...formData, yearsToOwn: e.target.value })}
            >
              <option value="3">3 years</option>
              <option value="5">5 years</option>
              <option value="7">7 years</option>
              <option value="10">10 years</option>
            </select>
          </div>

          <div>
            <label className="block text-subhead font-medium mb-2">
              Annual Mileage (km)
            </label>
            <input
              type="number"
              placeholder="20000"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.annualMileage}
              onChange={(e) => setFormData({ ...formData, annualMileage: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-subhead font-medium mb-2">
              Insurance Type
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.insuranceType}
              onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="third-party">Third Party</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Calculate Total Cost
        </button>

        {result && (
          <div className="space-y-4">
            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-subhead text-muted-foreground mb-2">
                Total {formData.yearsToOwn}-Year Ownership Cost
              </p>
              <p className="text-display font-bold text-primary">
                AED {result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Depreciation', value: result.depreciation },
                { label: 'Fuel', value: result.fuel },
                { label: 'Insurance', value: result.insurance },
                { label: 'Maintenance', value: result.maintenance },
                { label: 'Registration', value: result.registration },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-subhead">{item.label}</span>
                  <span className="font-semibold">
                    AED {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

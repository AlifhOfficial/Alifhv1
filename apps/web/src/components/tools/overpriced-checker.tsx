'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function OverpricedChecker() {
  const [formData, setFormData] = useState({
    askingPrice: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
  })

  const [result, setResult] = useState<{
    status: 'great-deal' | 'fair' | 'overpriced'
    difference: number
    marketValue: number
  } | null>(null)

  const handleCheck = () => {
    // TODO: Implement actual valuation logic
    const asking = parseInt(formData.askingPrice)
    const estimatedValue = asking * 0.95 // Placeholder
    const difference = ((asking - estimatedValue) / estimatedValue) * 100

    if (difference < -15) {
      setResult({ status: 'great-deal', difference, marketValue: estimatedValue })
    } else if (difference <= 15) {
      setResult({ status: 'fair', difference, marketValue: estimatedValue })
    } else {
      setResult({ status: 'overpriced', difference, marketValue: estimatedValue })
    }
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 regular:grid-cols-2 gap-4">
          <div className="regular:col-span-2">
            <label className="block text-subhead mb-2">Asking Price (AED)</label>
            <input
              type="number"
              placeholder="75000"
              className="w-full px-4 py-2 border rounded-lg text-headline font-semibold"
              value={formData.askingPrice}
              onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-subhead mb-2">Brand</label>
            <input
              type="text"
              placeholder="Toyota"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-subhead mb-2">Model</label>
            <input
              type="text"
              placeholder="Camry"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-subhead mb-2">Year</label>
            <input
              type="number"
              placeholder="2020"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-subhead mb-2">Mileage (km)</label>
            <input
              type="number"
              placeholder="50000"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
            />
          </div>
        </div>

        <button
          onClick={handleCheck}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Check Price
        </button>

        {result && (
          <div className={`p-6 rounded-lg border-2 ${
            result.status === 'great-deal' ? 'bg-success-muted border-success' :
            result.status === 'fair' ? 'bg-primary-muted border-primary' :
            'bg-destructive-muted border-destructive'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {result.status === 'great-deal' && <TrendingDown className="w-8 h-8 text-success" />}
              {result.status === 'fair' && <Minus className="w-8 h-8 text-primary" />}
              {result.status === 'overpriced' && <TrendingUp className="w-8 h-8 text-destructive" />}
              
              <div>
                <h3 className="text-title3 font-bold">
                  {result.status === 'great-deal' && 'Great Deal! 🎉'}
                  {result.status === 'fair' && 'Fair Price ✓'}
                  {result.status === 'overpriced' && 'Overpriced ⚠️'}
                </h3>
                <p className="text-subhead text-muted-foreground">
                  {Math.abs(result.difference).toFixed(1)}% {result.difference > 0 ? 'above' : 'below'} market value
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-subhead">Asking Price:</span>
                <span className="font-semibold">AED {parseInt(formData.askingPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subhead">Market Value:</span>
                <span className="font-semibold">AED {result.marketValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

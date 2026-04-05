import type { Metadata } from 'next'
import { FuelCostCalculator } from '@/components/tools/fuel-cost-calculator'

export const metadata: Metadata = {
  title: 'Fuel Cost Calculator UAE | Annual Fuel Expense Estimator | Revvup',
  description: 'Calculate annual fuel costs for your car in UAE. Estimate fuel expenses based on mileage and fuel efficiency.',
  keywords: 'fuel cost calculator uae, petrol cost dubai, fuel expense calculator',
}

export default function FuelCostCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">Fuel Cost Calculator</h1>
          <p className="text-headline text-muted-foreground">
            Estimate your annual fuel expenses in UAE
          </p>
        </div>

        {/* Tool Component */}
        <FuelCostCalculator />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Current Fuel Prices in UAE</h2>
          <p>
            Fuel prices in UAE are updated monthly. As of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:
          </p>
          <ul>
            <li>Super 98: ~AED 3.10/liter</li>
            <li>Special 95: ~AED 3.00/liter</li>
            <li>Diesel: ~AED 3.15/liter</li>
          </ul>

          <h2>Fuel-Efficient Cars in UAE</h2>
          <p>
            Most fuel-efficient options include:
          </p>
          <ul>
            <li>Toyota Yaris (5-6 L/100km)</li>
            <li>Honda Civic (6-7 L/100km)</li>
            <li>Toyota Camry Hybrid (5-6 L/100km)</li>
            <li>Nissan Sunny (6-7 L/100km)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { OwnershipCostCalculator } from '@/components/tools/ownership-cost-calculator'

export const metadata: Metadata = {
  title: 'Total Car Ownership Cost Calculator UAE | True Cost Calculator | Revvup',
  description: 'Calculate true cost of owning a car in UAE including depreciation, fuel, insurance, maintenance, and registration.',
  keywords: 'car ownership cost uae, total cost calculator dubai, car running costs',
}

export default function OwnershipCostCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">Total Ownership Cost Calculator</h1>
          <p className="text-headline text-muted-foreground">
            Calculate the true 5-year cost of owning a car in UAE
          </p>
        </div>

        {/* Tool Component */}
        <OwnershipCostCalculator />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>What's Included?</h2>
          <p>
            Our calculator considers all major ownership costs:
          </p>
          <ul>
            <li><strong>Depreciation:</strong> Largest cost factor</li>
            <li><strong>Fuel:</strong> Based on your annual mileage</li>
            <li><strong>Insurance:</strong> Comprehensive or third-party</li>
            <li><strong>Maintenance:</strong> Regular servicing and repairs</li>
            <li><strong>Registration:</strong> Annual RTA fees</li>
            <li><strong>Parking:</strong> Average monthly costs</li>
          </ul>

          <h2>Why This Matters</h2>
          <p>
            Many buyers focus only on purchase price. Understanding total ownership cost
            helps you choose a car that fits your long-term budget.
          </p>
        </div>
      </div>
    </div>
  )
}

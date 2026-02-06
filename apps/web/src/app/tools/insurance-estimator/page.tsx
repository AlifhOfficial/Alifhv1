import type { Metadata } from 'next'
import { InsuranceEstimator } from '@/components/tools/insurance-estimator'

export const metadata: Metadata = {
  title: 'Car Insurance Cost Estimator UAE | Insurance Calculator Dubai | Revvup',
  description: 'Get rough car insurance cost estimates in UAE. Calculate comprehensive and third-party insurance premiums.',
  keywords: 'car insurance calculator uae, insurance cost dubai, insurance premium estimator',
}

export default function InsuranceEstimatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Car Insurance Estimator</h1>
          <p className="text-lg text-muted-foreground">
            Get rough insurance cost estimate for your car in UAE
          </p>
        </div>

        {/* Tool Component */}
        <InsuranceEstimator />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Insurance Types in UAE</h2>
          <p>
            Two main types of car insurance:
          </p>
          <ul>
            <li>
              <strong>Comprehensive Insurance:</strong> Covers damage to your car and third party.
              Typically 2.5-3.5% of car value annually.
            </li>
            <li>
              <strong>Third Party Insurance:</strong> Only covers damage to others. Legal minimum.
              Fixed rates: AED 600-1,200 per year.
            </li>
          </ul>

          <h2>Factors Affecting Cost</h2>
          <ul>
            <li>Car value and age</li>
            <li>Driver age and experience</li>
            <li>Claims history</li>
            <li>Nationality (some variations)</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Note:</strong> This is an estimate only. Get official quotes from insurance providers.
          </p>
        </div>
      </div>
    </div>
  )
}

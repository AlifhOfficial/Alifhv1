import type { Metadata } from 'next'
import { RegistrationFeeCalculator } from '@/components/tools/registration-fee-calculator'

export const metadata: Metadata = {
  title: 'RTA Registration Fee Calculator UAE | Dubai Vehicle Registration Cost | Revvup',
  description: 'Calculate RTA registration and renewal fees for your car in UAE. Includes all emirate-specific charges.',
  keywords: 'rta registration fee dubai, car registration cost uae, vehicle registration calculator',
}

export default function RegistrationFeeCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">RTA Registration Fee Calculator</h1>
          <p className="text-lg text-muted-foreground">
            Calculate vehicle registration costs in UAE
          </p>
        </div>

        {/* Tool Component */}
        <RegistrationFeeCalculator />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Registration Fees by Emirate</h2>
          <p>
            Each emirate has slightly different fee structures:
          </p>
          
          <h3>Dubai (RTA)</h3>
          <ul>
            <li>Registration/Renewal: AED 420</li>
            <li>Emirates ID link: AED 30</li>
            <li>Knowledge fee: AED 10</li>
            <li>Innovation fee: AED 10</li>
          </ul>

          <h3>Abu Dhabi</h3>
          <ul>
            <li>Registration/Renewal: AED 400</li>
            <li>Plate fee: Variable</li>
            <li>Testing (if required): AED 170</li>
          </ul>

          <h3>Sharjah</h3>
          <ul>
            <li>Registration/Renewal: AED 350</li>
            <li>Additional fees may apply</li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8">
            <strong>Note:</strong> Fees are subject to change. Check official RTA/transport authority websites.
          </p>
        </div>
      </div>
    </div>
  )
}

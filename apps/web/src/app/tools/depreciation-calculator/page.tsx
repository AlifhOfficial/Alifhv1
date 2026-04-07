import type { Metadata } from 'next'
import { DepreciationCalculator } from '@/components/tools/depreciation-calculator'
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Car Depreciation Calculator UAE | Value Loss Calculator | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'car depreciation calculator uae, car value loss dubai, depreciation rates uae',
}

export default function DepreciationCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">Car Depreciation Calculator</h1>
          <p className="text-headline text-muted-foreground">
            See how much your car will lose in value over time
          </p>
        </div>

        {/* Tool Component */}
        <DepreciationCalculator />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Understanding Car Depreciation in UAE</h2>
          <p>
            Cars depreciate at different rates depending on brand, model, and market demand.
            Typical depreciation rates:
          </p>
          <ul>
            <li><strong>Year 1:</strong> 20-25% value loss</li>
            <li><strong>Year 2:</strong> 15-18% additional loss</li>
            <li><strong>Year 3:</strong> 12-15% additional loss</li>
            <li><strong>Year 4+:</strong> 8-10% per year</li>
          </ul>

          <h2>Cars That Hold Value Best</h2>
          <ul>
            <li>Toyota Land Cruiser</li>
            <li>Nissan Patrol</li>
            <li>Porsche 911</li>
            <li>Lexus LX series</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

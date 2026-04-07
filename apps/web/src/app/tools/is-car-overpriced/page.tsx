import type { Metadata } from 'next'
import { OverpricedChecker } from '@/components/tools/overpriced-checker'
const PRICE_CHECK_META_DESCRIPTION =
  'Check if a used car price is fair in the UAE. Compare asking price with typical market ranges.';

export const metadata: Metadata = {
  title: 'Is This Car Overpriced? | Free Price Checker UAE | Revvup',
  description: PRICE_CHECK_META_DESCRIPTION,
  keywords: 'car overpriced uae, check car price dubai, fair car price uae',
}

export default function OverpricedCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">Is This Car Overpriced?</h1>
          <p className="text-headline text-muted-foreground">
            Quick check if a car listing is fairly priced
          </p>
        </div>

        {/* Tool Component */}
        <OverpricedChecker />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>How to Use This Tool</h2>
          <p>
            Enter the asking price and basic car details. We'll instantly tell you if it's
            a fair deal, overpriced, or a bargain based on current UAE market data.
          </p>

          <h2>What the Results Mean</h2>
          <ul>
            <li><strong>Great Deal:</strong> 15%+ below market value</li>
            <li><strong>Fair Price:</strong> Within ±15% of market value</li>
            <li><strong>Overpriced:</strong> 15%+ above market value</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

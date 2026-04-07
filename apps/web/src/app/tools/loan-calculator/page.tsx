import type { Metadata } from 'next'
import { LoanCalculator } from '@/components/tools/loan-calculator'
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Car Loan Calculator UAE | Auto Finance Calculator Dubai | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'car loan calculator uae, auto finance calculator dubai, car payment calculator',
}

export default function LoanCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">Car Loan Calculator</h1>
          <p className="text-headline text-muted-foreground">
            Calculate monthly payments and total loan cost in UAE
          </p>
        </div>

        {/* Tool Component */}
        <LoanCalculator />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Understanding Car Loans in UAE</h2>
          <p>
            Car loans in UAE typically offer:
          </p>
          <ul>
            <li>Interest rates: 2.99% - 5.99% per annum</li>
            <li>Down payment: 15% - 20% minimum</li>
            <li>Loan term: 1-5 years</li>
            <li>Processing fee: 1% of loan amount</li>
          </ul>

          <h2>Tips for Better Rates</h2>
          <ul>
            <li>Maintain good credit history</li>
            <li>Higher down payment = lower interest</li>
            <li>Compare multiple banks</li>
            <li>Consider pre-approval</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

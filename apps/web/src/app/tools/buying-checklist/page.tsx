import type { Metadata } from 'next'
import { BuyingChecklist } from '@/components/tools/buying-checklist'
const BUYING_CHECKLIST_META_DESCRIPTION =
  'Printable checklist for buying a used car in the UAE: inspection, documents, and negotiation tips.';

export const metadata: Metadata = {
  title: 'Used Car Buying Checklist UAE | Complete Inspection Guide | Revvup',
  description: BUYING_CHECKLIST_META_DESCRIPTION,
  keywords: 'car buying checklist uae, used car inspection checklist dubai, buying car guide',
}

export default function BuyingChecklistPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">Used Car Buying Checklist UAE</h1>
          <p className="text-headline text-muted-foreground">
            Never miss a step when buying a used car in UAE
          </p>
        </div>

        {/* Tool Component */}
        <BuyingChecklist />

        {/* Info Section */}
        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Why Use This Checklist?</h2>
          <p>
            Buying a used car in UAE requires careful inspection and documentation checks.
            This comprehensive checklist ensures you don't miss any critical steps.
          </p>

          <h2>Red Flags to Watch For</h2>
          <ul>
            <li>Seller refuses to show VIN number</li>
            <li>Mismatched paint or body panels</li>
            <li>Unusual engine noises</li>
            <li>Incomplete service history</li>
            <li>Pressure to buy quickly</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

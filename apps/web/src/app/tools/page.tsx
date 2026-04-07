import type { Metadata } from 'next'
import Link from 'next/link'
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Free Car Tools & Calculators UAE | Revvup',
  description: REVVUP_META_DESCRIPTION,
  alternates: {
    canonical: 'https://revvup.ae/tools',
  },
}

const tools = [
  { title: 'Car Valuation', desc: 'Get market value', href: '/tools/car-valuation-uae' },
  { title: 'Price Check', desc: 'Is it overpriced?', href: '/tools/is-car-overpriced' },
  { title: 'Loan Calculator', desc: 'Monthly payments', href: '/tools/loan-calculator' },
  { title: 'Depreciation', desc: 'Value over time', href: '/tools/depreciation-calculator' },
  { title: 'Ownership Cost', desc: '5-year total cost', href: '/tools/ownership-cost-calculator' },
  { title: 'Fuel Cost', desc: 'Annual fuel spend', href: '/tools/fuel-cost-calculator' },
  { title: 'Insurance', desc: 'Cost estimate', href: '/tools/insurance-estimator' },
  { title: 'Registration', desc: 'RTA fees', href: '/tools/registration-fee-calculator' },
  { title: 'Buying Checklist', desc: 'Never miss a step', href: '/tools/buying-checklist' },
  { title: 'Personality Quiz', desc: 'Find your match', href: '/tools/car-personality-quiz' },
  { title: 'Car Says About You', desc: 'What it reveals', href: '/tools/what-your-car-says' },
  { title: 'Dream Car', desc: 'Lifestyle match', href: '/tools/dream-car-matcher' },
]

export default function ToolsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-title2 font-semibold tracking-tight mb-2">Car Tools</h1>
        <p className="text-subhead text-muted-foreground">
          Free calculators for smarter car decisions
        </p>
      </div>

      {/* Tools List */}
      <div className="space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-center justify-between py-4 px-1 border-b border-border/30  transition-colors"
          >
            <span className="text-subhead group-hover:text-foreground text-foreground/80 transition-colors">
              {tool.title}
            </span>
            <span className="text-footnote text-muted-foreground">
              {tool.desc}
            </span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-footnote text-muted-foreground mb-4">
          Ready to sell your car?
        </p>
        <Link
          href="/sell"
          className="inline-block text-footnote px-5 py-2.5 bg-foreground text-background rounded-full hover:bg-foreground/90 transition-colors"
        >
          List for Free
        </Link>
      </div>
    </div>
  )
}

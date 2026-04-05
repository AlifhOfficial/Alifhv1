import type { Metadata } from 'next'
import Link from 'next/link'
import { DreamCarMatcher } from '@/components/tools/dream-car-matcher'

export const metadata: Metadata = {
  title: 'Dream Car Matcher | Find Your Perfect Car Based on Lifestyle | Revvup',
  description: 'Answer a few questions about your lifestyle and we\'ll match you with your perfect dream car.',
  keywords: 'dream car finder, perfect car matcher, car recommendation quiz',
}

export default function DreamCarMatcherPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">✨ Dream Car Matcher</h1>
          <p className="text-headline text-muted-foreground">
            Find your perfect car based on your lifestyle and needs
          </p>
        </div>

        {/* Tool Component */}
        <DreamCarMatcher />

        {/* CTA Section */}
        <div className="mt-16 text-center p-8 border rounded-lg bg-muted/50">
          <h2 className="text-title2 font-bold mb-2">Found your dream car?</h2>
          <p className="text-muted-foreground mb-6">
            Browse our marketplace to find it for real!
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  )
}

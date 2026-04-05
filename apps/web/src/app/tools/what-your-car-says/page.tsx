import type { Metadata } from 'next'
import { WhatYourCarSays } from '@/components/tools/what-your-car-says'

export const metadata: Metadata = {
  title: 'What Your Car Says About You | Car Personality Analysis | Revvup',
  description: 'Find out what your car choice reveals about your personality and lifestyle. Fun analysis tool.',
  keywords: 'what car says about you, car personality, car stereotypes',
}

export default function WhatYourCarSaysPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">🎭 What Your Car Says About You</h1>
          <p className="text-headline text-muted-foreground">
            Discover what your car choice reveals about your personality
          </p>
        </div>

        {/* Tool Component */}
        <WhatYourCarSays />

        {/* Disclaimer */}
        <div className="mt-16 text-center p-6 border rounded-lg">
          <p className="text-subhead text-muted-foreground">
            This is just for fun! Your car doesn't define you, but it can say something 
            about your priorities and style. Take it with a grain of salt! 😄
          </p>
        </div>
      </div>
    </div>
  )
}

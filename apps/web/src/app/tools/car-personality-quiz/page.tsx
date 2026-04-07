import type { Metadata } from 'next'
import { CarPersonalityQuiz } from '@/components/tools/car-personality-quiz'
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Car Personality Quiz | Which Car Brand Matches You? | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'car personality quiz, car brand quiz, which car suits me',
}

export default function CarPersonalityQuizPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">🚗 Car Personality Quiz</h1>
          <p className="text-headline text-muted-foreground">
            Discover which car brand matches your personality
          </p>
        </div>

        {/* Tool Component */}
        <CarPersonalityQuiz />

        {/* Share Section */}
        <div className="mt-16 text-center p-8 border rounded-lg bg-muted/50">
          <h2 className="text-title2 font-bold mb-2">Love your result?</h2>
          <p className="text-muted-foreground mb-6">
            Share it with friends and see what car brand matches them!
          </p>
        </div>
      </div>
    </div>
  )
}

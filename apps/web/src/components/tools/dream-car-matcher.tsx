'use client'

import { useState } from 'react'

const questions = [
  {
    id: 1,
    question: 'What\'s your daily commute like?',
    options: [
      { text: 'City traffic, under 30 mins', category: 'commute', value: 'city-short' },
      { text: 'City traffic, over 1 hour', category: 'commute', value: 'city-long' },
      { text: 'Highway cruising', category: 'commute', value: 'highway' },
      { text: 'I work from home', category: 'commute', value: 'remote' },
    ],
  },
  {
    id: 2,
    question: 'How many people typically ride with you?',
    options: [
      { text: 'Just me', category: 'passengers', value: 'solo' },
      { text: '2-3 people', category: 'passengers', value: 'small-group' },
      { text: '4-5 people', category: 'passengers', value: 'family' },
      { text: '6+ people', category: 'passengers', value: 'large-family' },
    ],
  },
  {
    id: 3,
    question: 'What\'s your weekend vibe?',
    options: [
      { text: 'Off-road adventures', category: 'lifestyle', value: 'adventure' },
      { text: 'Shopping & city exploring', category: 'lifestyle', value: 'urban' },
      { text: 'Long road trips', category: 'lifestyle', value: 'touring' },
      { text: 'Track days & performance driving', category: 'lifestyle', value: 'performance' },
    ],
  },
  {
    id: 4,
    question: 'What\'s your budget range?',
    options: [
      { text: 'Under AED 50k', category: 'budget', value: 'budget' },
      { text: 'AED 50k - 100k', category: 'budget', value: 'mid' },
      { text: 'AED 100k - 200k', category: 'budget', value: 'upper' },
      { text: 'AED 200k+', category: 'budget', value: 'luxury' },
    ],
  },
]

const carMatches: Record<string, any> = {
  'city-short-solo-urban-budget': {
    car: 'Honda Civic',
    reason: 'Perfect city car with great fuel efficiency and reliability. Easy to park and maintain.',
    image: '🚗',
  },
  'highway-small-group-touring-mid': {
    car: 'Toyota Camry',
    reason: 'Comfortable highway cruiser with excellent reliability. Perfect for small families and road trips.',
    image: '🚙',
  },
  'city-long-family-urban-upper': {
    car: 'Toyota Fortuner',
    reason: 'Spacious 7-seater with commanding road presence. Comfortable for long commutes with family.',
    image: '🚙',
  },
  'highway-family-adventure-upper': {
    car: 'Toyota Land Cruiser',
    reason: 'Ultimate family adventure vehicle. Capable off-road, comfortable on highway, and built to last.',
    image: '🚙',
  },
  'city-short-solo-performance-luxury': {
    car: 'Porsche 911',
    reason: 'Pure driving excitement with everyday usability. For those who demand performance and prestige.',
    image: '🏎️',
  },
  'remote-solo-adventure-mid': {
    car: 'Jeep Wrangler',
    reason: 'Weekend warrior perfect for adventure seekers. Limitless off-road capability with open-air freedom.',
    image: '🚙',
  },
}

export function DreamCarMatcher() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)

  const handleAnswer = (category: string, value: string) => {
    const newAnswers = { ...answers, [category]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Generate result key from answers
      const key = Object.values(newAnswers).join('-')
      
      // Find best match or provide default
      const match = carMatches[key] || {
        car: 'Toyota Camry',
        reason: 'Based on your preferences, a versatile mid-size sedan offers the best balance of comfort, reliability, and value.',
        image: '🚗',
      }
      
      setResult(match)
    }
  }

  const reset = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="border rounded-lg p-8 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-center">
            <div className="text-display3 mb-6">{result.image}</div>
            <h2 className="text-title1 font-bold mb-2">Your Dream Car</h2>
            <p className="text-display font-bold text-primary mb-6">{result.car}</p>
            <p className="text-headline leading-relaxed">{result.reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
          >
            Find Another Match
          </button>
          <a
            href={`/cars?search=${result.car}`}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
          >
            Browse {result.car}
          </a>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-subhead text-muted-foreground mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="border rounded-lg p-8">
        <h2 className="text-title2 font-bold mb-6 text-center">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.category, option.value)}
              className="w-full p-4 border rounded-lg hover:bg-primary/5 hover:border-primary transition-colors text-left"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

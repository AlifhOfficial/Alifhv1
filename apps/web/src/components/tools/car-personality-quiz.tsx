'use client'

import { useState } from 'react'

const questions = [
  {
    id: 1,
    question: 'How would you describe your lifestyle?',
    options: [
      { text: 'Adventurous & Outdoorsy', brand: 'jeep' },
      { text: 'Sophisticated & Elegant', brand: 'mercedes' },
      { text: 'Practical & Reliable', brand: 'toyota' },
      { text: 'Sporty & Energetic', brand: 'bmw' },
    ],
  },
  {
    id: 2,
    question: 'What matters most to you in a car?',
    options: [
      { text: 'Reliability & Low Cost', brand: 'toyota' },
      { text: 'Status & Luxury', brand: 'mercedes' },
      { text: 'Performance & Fun', brand: 'bmw' },
      { text: 'Capability & Ruggedness', brand: 'jeep' },
    ],
  },
  {
    id: 3,
    question: 'Your ideal weekend is:',
    options: [
      { text: 'Desert camping trip', brand: 'jeep' },
      { text: 'Fine dining downtown', brand: 'mercedes' },
      { text: 'Family picnic at the park', brand: 'toyota' },
      { text: 'Mountain road trip', brand: 'bmw' },
    ],
  },
  {
    id: 4,
    question: 'How do you make decisions?',
    options: [
      { text: 'Logically & Practically', brand: 'toyota' },
      { text: 'Based on emotion & passion', brand: 'bmw' },
      { text: 'Seeking prestige & quality', brand: 'mercedes' },
      { text: 'Following adventure', brand: 'jeep' },
    ],
  },
]

const brandResults = {
  toyota: {
    name: 'Toyota',
    personality: 'The Practical Realist',
    description: 'You value reliability, practicality, and smart financial decisions. Like a Toyota, you\'re dependable, efficient, and built to last. You don\'t need flashy features – you appreciate what works.',
    cars: ['Camry', 'Land Cruiser', 'Corolla'],
    emoji: '🔧',
  },
  mercedes: {
    name: 'Mercedes-Benz',
    personality: 'The Sophisticated Leader',
    description: 'You appreciate the finer things in life and have refined taste. Like a Mercedes, you exude elegance, quality, and status. You believe in investing in excellence and aren\'t afraid to show success.',
    cars: ['S-Class', 'E-Class', 'GLE'],
    emoji: '👔',
  },
  bmw: {
    name: 'BMW',
    personality: 'The Spirited Performer',
    description: 'You live for excitement and performance. Like a BMW, you\'re dynamic, sporty, and love the thrill of the drive. You believe life is meant to be experienced fully, with passion and energy.',
    cars: ['3 Series', 'X5', 'M Series'],
    emoji: '⚡',
  },
  jeep: {
    name: 'Jeep',
    personality: 'The Bold Adventurer',
    description: 'You crave adventure and love exploring off the beaten path. Like a Jeep, you\'re rugged, capable, and unstoppable. You value freedom, outdoor experiences, and making your own rules.',
    cars: ['Wrangler', 'Grand Cherokee', 'Gladiator'],
    emoji: '🏔️',
  },
}

export function CarPersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({
    toyota: 0,
    mercedes: 0,
    bmw: 0,
    jeep: 0,
  })
  const [result, setResult] = useState<string | null>(null)

  const handleAnswer = (brand: string) => {
    const newScores = { ...scores, [brand]: scores[brand] + 1 }
    setScores(newScores)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate result
      const winner = Object.entries(newScores).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      setResult(winner)
    }
  }

  const reset = () => {
    setCurrentQuestion(0)
    setScores({ toyota: 0, mercedes: 0, bmw: 0, jeep: 0 })
    setResult(null)
  }

  if (result) {
    const brandData = brandResults[result as keyof typeof brandResults]
    return (
      <div className="space-y-6">
        <div className="text-center p-8 border rounded-lg bg-primary/5">
          <div className="text-display2 mb-4">{brandData.emoji}</div>
          <h2 className="text-title1 font-bold mb-2">{brandData.name}</h2>
          <p className="text-title3 text-muted-foreground mb-6">{brandData.personality}</p>
          <p className="text-callout leading-relaxed mb-6">{brandData.description}</p>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-subhead mb-2">Your {brandData.name} matches:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {brandData.cars.map((car) => (
                <span key={car} className="px-3 py-1 bg-background border rounded-full text-subhead">
                  {car}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
        >
          Take Quiz Again
        </button>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
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
              onClick={() => handleAnswer(option.brand)}
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

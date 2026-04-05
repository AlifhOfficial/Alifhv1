'use client'

import { useState } from 'react'

const carPersonalities = {
  'toyota-camry': {
    title: 'The Sensible Achiever',
    description: 'You\'re practical, reliable, and make smart long-term decisions. You don\'t need to show off – your success speaks for itself. People trust you to get things done.',
    traits: ['Reliable', 'Practical', 'Trustworthy', 'Smart with money'],
    emoji: '📊',
  },
  'toyota-land-cruiser': {
    title: 'The Confident Explorer',
    description: 'You value capability and aren\'t afraid of adventure, but you also demand luxury and comfort. You\'re successful and want a vehicle that can handle anything.',
    traits: ['Adventurous', 'Successful', 'Family-oriented', 'Prepared'],
    emoji: '🏔️',
  },
  'nissan-patrol': {
    title: 'The Desert Warrior',
    description: 'Power, tradition, and presence define you. You command respect and love the outdoors. You\'re proud of your heritage and never back down from a challenge.',
    traits: ['Powerful', 'Traditional', 'Commanding', 'Outdoorsy'],
    emoji: '🏜️',
  },
  'mercedes-s-class': {
    title: 'The Refined Executive',
    description: 'You\'ve earned your success and aren\'t shy about it. Quality, sophistication, and prestige matter to you. You appreciate the finest things life offers.',
    traits: ['Successful', 'Sophisticated', 'Quality-driven', 'Leader'],
    emoji: '👔',
  },
  'bmw-3-series': {
    title: 'The Dynamic Achiever',
    description: 'You work hard and play harder. Performance and style matter to you. You\'re ambitious, energetic, and love the thrill of the drive.',
    traits: ['Sporty', 'Ambitious', 'Fun-loving', 'Performance-driven'],
    emoji: '⚡',
  },
  'honda-civic': {
    title: 'The Smart Optimizer',
    description: 'Efficiency is your mantra. You make intelligent choices and don\'t waste resources. You\'re modern, practical, and always one step ahead.',
    traits: ['Efficient', 'Modern', 'Intelligent', 'Forward-thinking'],
    emoji: '🎯',
  },
  'porsche-911': {
    title: 'The Passionate Enthusiast',
    description: 'You live for excitement and appreciate engineering excellence. Life\'s too short for boring cars. You\'re successful and believe in enjoying every moment.',
    traits: ['Passionate', 'Wealthy', 'Thrill-seeker', 'Discerning'],
    emoji: '🏎️',
  },
  'jeep-wrangler': {
    title: 'The Free Spirit',
    description: 'Rules are suggestions. You value freedom, adventure, and living authentically. Material possessions don\'t define you – experiences do.',
    traits: ['Adventurous', 'Independent', 'Authentic', 'Fun'],
    emoji: '🌄',
  },
  'range-rover': {
    title: 'The Luxury Commander',
    description: 'You demand the best of both worlds: off-road capability with supreme luxury. You\'re successful, refined, and enjoy the finer things.',
    traits: ['Luxurious', 'Capable', 'Refined', 'Successful'],
    emoji: '👑',
  },
  'tesla-model-3': {
    title: 'The Tech Visionary',
    description: 'You\'re forward-thinking and environmentally conscious. Innovation excites you. You make decisions based on logic and future trends.',
    traits: ['Innovative', 'Eco-conscious', 'Tech-savvy', 'Progressive'],
    emoji: '🔋',
  },
}

export function WhatYourCarSays() {
  const [selectedCar, setSelectedCar] = useState('')
  const [result, setResult] = useState<typeof carPersonalities[keyof typeof carPersonalities] | null>(null)

  const carOptions = [
    { value: 'toyota-camry', label: 'Toyota Camry' },
    { value: 'toyota-land-cruiser', label: 'Toyota Land Cruiser' },
    { value: 'nissan-patrol', label: 'Nissan Patrol' },
    { value: 'mercedes-s-class', label: 'Mercedes S-Class' },
    { value: 'bmw-3-series', label: 'BMW 3 Series' },
    { value: 'honda-civic', label: 'Honda Civic' },
    { value: 'porsche-911', label: 'Porsche 911' },
    { value: 'jeep-wrangler', label: 'Jeep Wrangler' },
    { value: 'range-rover', label: 'Range Rover' },
    { value: 'tesla-model-3', label: 'Tesla Model 3' },
  ]

  const handleAnalyze = () => {
    if (selectedCar) {
      setResult(carPersonalities[selectedCar as keyof typeof carPersonalities])
    }
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <label className="block text-subhead font-medium mb-3">
          What car do you drive?
        </label>
        <select
          className="w-full px-4 py-3 border rounded-lg text-headline mb-6"
          value={selectedCar}
          onChange={(e) => setSelectedCar(e.target.value)}
        >
          <option value="">Select your car...</option>
          {carOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalyze}
          disabled={!selectedCar}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze My Car Choice
        </button>
      </div>

      {result && (
        <div className="border rounded-lg p-8 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-center mb-6">
            <div className="text-display2 mb-4">{result.emoji}</div>
            <h2 className="text-title1 font-bold mb-2">{result.title}</h2>
          </div>

          <p className="text-headline leading-relaxed mb-6 text-center">
            {result.description}
          </p>

          <div className="mt-6">
            <p className="text-subhead font-medium text-center mb-3">Your Personality Traits:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {result.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-4 py-2 bg-background border rounded-full text-subhead font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

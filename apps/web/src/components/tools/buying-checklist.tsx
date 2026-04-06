'use client'

import { useState } from 'react'

const checklistSections = [
  {
    title: 'Before Viewing',
    items: [
      'VIN number shown in listing',
      'Multiple clear photos available',
      'Service history mentioned',
      'Seller contactable and responsive',
      'Price seems reasonable',
    ],
  },
  {
    title: 'Exterior Inspection',
    items: [
      'Check for paint mismatches',
      'Inspect panel gaps',
      'Look for rust or dents',
      'Check tire condition and tread depth',
      'Verify all lights work',
      'Test windshield wipers',
    ],
  },
  {
    title: 'Interior Inspection',
    items: [
      'Check all seats and upholstery',
      'Test air conditioning',
      'Verify all electronics work',
      'Check for unusual odors',
      'Test all windows and locks',
      'Inspect dashboard for warning lights',
    ],
  },
  {
    title: 'Under the Hood',
    items: [
      'Check oil level and condition',
      'Inspect coolant level',
      'Look for leaks',
      'Check battery condition',
      'Inspect belts and hoses',
    ],
  },
  {
    title: 'Test Drive',
    items: [
      'Engine starts smoothly',
      'No unusual noises',
      'Brakes work properly',
      'Steering is responsive',
      'Transmission shifts smoothly',
      'AC works during drive',
    ],
  },
  {
    title: 'Documentation',
    items: [
      'Registration card (Mulkiya)',
      'Service history records',
      'Previous inspection reports',
      'Insurance papers',
      'Original purchase invoice',
    ],
  },
]

export function BuyingChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const totalItems = checklistSections.reduce((acc, section) => acc + section.items.length, 0)
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progress = (checkedCount / totalItems) * 100

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="rounded-lg border border-border/50 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-footnote">Progress</span>
          <span className="text-caption1 text-muted-foreground">
            {checkedCount}/{totalItems}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground/80 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-3">
        {checklistSections.map((section) => (
          <div key={section.title} className="rounded-lg border border-border/50 p-4">
            <h3 className="text-footnote mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.items.map((item, index) => {
                const key = `${section.title}-${index}`
                const isChecked = checkedItems[key] || false

                return (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-foreground border-foreground'
                          : 'border-border group-'
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-2.5 h-2.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => toggleItem(key)}
                    />
                    <span className={`text-footnote ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground/80'}`}>
                      {item}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setCheckedItems({})}
          className="flex-1 px-3 py-2 text-footnote rounded-md border border-border/50 hover:bg-muted/50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-3 py-2 text-footnote rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Print
        </button>
      </div>
    </div>
  )
}

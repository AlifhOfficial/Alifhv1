import type { Metadata } from 'next'
import { CarValuationTool } from '@/components/tools/car-valuation-tool'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Free Car Valuation Calculator UAE | Instant Market Value | Revvup',
  description: 'Get instant free car valuation in UAE. Calculate your car\'s market value based on make, model, year, mileage, and condition. No registration required.',
  keywords: 'car valuation uae, car value calculator dubai, car worth uae, estimate car value dubai',
}

const faqs = [
  {
    question: 'How accurate is the car valuation?',
    answer: 'Our valuation algorithm considers multiple factors including make, model, year, mileage, condition, regional specs, and current UAE market trends. Valuations are typically within 10-15% of actual market prices.',
  },
  {
    question: 'What factors affect my car\'s value the most?',
    answer: 'The biggest factors are age, mileage, condition, and accident history. GCC specs cars typically command an 8% premium over American or Japanese specs in the UAE market.',
  },
  {
    question: 'Why do GCC specs cars have higher value?',
    answer: 'GCC spec vehicles are built for the regional climate with enhanced cooling systems, corrosion protection, and often come with better warranty coverage from local dealers.',
  },
  {
    question: 'How does mileage affect valuation?',
    answer: 'We compare your car\'s mileage to the expected average (15,000 km/year). Lower than average mileage increases value, while higher mileage decreases it.',
  },
  {
    question: 'Does service history really matter?',
    answer: 'Yes! A full service history from an authorized dealer can add up to 8% to your car\'s value. It proves the car has been properly maintained.',
  },
  {
    question: 'How does Revvup ensure accurate valuations?',
    answer: 'We analyze real listings from the UAE market and use comprehensive data from active listings, ensuring you get valuations based on current market conditions.',
  },
]

export default function CarValuationPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      {/* Tool Component */}
      <CarValuationTool />

      {/* FAQ Section */}
      <section className="mt-12">
        <h2 className="text-subhead font-bold tracking-tight text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        
        <div className="rounded-xl border border-border/40 bg-sidebar">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-border/40 last:border-0"
              >
                <AccordionTrigger className="px-5 py-4 text-subhead font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 text-subhead text-muted-foreground/70">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  )
}

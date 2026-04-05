"use client"

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tools = [
  { title: 'Valuation', href: '/tools/car-valuation-uae' },
  { title: 'Price Check', href: '/tools/is-car-overpriced' },
  { title: 'Loan', href: '/tools/loan-calculator' },
  { title: 'Depreciation', href: '/tools/depreciation-calculator' },
  { title: 'Ownership', href: '/tools/ownership-cost-calculator' },
  { title: 'Fuel', href: '/tools/fuel-cost-calculator' },
  { title: 'Insurance', href: '/tools/insurance-estimator' },
  { title: 'Registration', href: '/tools/registration-fee-calculator' },
  { title: 'Checklist', href: '/tools/buying-checklist' },
  { title: 'Quiz', href: '/tools/car-personality-quiz' },
  { title: 'Car Says', href: '/tools/what-your-car-says' },
  { title: 'Dream Car', href: '/tools/dream-car-matcher' },
]

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  notFound()

  const pathname = usePathname()
  const isToolsIndex = pathname === '/tools'
  
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href={isToolsIndex ? "/" : "/tools"} 
            className="text-footnote font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {isToolsIndex ? "Home" : "All Tools"}
          </Link>
          <span className="text-footnote font-semibold">
            Revvup Tools
          </span>
          <Link
            href="/sell"
            className="text-footnote font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sell →
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className={!isToolsIndex ? "pb-24" : ""}>
        {children}
      </main>

      {/* Floating Tool Switcher - Only on tool pages */}
      {!isToolsIndex && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-muted/70 backdrop-blur-xl border border-white/10 shadow-2xl">
            <Link
              href="/tools"
              className="px-3 py-1.5 text-caption1 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              All
            </Link>
            <div className="w-px h-4 bg-border/50" />
            <div className="flex items-center gap-1 overflow-x-auto max-w-[70vw] scrollbar-hide">
              {tools.map((tool) => {
                const isActive = pathname === tool.href
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={cn(
                      "shrink-0 px-3 py-1.5 text-caption1 rounded-xl transition-all whitespace-nowrap",
                      isActive
                        ? "bg-foreground text-background font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                    )}
                  >
                    {tool.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * FAQ Page
 * Clean, SEO-optimized FAQ with search
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, ChevronRight, LifeBuoy } from 'lucide-react';
import { faqData, getAllFAQItems } from '@/data/faq-data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/utils/cn';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Search across all FAQs
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const allItems = getAllFAQItems();

    return allItems.filter((item) => {
      const questionMatch = item.question.toLowerCase().includes(query);
      const answerMatch = item.answer.toLowerCase().includes(query);
      const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(query));
      return questionMatch || answerMatch || keywordMatch;
    });
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const filteredCategories = activeCategory 
    ? faqData.filter(c => c.id === activeCategory)
    : faqData;

  return (
    <div className="bg-background pt-14 sm:pt-16 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <div className="pt-8 pb-10 px-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <LifeBuoy className="w-6 h-6 text-muted-foreground" />
                  <h1 className="text-xl font-bold tracking-tight text-foreground">Help Center</h1>
                </div>
                
                {/* Search Bar - Desktop */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setActiveCategory(null);
                    }}
                    className="w-full h-9 pl-9 pr-8 rounded-lg border border-sidebar-border bg-sidebar text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory(null);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted/40 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              <nav className="space-y-1 mb-10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeCategory === null && !isSearching
                      ? "bg-sidebar text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <span>All Questions</span>
                  <span className="text-xs tabular-nums text-muted-foreground/50">
                    {faqData.reduce((acc, c) => acc + c.items.length, 0)}
                  </span>
                </button>
                
                {faqData.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeCategory === category.id && !isSearching
                        ? "bg-sidebar text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    <span>{category.title}</span>
                    <span className="text-xs tabular-nums text-muted-foreground/50">
                      {category.items.length}
                    </span>
                  </button>
                ))}
              </nav>

              <div>
                <p className="text-xs text-muted-foreground/60 mb-3">Can't find an answer?</p>
                <Link 
                  href="/contact" 
                  className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden px-4 sm:px-6 pt-8 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <LifeBuoy className="w-5 h-5 text-muted-foreground" />
                <h1 className="text-lg font-bold tracking-tight text-foreground">Help Center</h1>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                    activeCategory === null && !isSearching
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  All
                </button>
                {faqData.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                      activeCategory === category.id && !isSearching
                        ? "bg-foreground text-background"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar - Mobile Only */}
            <div className="lg:hidden sticky top-14 sm:top-16 z-10 bg-background px-4 sm:px-6 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setActiveCategory(null);
                  }}
                  className="w-full h-10 pl-11 pr-10 rounded-lg border border-sidebar-border bg-sidebar text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/40 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 lg:pt-8">
              
              {/* Search Results */}
              {isSearching && (
                <div>
                  {searchResults && searchResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          Results for "{searchQuery}"
                        </p>
                        <span className="text-xs text-muted-foreground/60 tabular-nums">
                          {searchResults.length} found
                        </span>
                      </div>
                      
                      <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
                        <Accordion type="single" collapsible className="w-full">
                          {searchResults.map((item) => (
                            <AccordionItem 
                              key={item.id} 
                              value={item.id}
                              id={item.id}
                              className="scroll-mt-28 border-b border-sidebar-border/50 last:border-0"
                            >
                              <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-muted/30 transition-colors [&>svg]:text-muted-foreground/50 [&[data-state=open]]:bg-muted/20">
                                <div className="flex items-center gap-3 pr-2">
                                  <span className="text-sm font-medium text-foreground">{item.question}</span>
                                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded uppercase tracking-wide">
                                    {item.category}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-5 pb-5 pt-0">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-sidebar-border bg-sidebar p-8 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">
                        No results for "{searchQuery}"
                      </p>
                      <p className="text-xs text-muted-foreground/70 mb-4">
                        Try different keywords or browse categories
                      </p>
                      <Link 
                        href="/contact" 
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Contact Support
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Category FAQs */}
              {!isSearching && (
                <div className="space-y-10">
                  {filteredCategories.map((category) => (
                    <section key={category.id}>
                      <div className="mb-4">
                        <h2 className="text-base font-bold tracking-tight text-foreground">{category.title}</h2>
                        <p className="text-sm text-muted-foreground/70 mt-0.5">{category.description}</p>
                      </div>
                      
                      <div className="rounded-xl border border-sidebar-border bg-sidebar overflow-hidden">
                        <Accordion type="single" collapsible className="w-full">
                          {category.items.map((item) => (
                            <AccordionItem 
                              key={item.id} 
                              value={item.id}
                              id={item.id}
                              className="scroll-mt-28 border-b border-sidebar-border/50 last:border-0"
                            >
                              <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-muted/30 transition-colors [&>svg]:text-muted-foreground/50 [&[data-state=open]]:bg-muted/20">
                                <span className="text-sm font-medium text-foreground pr-4">
                                  {item.question}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="px-5 pb-5 pt-0">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* Mobile Contact CTA */}
              <div className="lg:hidden mt-10 pt-6">
                <p className="text-xs text-muted-foreground/60 mb-3">Can't find an answer?</p>
                <Link 
                  href="/contact" 
                  className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

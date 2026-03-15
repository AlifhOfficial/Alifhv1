/**
 * MacOS Window Component
 * Reusable macOS Sequoia-style browser/window frame
 * Matches latest macOS design language with:
 * - Revvup logo in a subtle glass pill
 * - Compact glass pill URL bar
 * - Unified background (no separate title bar color)
 * - Glass/frosted bubble UI elements
 * - Hidden delights for the curious
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BRAND_LOGO_SVG } from '@/lib/brand-assets';
import { cn } from '@/lib/utils';

// Messages for logo clicks - cycling through with personality
const LOGO_MESSAGES = [
  "Yeah, we know we're better",
  "Stop clicking, go find your next car",
  "Built different. Literally.",
  "You found us. Now what.",
  "This button doesn't do anything... or does it",
  "We put more effort into this than some entire apps",
  "Still here. Impressive dedication.",
  "The cars were inside you all along",
  "You've unlocked nothing. Congratulations.",
  "Okay now you're just showing off",
];

// Messages for URL bar clicks
const URL_BAR_MESSAGES = [
  "Mehhhhhh",
  "Nice try, this isn't a real browser",
  "localhost is where the heart is",
  "You cannot hack us through here",
  "The URL is merely a suggestion",
  "This is not the address bar you're looking for",
  "Error 418: I'm a teapot",
];

// Typewriter Toast Component
function TypewriterToast({ 
  message, 
  onComplete 
}: { 
  message: string; 
  onComplete: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start expansion
    requestAnimationFrame(() => setIsExpanded(true));
    
    let currentIndex = 0;
    const typeSpeed = Math.max(20, Math.min(40, 800 / message.length));
    
    const typeNextChar = () => {
      if (currentIndex < message.length) {
        setDisplayText(message.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutRef.current = setTimeout(typeNextChar, typeSpeed);
      } else {
        setIsComplete(true);
        // Hold for a moment, then fade out
        timeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(onComplete, 300);
        }, 1800);
      }
    };

    // Small delay before starting to type
    timeoutRef.current = setTimeout(typeNextChar, 150);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message, onComplete]);

  return (
    <div 
      className={cn(
        "absolute top-12 sm:top-14 left-1/2 z-50 transition-all duration-300 ease-out w-[calc(100%-2rem)] sm:w-auto max-w-[90vw] sm:max-w-none",
        isExpanded ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 -translate-y-2"
      )}
    >
      <div 
        className={cn(
          "bg-transparent backdrop-blur-2xl border border-white/[0.12] rounded-full shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "px-3 sm:px-5 py-2 sm:py-2.5" : "px-0 py-0"
        )}
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <span className="text-xs sm:text-sm text-white/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis block">
          {displayText}
          <span 
            className={cn(
              "inline-block w-[2px] h-[14px] bg-white/60 ml-0.5 align-middle transition-opacity",
              isComplete ? "opacity-0" : "animate-pulse"
            )}
          />
        </span>
      </div>
    </div>
  );
}

export interface MacOSWindowProps {
  /** URL to display in the address bar */
  url?: string;
  /** Content to render inside the window */
  children: React.ReactNode;
  /** Additional classes for the outer container */
  className?: string;
  /** Additional classes for the content area */
  contentClassName?: string;
  /** Whether to show the URL bar (default: true) */
  showUrlBar?: boolean;
}

export function MacOSWindow({
  url = 'localhost',
  children,
  className,
  contentClassName,
  showUrlBar = true,
}: MacOSWindowProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const showToast = useCallback((message: string) => {
    setToast(null);
    // Small delay to reset state if rapidly clicking
    setTimeout(() => setToast(message), 10);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleLogoClick = useCallback(() => {
    const message = LOGO_MESSAGES[logoClickCount % LOGO_MESSAGES.length];
    setLogoClickCount(prev => prev + 1);
    showToast(message);
  }, [logoClickCount, showToast]);

  const handleUrlBarClick = useCallback(() => {
    const message = URL_BAR_MESSAGES[Math.floor(Math.random() * URL_BAR_MESSAGES.length)];
    showToast(message);
  }, [showToast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Revvup',
          text: 'The car marketplace that actually gets it.',
          url: 'https://revvup.ae',
        });
      } catch {
        // User cancelled - no toast needed
      }
    } else {
      window.open('https://revvup.ae', '_blank');
      showToast("Opened in a new tab");
    }
  }, [showToast]);

  const handleCopy = useCallback(async () => {
    const text = "Just found Revvup - finally a car marketplace that doesn't feel like it was built in 2005. Check it: https://revvup.ae";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied. Now share it.");
    } catch {
      showToast("Copy failed. Blame your browser.");
    }
  }, [showToast]);

  const handleNewTab = useCallback(() => {
    showToast("One tab is all you need");
  }, [showToast]);

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 bg-black relative",
      className
    )}>
      {/* Typewriter Toast */}
      {toast && (
        <TypewriterToast message={toast} onComplete={clearToast} />
      )}
      {/* macOS Title Bar - Sequoia Style (unified background) */}
      <div className="bg-black px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Revvup Logo */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={handleLogoClick}
            className="flex items-center justify-center bg-transparent p-0 hover:opacity-80 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <img
              src={BRAND_LOGO_SVG}
              alt="Revvup"
              className="h-[14px] w-auto opacity-65"
              draggable={false}
            />
          </button>
        </div>

        {/* URL Bar - Glass Pill Style, Left Aligned, Height matches logo bubble */}
        {showUrlBar && (
          <div className="flex items-center min-w-0 flex-1 sm:flex-none">
            <button
              onClick={handleUrlBarClick}
              className="bg-transparent backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.2)] rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-1.5 min-w-0 max-w-full sm:max-w-[220px] hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {/* Lock icon */}
              <svg className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              
              {/* URL text */}
              <span className="text-[10px] sm:text-xs text-white/50 font-medium truncate min-w-0">{url}</span>
            </button>
          </div>
        )}

        {/* Spacer to push right side elements - hidden on mobile since URL bar takes flex-1 */}
        <div className="hidden sm:flex sm:flex-1" />
        
        {/* Right side toolbar - Outer pill containing 3 bubbles */}
        <div className="hidden sm:flex items-center">
          <div className="flex items-center gap-1 rounded-full bg-transparent backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.03)] p-1">
            {/* Share bubble */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-transparent border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
              </svg>
            </button>
            {/* Copy bubble */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full bg-transparent border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
            {/* Tabs bubble */}
            <button
              onClick={handleNewTab}
              className="p-1.5 rounded-full bg-transparent border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-6A2.25 2.25 0 019.75 18v-2.25m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Window Content */}
      <div className={cn("bg-black", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

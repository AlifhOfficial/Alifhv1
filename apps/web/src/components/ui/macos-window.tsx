/**
 * MacOS Window Component
 * Reusable macOS Sequoia-style browser/window frame
 * Matches latest macOS design language with:
 * - Traffic light buttons (standalone)
 * - Glass/frosted bubble UI elements
 * - Unified background (no separate title bar color)
 * - Centered URL bar with glass effect
 */

'use client';

import { cn } from '@/lib/utils';

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
  /** Whether to show navigation arrows (default: true) */
  showNavigation?: boolean;
}

export function MacOSWindow({
  url = 'localhost',
  children,
  className,
  contentClassName,
  showUrlBar = true,
  showNavigation = true,
}: MacOSWindowProps) {
  return (
    <div className={cn(
      "rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 bg-black",
      className
    )}>
      {/* macOS Title Bar - Sequoia Style (unified background) */}
      <div className="bg-black px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
        {/* Traffic Light Buttons - Standalone */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-default shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] cursor-default shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] cursor-default shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]" />
        </div>
        
        {/* Sidebar Toggle - Liquid Glass Bubble */}
        <div className="hidden sm:flex items-center">
          <div className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)] hover:bg-white/[0.1] transition-all duration-200">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <svg className="w-2.5 h-2.5 text-white/40" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Navigation Arrows - Liquid Glass Bubble */}
        {showNavigation && (
          <div className="hidden sm:flex items-center">
            <div className="flex items-center rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
              <div className="px-2.5 py-1.5 text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </div>
              <div className="px-2.5 py-1.5 text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* URL Bar - Liquid Glass Bubble, Centered, Wide */}
        {showUrlBar && (
          <div className="flex-1 flex justify-center px-2 sm:px-4">
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05),0_1px_2px_0_rgba(0,0,0,0.2)] rounded-full px-4 py-1.5 flex items-center justify-between gap-3 w-full max-w-[280px] sm:max-w-[480px] lg:max-w-[600px]">
              {/* Left: Page icon */}
              <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              
              {/* Center: URL text */}
              <span className="text-sm text-white/60 font-medium truncate flex-1 text-center">{url}</span>
              
              {/* Right: Privacy shield + Reload icons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* Right side toolbar icons - Liquid Glass Bubbles */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* Share button */}
          <div className="p-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)] hover:bg-white/[0.1] transition-all duration-200">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
            </svg>
          </div>
          {/* Add tab button */}
          <div className="p-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)] hover:bg-white/[0.1] transition-all duration-200">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          {/* Tabs button */}
          <div className="p-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.05)] hover:bg-white/[0.1] transition-all duration-200">
            <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-6A2.25 2.25 0 019.75 18v-2.25m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
            </svg>
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

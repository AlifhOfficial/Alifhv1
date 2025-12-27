/**
 * Unified Dashboard Layout
 * Built on shadcn/ui sidebar - the source of truth for layout
 */

'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard-components/theme-toggle";
import { handleSignOut } from '@/lib/auth/sign-out';
import { Home, LogOut } from 'lucide-react';

// ============================================================================
// Right Panel Context (for partner 3-column layout)
// ============================================================================

interface RightPanelContextType {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  open: (title: string, content: ReactNode) => void;
  close: () => void;
}

const RightPanelContext = createContext<RightPanelContextType | undefined>(undefined);

export function useRightPanel() {
  const context = useContext(RightPanelContext);
  if (!context) throw new Error('useRightPanel must be used within DashboardLayout with enableRightPanel');
  return context;
}

// ============================================================================
// Main Layout Component
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
  enableRightPanel?: boolean;
}

export function DashboardLayout({ children, enableRightPanel = false }: DashboardLayoutProps) {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<ReactNode | null>(null);
  const [rightPanelTitle, setRightPanelTitle] = useState("");

  const openRightPanel = (title: string, content: ReactNode) => {
    setRightPanelTitle(title);
    setRightPanelContent(content);
    setRightPanelOpen(true);
  };

  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setTimeout(() => {
      setRightPanelContent(null);
      setRightPanelTitle("");
    }, 300);
  };

  const rightPanelContextValue: RightPanelContextType = {
    isOpen: rightPanelOpen,
    content: rightPanelContent,
    title: rightPanelTitle,
    open: openRightPanel,
    close: closeRightPanel,
  };

  return (
    <RightPanelContext.Provider value={rightPanelContextValue}>
      <SidebarProvider>
        {children}

        {/* Right Panel (Partner Dashboard) */}
        {enableRightPanel && (
          <>
            <div
              className={`fixed top-0 right-0 h-full bg-background border-l border-border shadow-2xl transition-transform duration-300 z-30 ${
                rightPanelOpen ? "translate-x-0" : "translate-x-full"
              } w-full md:w-[400px] lg:w-[500px]`}
            >
              {rightPanelOpen && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">{rightPanelTitle}</h2>
                    <button
                      onClick={closeRightPanel}
                      className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">{rightPanelContent}</div>
                </div>
              )}
            </div>
            {rightPanelOpen && (
              <div
                className="md:hidden fixed inset-0 bg-black/60 z-20"
                onClick={closeRightPanel}
                aria-hidden="true"
              />
            )}
          </>
        )}
      </SidebarProvider>
    </RightPanelContext.Provider>
  );
}

// ============================================================================
// Main Content Wrapper (uses SidebarInset from shadcn)
// ============================================================================

interface DashboardContentProps {
  children: ReactNode;
  header?: ReactNode;
}

export function DashboardContent({ children, header }: DashboardContentProps) {
  const onSignOut = async () => {
    await handleSignOut();
  };

  return (
    <SidebarInset className="flex flex-col overflow-hidden">
      {/* Header with SidebarTrigger, ThemeToggle, and actions */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <ThemeToggle />
        {header && (
          <>
            <Separator orientation="vertical" className="mr-2 h-4" />
            {header}
          </>
        )}
        
        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <Home className="size-4" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSignOut}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Sign Out</span>
          </Button>
        </div>
      </header>
      
      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </div>
    </SidebarInset>
  );
}
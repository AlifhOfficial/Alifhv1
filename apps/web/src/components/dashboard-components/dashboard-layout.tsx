/**
 * Unified Dashboard Layout
 * Simple, clean layout system with sidebar and optional right panel
 */

'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';
import { ChevronRight } from 'lucide-react';

// ============================================================================
// Mobile Drawer Context
// ============================================================================

interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DashboardLayout');
  return context;
}

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
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    <DrawerContext.Provider value={{ isOpen: drawerOpen, setIsOpen: setDrawerOpen }}>
      <RightPanelContext.Provider value={rightPanelContextValue}>
        <div className="flex min-h-screen bg-muted/30 dark:bg-muted/10 relative">
          {/* Mobile Slide Tab */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-background/80 backdrop-blur-sm border border-border/40 rounded-r-xl shadow-lg hover:bg-muted/50 transition-all duration-200 py-4 px-1.5"
            aria-label="Open menu"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          
          {/* Mobile Overlay */}
          {drawerOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
          )}
          
          {children}

          {/* Right Panel (Partner Dashboard) */}
          {enableRightPanel && (
            <>
              <div
                className={`fixed top-0 right-0 h-full bg-background border-l border-border/40 shadow-2xl transition-transform duration-300 z-30 ${
                  rightPanelOpen ? "translate-x-0" : "translate-x-full"
                } w-full md:w-[400px] lg:w-[500px]`}
              >
                {rightPanelOpen && (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                      <h2 className="text-lg font-semibold text-foreground">{rightPanelTitle}</h2>
                      <button
                        onClick={closeRightPanel}
                        className="p-2 hover:bg-muted/50 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
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
        </div>
      </RightPanelContext.Provider>
    </DrawerContext.Provider>
  );
}

// ============================================================================
// Main Content Wrapper
// ============================================================================

export function DashboardContent({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 h-screen overflow-hidden w-full p-2 md:p-2">
      <div className="h-full w-full rounded-xl bg-background border border-border/50 shadow-sm overflow-hidden">
        {children}
      </div>
    </main>
  );
}

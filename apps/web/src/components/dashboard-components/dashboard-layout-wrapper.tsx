'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DashboardLayoutProvider');
  return context;
}

export function DashboardLayoutProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DrawerContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="flex min-h-screen bg-background relative">
        {/* Mobile Slide Tab */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-background/95 backdrop-blur-sm border-r border-t border-b border-border rounded-r-lg shadow-lg hover:bg-muted transition-all duration-200 py-4 px-1.5"
          aria-label="Open menu"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
        
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {children}
      </div>
    </DrawerContext.Provider>
  );
}

export function DashboardMainContent({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 h-screen overflow-y-auto w-full">
      {children}
    </main>
  );
}
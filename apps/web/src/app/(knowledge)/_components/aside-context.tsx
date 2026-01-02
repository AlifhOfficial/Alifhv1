/**
 * Aside Context - Pass content to the right panel from any page
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AsideContextType {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
}

const AsideContext = createContext<AsideContextType | undefined>(undefined);

export function AsideProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);

  return (
    <AsideContext.Provider value={{ content, setContent }}>
      {children}
    </AsideContext.Provider>
  );
}

export function useAside() {
  const context = useContext(AsideContext);
  if (!context) {
    throw new Error('useAside must be used within AsideProvider');
  }
  return context;
}

// Component to render in the aside slot
export function AsideContent() {
  const { content } = useAside();
  return <>{content}</>;
}

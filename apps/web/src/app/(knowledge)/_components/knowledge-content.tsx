'use client';

import { useLanguage } from './language-context';
import { cn } from '@/utils';

export function KnowledgeContent({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage();

  return (
    <div 
      className={cn(isRTL && 'text-right')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </div>
  );
}

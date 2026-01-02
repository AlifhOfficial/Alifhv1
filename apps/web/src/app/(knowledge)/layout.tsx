/**
 * Knowledge Center Layout
 * macOS-inspired layout with translucent sidebar and clean content area
 * Standalone layout without main navbar
 * Supports Arabic/English language toggle
 */

import { KnowledgeSidebar, MobileKnowledgeSidebar } from './_components/knowledge-sidebar';
import { LanguageProvider } from './_components/language-context';
import { KnowledgeContent } from './_components/knowledge-content';
import { AsideProvider, AsideContent } from './_components/aside-context';

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AsideProvider>
        <div className="min-h-screen bg-background">
          {/* Mobile Navigation FAB */}
          <MobileKnowledgeSidebar />

          <div className="flex min-h-screen">
            {/* Left Sidebar - macOS Finder style */}
            <KnowledgeSidebar className="border-r border-border/30" />

            {/* Content Panel - Clean reading area */}
            <main className="flex-1 min-w-0 bg-background">
              <div className="h-full">
                {/* Content wrapper with balanced padding */}
                <div className="px-8 lg:px-12 xl:px-16 py-10 lg:py-14">
                  {/* Optimal reading width with RTL support */}
                  <KnowledgeContent>
                    {children}
                  </KnowledgeContent>
                </div>
              </div>
            </main>

            {/* Right Rail - Summary/TOC area */}
            <aside className="hidden xl:block w-56 flex-shrink-0 border-l border-border/30 bg-muted/20">
              <div className="sticky top-8 py-10 px-5">
                <AsideContent />
              </div>
            </aside>
          </div>
        </div>
      </AsideProvider>
    </LanguageProvider>
  );
}

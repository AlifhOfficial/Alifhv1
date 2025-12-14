"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RightSidebarContextType {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  open: (title: string, content: ReactNode) => void;
  close: () => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export function useRightSidebar() {
  const context = useContext(RightSidebarContext);
  if (!context) {
    throw new Error("useRightSidebar must be used within ThreeColumnLayout");
  }
  return context;
}

interface ThreeColumnLayoutProps {
  children: ReactNode;
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState("");

  const open = (newTitle: string, newContent: ReactNode) => {
    setTitle(newTitle);
    setContent(newContent);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    // Delay clearing content for smooth animation
    setTimeout(() => {
      setContent(null);
      setTitle("");
    }, 300);
  };

  return (
    <RightSidebarContext.Provider value={{ isOpen, content, title, open, close }}>
      <div className="flex h-full relative">
        {/* Main Content */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isOpen ? "mr-0 md:mr-[400px] lg:mr-[500px]" : "mr-0"
          }`}
        >
          {children}
        </div>

        {/* Right Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full bg-card border-l border-border shadow-2xl transition-transform duration-300 z-30 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } w-full md:w-[400px] lg:w-[500px]`}
        >
          {isOpen && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <button
                  onClick={close}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Backdrop for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={close}
          />
        )}
      </div>
    </RightSidebarContext.Provider>
  );
}

"use client";

import { useEffect } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full md:w-[500px] lg:w-[600px] bg-background border-l border-border z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
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
          {children}
        </div>
      </div>
    </>
  );
}

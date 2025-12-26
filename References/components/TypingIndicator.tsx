/**
 * Messaging UI - Typing Indicator Component
 * Polished design with subtle animations
 */

"use client";

export function TypingIndicator({ userName }: { userName?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in overflow-hidden">
      {/* Animated Dots */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="w-2 h-2 bg-alifh-blue/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-alifh-blue/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-alifh-blue/60 rounded-full animate-bounce" />
      </div>
      
      {/* Typing Text */}
      {userName && (
        <span className="text-sm text-gray-500 font-medium truncate">
          {userName} is typing
        </span>
      )}
    </div>
  );
}

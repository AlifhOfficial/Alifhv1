/**
 * Welcome Modal - Alifh Design System
 * 
 * First impression for new members
 * Clean, minimal, premium aesthetic
 */

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

interface WelcomeModalProps {
  open: boolean;
  onContinue: () => void;
  userName: string;
}

export function WelcomeModal({
  open,
  onContinue,
  userName,
}: WelcomeModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || resolvedTheme === "charcoal");

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
      setIsExiting(false);
    }
  }, [open]);

  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(() => {
      onContinue();
    }, 300);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleContinue}
    >
      <div 
        className={cn(
          "max-w-sm w-full bg-card border border-border/40 rounded-xl shadow-xl p-8",
          "transform transition-all duration-300",
          showContent && !isExiting ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div 
            className={cn(
              "relative w-10 h-10 transition-all duration-300",
              showContent ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={isDark ? "/assets/Alifh_logo_White.svg" : "/assets/Alifh_logo_Black.svg"}
              alt="Alifh"
              fill
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Welcome, {userName}!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your journey to premium automotive excellence begins now.
            </p>
          </div>

          {/* Features hint */}
          <div className="w-full rounded-xl border border-border/40 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Complete your profile</p>
                <p className="text-xs text-muted-foreground">Get verified and unlock all features</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleContinue}
            disabled={isExiting}
            className={cn(
              "w-full h-10 px-4 rounded-lg text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isExiting ? "Let's go!" : "Start exploring"}
          </button>
        </div>
      </div>
    </div>
  );
}

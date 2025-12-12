/**
 * Welcome Modal - Alifh Premium Experience
 * 
 * First impression for new members
 * Sophisticated introduction to luxury automotive marketplace
 * Embodies trust, passion, and premium quality
 */

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

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
  const [showFallingSparkles, setShowFallingSparkles] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 200);
    } else {
      setShowContent(false);
      setShowFallingSparkles(false);
    }
  }, [open]);

  const handleContinue = () => {
    setShowFallingSparkles(true);
    
    setTimeout(() => {
      onContinue();
    }, 2500);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-lg flex items-center justify-center p-4"
      onClick={onContinue}
    >
      {/* Falling Sparkles Effect */}
      {showFallingSparkles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <style jsx>{`
            @keyframes fall {
              0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }
            .sparkle-fall {
              position: absolute;
              animation: fall 2.5s ease-in forwards;
              font-size: 28px;
            }
          `}</style>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="sparkle-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.8}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
      
      <div 
        className={`max-w-sm w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 shadow-2xl transform transition-all duration-500 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div 
              className={`relative transition-all duration-500 ease-out w-12 h-12 ${
                showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <Image
                src={isDark ? "/assets/Alifh_logo_White.svg" : "/assets/Alifh_logo_Black.svg"}
                alt="Alifh"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div 
            className={`text-center space-y-3 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Welcome to Alifh, {userName}!
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              Your journey to premium automotive excellence starts here.
            </p>
          </div>

          <button
            onClick={handleContinue}
            disabled={showFallingSparkles}
            className={`w-full h-12 px-6 bg-primary text-primary-foreground text-base rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            } transition-all duration-500 delay-300`}
          >
            {showFallingSparkles ? 'Welcome to the family!' : 'Start exploring Alifh'}
          </button>
        </div>
      </div>
    </div>
  );
}

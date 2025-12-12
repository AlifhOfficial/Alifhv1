/**
 * Welcome Modal
 * 
 * For brand new users - first impression with Alifh
 * Matches Alifh design system with proper dark/light mode support
 */

"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [open]);

  const handleContinue = () => {
    setShowFallingSparkles(true);
    
    // Hide sparkles and close modal after animation
    setTimeout(() => {
      setShowFallingSparkles(false);
      onContinue();
    }, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
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
              animation: fall 2s ease-in forwards;
              font-size: 24px;
            }
          `}</style>
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="sparkle-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
      
      <div className="max-w-md w-full bg-card border border-border/40 rounded-lg p-6">
        <div className="py-4 space-y-6 relative overflow-visible">
          {/* Sparkles with floating animation */}
          {showContent && (
            <>
              <style jsx>{`
                @keyframes float-up-left {
                  0% {
                    transform: translate(0, 0) scale(0);
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    transform: translate(-20px, -40px) scale(1);
                    opacity: 0;
                  }
                }
                @keyframes float-up-right {
                  0% {
                    transform: translate(0, 0) scale(0);
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    transform: translate(20px, -40px) scale(1);
                    opacity: 0;
                  }
                }
                .sparkle-left {
                  animation: float-up-left 2s ease-out infinite;
                }
                .sparkle-right {
                  animation: float-up-right 2s ease-out infinite;
                  animation-delay: 0.5s;
                }
              `}</style>
              <div 
                className="absolute top-1/4 left-1/4 text-lg sparkle-left"
              >
                ✨
              </div>
              <div 
                className="absolute top-1/4 right-1/4 text-lg sparkle-right"
              >
                ✨
              </div>
            </>
          )}

          {/* Logo centered */}
          <div className="flex justify-center">
            <div 
              className={`relative transition-all duration-500 ease-out ${
                showContent ? 'w-20 h-20 opacity-100' : 'w-8 h-8 opacity-0'
              }`}
            >
              <Image
                src="/assets/Alifh_logo_Black.svg"
                alt="Alifh"
                fill
                className="dark:invert object-contain"
              />
            </div>
          </div>

          <div 
            className={`text-center space-y-3 transition-opacity duration-500 ${
              showContent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h2 className="text-xl font-medium text-foreground">
              Welcome to Alifh, {userName}!
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your journey to premium automotive excellence starts here.
            </p>
          </div>

          <div 
            className={`transition-opacity duration-500 ${
              showContent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Born from passion. Built for trust.</span>
                <br />
                Discover curated vehicles from verified sellers in the UAE's most trusted automotive marketplace.
              </p>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full h-10 px-4 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start exploring
          </button>
        </div>
      </div>
    </div>
  );
}

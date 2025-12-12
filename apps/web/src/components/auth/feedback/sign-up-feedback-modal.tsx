/**
 * Sign-Up Feedback Modal - Alifh Design Philosophy
 * 
 * Premium account creation experience
 * "Setting you all up" - sophisticated onboarding
 * Reflects luxury vehicle marketplace aesthetic
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Users, Shield, Sparkles } from "lucide-react";

interface SignUpFeedbackModalProps {
  open: boolean;
  onClose?: () => void;
  success?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function SignUpFeedbackModal({
  open,
  onClose,
  success = false,
  isLoading = false,
  error = null,
}: SignUpFeedbackModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const setupSteps = [
    { icon: Users, text: "Creating your profile" },
    { icon: Shield, text: "Setting up security" },
    { icon: Sparkles, text: "Preparing your experience" },
  ];

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowContent(true), 150);
      
      // Animate through setup steps
      if (!success) {
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => (prev + 1) % setupSteps.length);
        }, 1200);
        return () => clearInterval(stepInterval);
      }
    } else {
      setShowContent(false);
      setShowSuccess(false);
      setCurrentStep(0);
    }
  }, [open, success, setupSteps.length]);

  useEffect(() => {
    if (success && open) {
      setTimeout(() => setShowSuccess(true), 300);
    }
  }, [success, open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-sm w-full bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl p-8 relative shadow-2xl transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex flex-col items-center space-y-6">
          {/* Loading/Success Icon */}
          <div className="relative">
            {showSuccess ? (
              <div className="animate-in zoom-in duration-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin relative z-10" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div 
            className={`text-center space-y-4 transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {showSuccess ? 'All set!' : 'Setting you all up'}
            </h2>
            
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {showSuccess ? (
                'Your account is ready'
              ) : (
                <>
                  Creating your premium account
                  <span className="inline-flex ml-1">
                    <span className="animate-bounce opacity-60" style={{ animationDelay: '0ms', animationDuration: '1.2s' }}>.</span>
                    <span className="animate-bounce opacity-60" style={{ animationDelay: '200ms', animationDuration: '1.2s' }}>.</span>
                    <span className="animate-bounce opacity-60" style={{ animationDelay: '400ms', animationDuration: '1.2s' }}>.</span>
                  </span>
                </>
              )}
            </p>

            {/* Setup Steps Animation - Only show during loading */}
            {!showSuccess && (
              <div className="space-y-3">
                {setupSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                        isActive ? 'bg-muted/20 border border-border/40' : 
                        isCompleted ? 'bg-muted/10 border border-border/30' : 
                        'bg-muted/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${
                        isActive ? 'text-foreground' : 
                        isCompleted ? 'text-muted-foreground' : 
                        'text-muted-foreground/40'
                      }`} />
                      <span className={`text-xs font-medium transition-colors duration-300 ${
                        isActive ? 'text-foreground' : 
                        isCompleted ? 'text-muted-foreground' : 
                        'text-muted-foreground/60'
                      }`}>
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Progress indicator for loading state */}
            {!showSuccess && (
              <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
                <div className="bg-purple-500/60 h-full rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

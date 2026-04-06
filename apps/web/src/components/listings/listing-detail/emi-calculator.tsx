/**
 * EMI Calculator Component - Revvup Design System
 * 
 * Clean, minimal EMI calculator following "Less is More" principle.
 */

'use client';

import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface EMICalculatorProps {
  price: number;
  currency?: string;
  className?: string;
}

const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_INTEREST_RATE = 3.99;
const DEFAULT_TENURE_MONTHS = 60;

const TENURE_OPTIONS = [
  { months: 12, label: '1y' },
  { months: 24, label: '2y' },
  { months: 36, label: '3y' },
  { months: 48, label: '4y' },
  { months: 60, label: '5y' },
];

export function EMICalculator({ price, currency = 'AED', className }: EMICalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_DOWN_PAYMENT_PERCENT);
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE);
  const [tenureMonths, setTenureMonths] = useState(DEFAULT_TENURE_MONTHS);

  const calculations = useMemo(() => {
    const downPayment = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    
    let emi: number;
    if (monthlyRate === 0) {
      emi = loanAmount / tenureMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, tenureMonths);
      emi = (loanAmount * monthlyRate * factor) / (factor - 1);
    }
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - loanAmount;

    return {
      downPayment,
      loanAmount,
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  }, [price, downPaymentPercent, interestRate, tenureMonths]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-muted-foreground" />
          <p className="text-footnote uppercase tracking-wider font-bold text-muted-foreground/70">
            EMI Calculator
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Quick EMI Display */}
      <div className="flex items-baseline justify-between">
        <span className="text-subhead font-semibold text-muted-foreground/70">Estimated Monthly</span>
        <span className="text-title3 font-bold tabular-nums text-foreground">
          {formatAmount(calculations.emi)}
          <span className="text-subhead text-muted-foreground">/mo</span>
        </span>
      </div>

      {/* Expanded Calculator */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border/30">
          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-subhead font-semibold text-muted-foreground/70">Down Payment</span>
              <span className="text-subhead font-bold tabular-nums text-foreground">
                {downPaymentPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Tenure Selection */}
          <div className="space-y-2">
            <span className="text-subhead font-semibold text-muted-foreground/70">Tenure</span>
            <div className="grid grid-cols-5 gap-1">
              {TENURE_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  onClick={() => setTenureMonths(option.months)}
                  className={cn(
                    "py-2.5 text-subhead font-bold rounded-lg transition-colors",
                    tenureMonths === option.months
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-subhead font-semibold text-muted-foreground/70">Interest Rate</span>
              <span className="text-subhead font-bold tabular-nums text-foreground">
                {interestRate}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Summary */}
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-subhead">
              <span className="text-muted-foreground/70 font-semibold">Loan Amount</span>
              <span className="font-bold tabular-nums text-foreground">{formatAmount(calculations.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-subhead">
              <span className="text-muted-foreground/70 font-semibold">Total Interest</span>
              <span className="font-bold tabular-nums text-foreground">{formatAmount(calculations.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-subhead">
              <span className="text-muted-foreground/70 font-semibold">Total Payment</span>
              <span className="font-bold tabular-nums text-foreground">{formatAmount(calculations.totalPayment)}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-subhead text-muted-foreground leading-relaxed font-medium">
            Estimate only. Actual EMI may vary based on your credit profile and bank rates.
          </p>
        </div>
      )}
    </div>
  );
}

function EMICalculatorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>

      {/* Quick EMI Display */}
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
  );
}

EMICalculator.Skeleton = EMICalculatorSkeleton;

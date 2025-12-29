/**
 * EMI Calculator Component - Alifh Design System
 * 
 * Clean, minimal EMI calculator following "Less is More" principle.
 */

'use client';

import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils';

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
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
            EMI Calculator
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Quick EMI Display */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Estimated Monthly</span>
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {formatAmount(calculations.emi)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </span>
      </div>

      {/* Expanded Calculator */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Down Payment</span>
              <span className="text-sm font-medium tabular-nums text-foreground">
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
            <span className="text-sm text-muted-foreground">Tenure</span>
            <div className="grid grid-cols-5 gap-1">
              {TENURE_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  onClick={() => setTenureMonths(option.months)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-md transition-colors",
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
              <span className="text-sm text-muted-foreground">Interest Rate</span>
              <span className="text-sm font-medium tabular-nums text-foreground">
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
          <div className="space-y-3 py-4 border-y border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="font-medium tabular-nums text-foreground">{formatAmount(calculations.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium tabular-nums text-foreground">{formatAmount(calculations.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Payment</span>
              <span className="font-medium tabular-nums text-foreground">{formatAmount(calculations.totalPayment)}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estimate only. Actual EMI may vary based on your credit profile and bank rates.
          </p>
        </div>
      )}
    </div>
  );
}

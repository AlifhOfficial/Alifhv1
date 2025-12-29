/**
 * EMI Calculator Component
 * 
 * Simple EMI (Equated Monthly Installment) calculator for the listing detail page.
 * Helps users estimate monthly payments for car financing.
 */

'use client';

import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/utils';

interface EMICalculatorProps {
  price: number;
  currency?: string;
  className?: string;
}

// Common UAE car loan configurations
const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_INTEREST_RATE = 3.99; // Annual percentage
const DEFAULT_TENURE_MONTHS = 60; // 5 years

const TENURE_OPTIONS = [
  { months: 12, label: '1 year' },
  { months: 24, label: '2 years' },
  { months: 36, label: '3 years' },
  { months: 48, label: '4 years' },
  { months: 60, label: '5 years' },
];

export function EMICalculator({ price, currency = 'AED', className }: EMICalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_DOWN_PAYMENT_PERCENT);
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE);
  const [tenureMonths, setTenureMonths] = useState(DEFAULT_TENURE_MONTHS);

  const calculations = useMemo(() => {
    const downPayment = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPayment;
    
    // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    // Where P = loan amount, r = monthly interest rate, n = number of months
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
    <div className={cn(
      "p-5 bg-card border border-border/40 rounded-xl space-y-4",
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            EMI Calculator
          </h4>
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
        <span className="text-xl font-bold text-foreground">
          {formatAmount(calculations.emi)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
        </span>
      </div>

      {/* Expanded Calculator */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border/40">
          {/* Down Payment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Down Payment</label>
              <span className="text-sm font-medium text-foreground">
                {downPaymentPercent}% ({formatAmount(calculations.downPayment)})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Tenure Selection */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Loan Tenure</label>
            <div className="grid grid-cols-5 gap-1">
              {TENURE_OPTIONS.map((option) => (
                <button
                  key={option.months}
                  onClick={() => setTenureMonths(option.months)}
                  className={cn(
                    "py-1.5 px-2 text-[10px] font-medium rounded transition-colors",
                    tenureMonths === option.months
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
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
              <label className="text-xs text-muted-foreground">Interest Rate (p.a.)</label>
              <span className="text-sm font-medium text-foreground">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1%</span>
              <span>10%</span>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="font-medium text-foreground">{formatAmount(calculations.loanAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium text-foreground">{formatAmount(calculations.totalInterest)}</span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-border/40">
              <span className="text-muted-foreground">Total Payment</span>
              <span className="font-medium text-foreground">{formatAmount(calculations.totalPayment)}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <p>
              This is an estimate only. Actual EMI may vary based on your credit profile, 
              bank rates, and other factors. Contact the seller for financing options.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client'

import { useState } from 'react'
import { Calculator, Building2, CreditCard, Banknote, Info, TrendingDown, PiggyBank, Percent } from 'lucide-react'
import { cn } from '@/utils'
import {
  UAE_FINANCING_CONFIG,
  formatAED,
} from '@/data/uae-automotive-config'

type FinancingType = 'conventional' | 'islamic'

interface LoanResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanAmount: number
  downPaymentAmount: number
  effectiveRate: number
  schedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
}

export function LoanCalculator() {
  const [formData, setFormData] = useState({
    carPrice: '',
    downPaymentPercent: '20',
    rate: '3.49',
    loanTerm: '4',
    financingType: 'conventional' as FinancingType,
  })

  const [showSchedule, setShowSchedule] = useState(false)
  const [result, setResult] = useState<LoanResult | null>(null)

  const handleCalculate = () => {
    const price = parseFloat(formData.carPrice)
    if (!price || price <= 0) return

    const downPaymentPercent = parseFloat(formData.downPaymentPercent) / 100
    const annualRate = parseFloat(formData.rate) / 100
    const years = parseInt(formData.loanTerm)
    
    const downPaymentAmount = price * downPaymentPercent
    const loanAmount = price - downPaymentAmount
    const monthlyRate = annualRate / 12
    const numberOfPayments = years * 12

    let monthlyPayment: number
    let totalPayment: number
    let totalInterest: number

    if (formData.financingType === 'islamic') {
      // Islamic financing: Simple profit calculation (Murabaha style)
      const totalProfit = loanAmount * annualRate * years
      totalPayment = loanAmount + totalProfit
      monthlyPayment = totalPayment / numberOfPayments
      totalInterest = totalProfit
    } else {
      // Conventional: Compound interest formula
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / numberOfPayments
      } else {
        monthlyPayment = loanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      }
      totalPayment = monthlyPayment * numberOfPayments
      totalInterest = totalPayment - loanAmount
    }

    // Generate amortization schedule
    const schedule: LoanResult['schedule'] = []
    let balance = loanAmount

    for (let month = 1; month <= numberOfPayments; month++) {
      let interestPayment: number
      let principalPayment: number

      if (formData.financingType === 'islamic') {
        principalPayment = loanAmount / numberOfPayments
        interestPayment = totalInterest / numberOfPayments
      } else {
        interestPayment = balance * monthlyRate
        principalPayment = monthlyPayment - interestPayment
      }

      balance = Math.max(0, balance - principalPayment)

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
      })
    }

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount,
      downPaymentAmount,
      effectiveRate: (totalInterest / loanAmount) * 100 / years,
      schedule,
    })
  }

  const minDownPayment = 20
  const isDownPaymentValid = parseFloat(formData.downPaymentPercent) >= minDownPayment

  return (
    <div className="space-y-6">
      {/* Financing Type Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setFormData({ ...formData, financingType: 'conventional', rate: '3.49' })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
            formData.financingType === 'conventional'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="w-4 h-4" />
          Conventional
        </button>
        <button
          onClick={() => setFormData({ ...formData, financingType: 'islamic', rate: '3.29' })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
            formData.financingType === 'islamic'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CreditCard className="w-4 h-4" />
          Islamic (Sharia)
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-100">
          {formData.financingType === 'islamic' ? (
            <>
              <strong>Islamic Financing (Murabaha):</strong> Sharia-compliant financing where 
              the bank purchases the vehicle and sells it to you at a pre-agreed profit margin. 
              No interest charged - profit is fixed upfront.
            </>
          ) : (
            <>
              <strong>Conventional Auto Loan:</strong> Standard bank financing with interest 
              calculated on the declining balance. Rate varies based on credit score and salary.
            </>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-5">
        {/* Car Price */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Vehicle Price</span>
            <span className="text-xs text-muted-foreground">Required</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              AED
            </span>
            <input
              type="number"
              placeholder="100,000"
              className="w-full pl-14 pr-4 py-3 border border-border rounded-lg text-lg font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.carPrice}
              onChange={(e) => setFormData({ ...formData, carPrice: e.target.value })}
            />
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Down Payment</span>
            <span className={cn(
              "text-xs font-semibold",
              isDownPaymentValid ? "text-green-600" : "text-red-500"
            )}>
              {formData.downPaymentPercent}%
              {formData.carPrice && ` (${formatAED(parseFloat(formData.carPrice) * parseFloat(formData.downPaymentPercent) / 100)})`}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            value={formData.downPaymentPercent}
            onChange={(e) => setFormData({ ...formData, downPaymentPercent: e.target.value })}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className="text-amber-600 font-medium">Min 20% (UAE law)</span>
            <span>80%</span>
          </div>
          {!isDownPaymentValid && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ UAE Central Bank requires minimum 20% down payment for auto loans
            </p>
          )}
        </div>

        {/* Interest/Profit Rate */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {formData.financingType === 'islamic' ? 'Profit Rate' : 'Interest Rate'}
            </span>
            <span className="text-xs font-semibold text-primary">{formData.rate}% per year</span>
          </label>
          <input
            type="range"
            min="2"
            max="7"
            step="0.1"
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>2.0%</span>
            <span className="text-green-600">
              {formData.financingType === 'islamic' 
                ? `Typical: ${UAE_FINANCING_CONFIG.islamic.profitRateRange.typical}%`
                : `Typical: ${UAE_FINANCING_CONFIG.conventional.rateRange.typical}%`
              }
            </span>
            <span>7.0%</span>
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Financing Term</span>
            <span className="text-xs font-semibold text-primary">{formData.loanTerm} years</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((year) => (
              <button
                key={year}
                onClick={() => setFormData({ ...formData, loanTerm: String(year) })}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-medium transition-all border",
                  formData.loanTerm === String(year)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                {year} yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!formData.carPrice || !isDownPaymentValid}
        className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate {formData.financingType === 'islamic' ? 'Financing' : 'Loan'}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Primary Result */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Banknote className="w-4 h-4" />
              Monthly Payment
            </div>
            <p className="text-4xl font-bold text-primary">
              {formatAED(result.monthlyPayment)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              for {formData.loanTerm} years ({parseInt(formData.loanTerm) * 12} payments)
            </p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <PiggyBank className="w-3.5 h-3.5" />
                Down Payment
              </div>
              <p className="text-lg font-semibold">{formatAED(result.downPaymentAmount)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <CreditCard className="w-3.5 h-3.5" />
                Financed Amount
              </div>
              <p className="text-lg font-semibold">{formatAED(result.loanAmount)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Percent className="w-3.5 h-3.5" />
                Total {formData.financingType === 'islamic' ? 'Profit' : 'Interest'}
              </div>
              <p className="text-lg font-semibold text-amber-600">{formatAED(result.totalInterest)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Total to Pay
              </div>
              <p className="text-lg font-semibold">{formatAED(result.totalPayment)}</p>
            </div>
          </div>

          {/* Cost Breakdown Visual */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium mb-3">Payment Breakdown</p>
            <div className="h-4 flex rounded-full overflow-hidden">
              <div 
                className="bg-primary"
                style={{ width: `${(result.loanAmount / result.totalPayment) * 100}%` }}
                title="Principal"
              />
              <div 
                className="bg-amber-500"
                style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
                title={formData.financingType === 'islamic' ? 'Profit' : 'Interest'}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Principal ({((result.loanAmount / result.totalPayment) * 100).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                {formData.financingType === 'islamic' ? 'Profit' : 'Interest'} ({((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Amortization Schedule Toggle */}
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full text-sm text-primary hover:text-primary/80 font-medium py-2"
          >
            {showSchedule ? 'Hide' : 'Show'} Payment Schedule →
          </button>

          {/* Amortization Schedule */}
          {showSchedule && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Month</th>
                      <th className="text-right py-2 px-3 font-medium">Payment</th>
                      <th className="text-right py-2 px-3 font-medium">Principal</th>
                      <th className="text-right py-2 px-3 font-medium">
                        {formData.financingType === 'islamic' ? 'Profit' : 'Interest'}
                      </th>
                      <th className="text-right py-2 px-3 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.month} className="border-t">
                        <td className="py-2 px-3">{row.month}</td>
                        <td className="text-right py-2 px-3">{formatAED(row.payment)}</td>
                        <td className="text-right py-2 px-3 text-green-600">{formatAED(row.principal)}</td>
                        <td className="text-right py-2 px-3 text-amber-600">{formatAED(row.interest)}</td>
                        <td className="text-right py-2 px-3">{formatAED(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bank suggestions */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Popular UAE Banks for Auto Financing</p>
            <div className="flex flex-wrap gap-2">
              {UAE_FINANCING_CONFIG.majorBanks
                .filter(bank => 
                  formData.financingType === 'conventional' 
                    ? bank.type === 'both' 
                    : bank.type === 'islamic' || bank.type === 'both'
                )
                .slice(0, 4)
                .map((bank) => (
                  <span key={bank.name} className="px-2.5 py-1 bg-background rounded-full text-xs border">
                    {bank.name} (~{bank.typical_rate}%)
                  </span>
                ))
              }
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            Estimates only. Actual rates depend on credit score, salary, and bank policies.
            Processing fees (~AED 525) not included.
          </p>
        </div>
      )}
    </div>
  )
}

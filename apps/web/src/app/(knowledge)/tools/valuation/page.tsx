/**
 * Car Valuation Tool Page
 * AI-powered market value estimation - Clean macOS-inspired design
 * BETA: Shows disclaimer that this is an estimate only
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  ChevronDown,
  Search,
  Car,
  X
} from 'lucide-react';
import { cn } from '@/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Combobox, type ComboboxOption } from '@/components/ui/forms/combobox';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/forms/button';

// Import constants
import {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  UAE_EMIRATES,
  getModelsForMake,
} from '@/components/listings/listing-form/constants';

// VIN Regex for detection
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
const isValidVin = (value: string) => VIN_REGEX.test(value.trim());

interface ValuationResult {
  fairValue: number;
  estimateMin: number;
  estimateMax: number;
  priceTrend: 'up' | 'down' | 'stable';
  qiScore: number;
  aiConfidenceScore: number;
  valueFactors: {
    positives: string[];
    considerations: string[];
    marketContext?: string;
  };
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ValuationPage() {
  // VIN lookup state
  const [vinInput, setVinInput] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const [vinFound, setVinFound] = useState(false);

  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<string>('');
  const [trim, setTrim] = useState('');
  const [mileage, setMileage] = useState<string>('');
  const [specs, setSpecs] = useState('gcc');
  const [emirate, setEmirate] = useState('dubai');
  
  // Optional fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bodyType, setBodyType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [cylinders, setCylinders] = useState('');
  const [warrantyType, setWarrantyType] = useState('');
  
  // Result state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  // Make options for combobox
  const makeOptions: ComboboxOption[] = useMemo(() => 
    CAR_MAKES.map(m => ({ value: m, label: m })),
    []
  );

  // Model options based on selected make
  const modelOptions: ComboboxOption[] = useMemo(() => {
    if (!make) return [];
    const models = getModelsForMake(make);
    return models.map(m => ({ value: m, label: m }));
  }, [make]);

  const canSubmit = make && model && year && mileage;

  // VIN Lookup - Uses NHTSA VIN decoder API
  const handleVinLookup = async () => {
    if (!isValidVin(vinInput)) {
      setVinError('Please enter a valid 17-character VIN');
      return;
    }

    setVinLoading(true);
    setVinError(null);
    setVinFound(false);

    try {
      const response = await fetch(`/api/listings/check-vin?vin=${encodeURIComponent(vinInput.trim())}`);
      const data = await response.json();

      // Use decoded VIN data from NHTSA API
      if (data.decoded) {
        const decoded = data.decoded;
        
        // Find matching make in our list (case-insensitive)
        const matchedMake = CAR_MAKES.find(m => 
          m.toLowerCase() === decoded.make?.toLowerCase()
        );
        
        if (matchedMake) {
          setMake(matchedMake);
          
          // Find matching model for this make
          const models = getModelsForMake(matchedMake);
          const matchedModel = models.find(m => 
            m.toLowerCase() === decoded.model?.toLowerCase()
          );
          setModel(matchedModel || decoded.model || '');
        } else {
          // If make not in our list, still set it
          setMake(decoded.make || '');
          setModel(decoded.model || '');
        }
        
        setYear(decoded.year?.toString() || '');
        setTrim(decoded.trim || '');
        
        // Map body type to our values
        if (decoded.bodyType) {
          const matchedBody = BODY_TYPES.find(b => 
            b.value === decoded.bodyType?.toLowerCase() ||
            b.label.toLowerCase() === decoded.bodyType?.toLowerCase()
          );
          if (matchedBody) setBodyType(matchedBody.value);
        }
        
        // Map fuel type to our values
        if (decoded.fuelType) {
          const matchedFuel = FUEL_TYPES.find(f => 
            f.value === decoded.fuelType?.toLowerCase() ||
            f.label.toLowerCase() === decoded.fuelType?.toLowerCase()
          );
          if (matchedFuel) setFuelType(matchedFuel.value);
        }
        
        // Map transmission to our values
        if (decoded.transmission) {
          const matchedTrans = TRANSMISSION_TYPES.find(t => 
            t.value === decoded.transmission?.toLowerCase() ||
            t.label.toLowerCase().includes(decoded.transmission?.toLowerCase() || '')
          );
          if (matchedTrans) setTransmission(matchedTrans.value);
        }
        
        // Set cylinders
        if (decoded.cylinders) {
          setCylinders(decoded.cylinders.toString());
        }
        
        setVinFound(true);
        setShowAdvanced(true); // Show advanced to display autofilled data
      } else if (data.decodeError) {
        setVinError(`Could not decode VIN: ${data.decodeError}`);
      } else {
        setVinError('Could not decode VIN. Please enter details manually.');
      }
    } catch (err) {
      setVinError('Failed to decode VIN. Please try again or enter details manually.');
    } finally {
      setVinLoading(false);
    }
  };

  const clearVin = () => {
    setVinInput('');
    setVinError(null);
    setVinFound(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make,
          model,
          year: Number(year),
          trim: trim || undefined,
          mileage: Number(mileage),
          specs,
          emirate: UAE_EMIRATES.find(e => e.value === emirate)?.label || emirate,
          bodyType: bodyType || undefined,
          fuelType: fuelType || undefined,
          transmission: transmission || undefined,
          cylinders: cylinders ? Number(cylinders) : undefined,
          warrantyType: warrantyType || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate valuation');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMake('');
    setModel('');
    setYear('');
    setTrim('');
    setMileage('');
    setSpecs('gcc');
    setEmirate('dubai');
    setBodyType('');
    setFuelType('');
    setTransmission('');
    setCylinders('');
    setWarrantyType('');
    setResult(null);
    setError(null);
    setShowAdvanced(false);
    setVinInput('');
    setVinError(null);
    setVinFound(false);
  };

  const getTrendIcon = () => {
    if (!result) return null;
    switch (result.priceTrend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Tools
            </p>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-yellow-600 bg-yellow-500/15 border border-yellow-500/30 rounded">
              Beta
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Car Valuation</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
          Get an AI-powered estimate of your car's market value in UAE. 
          Enter your vehicle details below or use VIN for quick autofill.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground/50">
          <span>Free</span>
          <span>•</span>
          <span>AI-Powered</span>
          <span>•</span>
          <span>UAE Market</span>
        </div>
      </header>

      {/* Beta Disclaimer */}
      <div className="flex gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Beta Feature - Use as a Guide Only
          </p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            This valuation is an AI-generated estimate based on market data and should not be solely relied upon 
            for buying or selling decisions. Actual market values may vary. Always conduct your own research, 
            get professional appraisals, and compare multiple sources before making financial decisions.
          </p>
        </div>
      </div>

      {/* Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* VIN Quick Fill */}
          <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Car className="w-4 h-4 text-muted-foreground" />
              Quick Fill with VIN
              <span className="text-[10px] font-normal text-muted-foreground/50">(optional)</span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Enter your VIN to automatically decode and fill in vehicle details (make, model, year, engine, etc.)
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={vinInput}
                  onChange={(e) => {
                    setVinInput(e.target.value.toUpperCase());
                    setVinError(null);
                    setVinFound(false);
                  }}
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                  className="h-11 pr-10 font-mono text-sm uppercase"
                />
                {vinInput && (
                  <button
                    type="button"
                    onClick={clearVin}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleVinLookup}
                disabled={vinInput.length !== 17 || vinLoading}
                className="h-11 px-4"
              >
                {vinLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {vinError && (
              <p className="text-xs text-red-500">{vinError}</p>
            )}
            {vinFound && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vehicle details decoded from VIN
              </p>
            )}
          </div>

          {/* Required Fields */}
          <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              Vehicle Details
            </div>

            {/* Make & Model Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Make *</label>
                <Combobox
                  options={makeOptions}
                  value={make}
                  onValueChange={(val) => {
                    setMake(val);
                    setModel(''); // Reset model when make changes
                  }}
                  placeholder="Select make"
                  searchPlaceholder="Search makes..."
                  emptyText="No make found"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Model *</label>
                {modelOptions.length > 0 ? (
                  <Combobox
                    options={modelOptions}
                    value={model}
                    onValueChange={setModel}
                    placeholder="Select model"
                    searchPlaceholder="Search models..."
                    emptyText="No model found"
                    disabled={!make}
                    className="h-11"
                  />
                ) : (
                  <Input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={make ? "Enter model" : "Select make first"}
                    disabled={!make}
                    className="h-11"
                  />
                )}
              </div>
            </div>

            {/* Year & Trim Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Year *</label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Trim (optional)</label>
                <Input
                  type="text"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  placeholder="e.g., SE, Limited, Sport"
                  className="h-11"
                />
              </div>
            </div>

            {/* Mileage & Specs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Mileage (km) *</label>
                <Input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g., 50000"
                  min="0"
                  max="1000000"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Regional Specs *</label>
                <Select value={specs} onValueChange={setSpecs}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select specs" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECS_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Location *</label>
              <Select value={emirate} onValueChange={setEmirate}>
                <SelectTrigger className="h-11 max-w-xs">
                  <SelectValue placeholder="Select emirate" />
                </SelectTrigger>
                <SelectContent>
                  {UAE_EMIRATES.map((em) => (
                    <SelectItem key={em.value} value={em.value}>{em.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-muted/20 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                Additional Details (improves accuracy)
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                showAdvanced && "rotate-180"
              )} />
            </button>

            {showAdvanced && (
              <div className="p-6 pt-2 space-y-4 border-t border-border/30">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Body Type</label>
                    <Select value={bodyType} onValueChange={setBodyType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_TYPES.map((bt) => (
                          <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Fuel Type</label>
                    <Select value={fuelType} onValueChange={setFuelType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map((ft) => (
                          <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Transmission</label>
                    <Select value={transmission} onValueChange={setTransmission}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSMISSION_TYPES.map((tr) => (
                          <SelectItem key={tr.value} value={tr.value}>{tr.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Cylinders</label>
                    <Select value={cylinders} onValueChange={setCylinders}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 8, 10, 12].map((c) => (
                          <SelectItem key={c} value={c.toString()}>{c} cyl</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Warranty</label>
                  <Input
                    type="text"
                    value={warrantyType}
                    onChange={(e) => setWarrantyType(e.target.value)}
                    placeholder="e.g., Manufacturer warranty until 2027"
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className={cn(
              "w-full h-12 text-sm font-medium",
              canSubmit && !isLoading
                ? "bg-foreground text-background hover:bg-foreground/90"
                : ""
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Valuation
              </>
            )}
          </Button>
        </form>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Main Valuation Card */}
          <div className="rounded-xl border border-border/40 bg-card/50 p-8 space-y-8">
            {/* Vehicle Summary */}
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground/50 uppercase tracking-wider">Valuation for</p>
              <h2 className="text-xl font-semibold">
                {year} {make} {model} {trim}
              </h2>
              <p className="text-sm text-muted-foreground">
                {Number(mileage).toLocaleString()} km • {SPECS_TYPES.find(s => s.value === specs)?.label || specs} • {UAE_EMIRATES.find(e => e.value === emirate)?.label || emirate}
              </p>
            </div>

            {/* Fair Value */}
            <div className="text-center space-y-2 py-6 border-y border-border/30">
              <p className="text-xs text-muted-foreground/50 uppercase tracking-wider">Estimated Fair Value</p>
              <p className="text-4xl font-bold tracking-tight">{formatPrice(result.fairValue)}</p>
              <p className="text-sm text-muted-foreground">
                Range: {formatPrice(result.estimateMin)} – {formatPrice(result.estimateMax)}
              </p>
            </div>

            {/* Scores & Trend */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">QI Score</p>
                <p className="text-2xl font-bold">{result.qiScore}</p>
                <p className="text-[10px] text-muted-foreground">/100</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-2xl font-bold">{Math.round(result.aiConfidenceScore * 100)}%</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-1">Trend</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {getTrendIcon()}
                  <span className="text-sm font-medium capitalize">{result.priceTrend}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value Factors */}
          {(result.valueFactors.positives.length > 0 || result.valueFactors.considerations.length > 0) && (
            <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-6">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                Value Factors
              </h3>

              {result.valueFactors.positives.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider">Positives</p>
                  <div className="space-y-1.5">
                    {result.valueFactors.positives.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.valueFactors.considerations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-wider">Considerations</p>
                  <div className="space-y-1.5">
                    {result.valueFactors.considerations.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Info className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.valueFactors.marketContext && (
                <div className="pt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground/60 italic">
                    {result.valueFactors.marketContext}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer Reminder */}
          <div className="flex gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
            <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is an AI-generated estimate. Actual market values depend on vehicle condition, service history, 
                current demand, and negotiation. Use this as a starting point for your research, not as financial advice.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 h-11"
            >
              Value Another Car
            </Button>
            <Button asChild className="flex-1 h-11 bg-foreground text-background hover:bg-foreground/90">
              <Link href="/listings">
                Browse Listings
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Learn More */}
      <div className="pt-8 border-t border-border/30 space-y-4">
        <h3 className="text-sm font-medium">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Enter Details', desc: 'Provide your vehicle information or use VIN to autofill make, model, year, and mileage.' },
            { title: 'AI Analysis', desc: 'Our AI analyzes UAE market data, pricing trends, and vehicle specifics.' },
            { title: 'Get Estimate', desc: 'Receive a fair value estimate with confidence score and market context.' },
          ].map((step, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/10 space-y-2">
              <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </div>
              <h4 className="text-sm font-medium">{step.title}</h4>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

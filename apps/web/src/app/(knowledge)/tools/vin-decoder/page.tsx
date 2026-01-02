/**
 * VIN Decoder Tool Page
 * Interactive VIN decoding tool - macOS-inspired clean design
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils';

interface VINDecodeResult {
  vin: string;
  year: number;
  make: string;
  model?: string;
  trim?: string;
  bodyType?: string;
  doors?: string;
  engineSize?: string;
  engineType?: string;
  cylinders?: number;
  fuelType?: string;
  transmission?: string;
}

export default function VINDecoderPage() {
  const [vin, setVin] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<VINDecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVinChange = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[IOQ]/g, '').slice(0, 17);
    setVin(cleaned);
    if (cleaned.length < 17) {
      setResult(null);
      setError(null);
    }
  };

  const handleDecode = async () => {
    if (vin.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/listings/check-vin?vin=${vin}`);
      const data = await response.json();

      if (data.decoded) {
        setResult(data.decoded);
      } else {
        setError('Unable to decode VIN. Please verify the VIN is correct.');
      }
    } catch (err) {
      setError('Failed to decode VIN. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && vin.length === 17) {
      handleDecode();
    }
  };

  return (
    <div className="space-y-16">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
            Tools
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">VIN Decoder</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xl">
          Instantly decode any 17-character Vehicle Identification Number. 
          Verify specifications and authenticity for cars in UAE.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground/50">
          <span>Free</span>
          <span>•</span>
          <span>Instant</span>
          <span>•</span>
          <span>No signup</span>
        </div>
      </header>

      {/* VIN Input Card */}
      <section className="space-y-6">
        <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Vehicle Identification Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={vin}
                onChange={(e) => handleVinChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter 17-character VIN"
                className={cn(
                  "w-full h-11 bg-transparent border-b text-base font-mono tracking-widest uppercase",
                  "transition-colors focus:outline-none px-0 placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-sans",
                  result && "border-green-500",
                  error && "border-red-500",
                  !result && !error && "border-border focus:border-foreground"
                )}
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                  {vin.length}/17
                </span>
                {isChecking ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : result ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : error ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Decode Button */}
          <button
            onClick={handleDecode}
            disabled={vin.length !== 17 || isChecking}
            className={cn(
              "w-full h-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
              vin.length === 17 && !isChecking
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground/50 cursor-not-allowed"
            )}
          >
            {isChecking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Decoding...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Decode VIN
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="flex gap-3 px-4 py-3 bg-muted/15 border border-border/40 rounded-lg text-xs">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground/70">
            Letters I, O, and Q are not used in VINs to avoid confusion with numbers.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs text-muted-foreground/70">
                Make sure you've entered the complete 17-character VIN correctly.
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
            {/* Success Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-muted/15">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-500">VIN Decoded Successfully</p>
                <p className="text-xs text-muted-foreground/50 font-mono">{result.vin}</p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-6 space-y-6">
              {/* Primary Info */}
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                  Vehicle
                </p>
                <p className="text-lg font-semibold tracking-tight">
                  {result.year} {result.make} {result.model || ''}
                </p>
                {result.trim && (
                  <p className="text-sm text-muted-foreground/70">{result.trim}</p>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {result.bodyType && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Body</p>
                    <p className="text-sm font-medium capitalize">{result.bodyType}</p>
                  </div>
                )}
                {result.doors && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Doors</p>
                    <p className="text-sm font-medium">{result.doors}</p>
                  </div>
                )}
                {result.fuelType && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Fuel</p>
                    <p className="text-sm font-medium capitalize">{result.fuelType}</p>
                  </div>
                )}
                {result.transmission && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Transmission</p>
                    <p className="text-sm font-medium capitalize">{result.transmission}</p>
                  </div>
                )}
                {result.engineSize && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Engine</p>
                    <p className="text-sm font-medium">{result.engineSize}</p>
                  </div>
                )}
                {result.cylinders && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Cylinders</p>
                    <p className="text-sm font-medium">{result.cylinders}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
                <button
                  onClick={() => {
                    setVin('');
                    setResult(null);
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors"
                >
                  Check Another
                </button>
                <Link
                  href="/knowledge/basics/vin-guide"
                  className="px-4 py-2 rounded-full border border-border/40 text-xs font-medium hover:bg-muted/50 transition-colors"
                >
                  Learn about VINs
                </Link>
                <Link
                  href="/listings"
                  className="px-4 py-2 rounded-full border border-border/40 text-xs font-medium hover:bg-muted/50 transition-colors"
                >
                  Browse Cars
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="space-y-6">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">How it works</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Enter VIN', desc: 'Type the 17-character VIN from dashboard, door jamb, or documents.', color: 'text-blue-500' },
            { step: '2', title: 'Instant decode', desc: 'Our system extracts vehicle specifications from each VIN section.', color: 'text-purple-500' },
            { step: '3', title: 'View details', desc: 'Get make, model, year, engine specs, and more instantly.', color: 'text-green-500' },
          ].map((item) => (
            <div key={item.step} className="space-y-3">
              <div className={`w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold ${item.color}`}>
                {item.step}
              </div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <div className="border-b border-border/30 pb-2">
          <h2 className="text-lg font-medium tracking-tight">FAQ</h2>
        </div>
        
        <div className="space-y-5">
          {[
            { q: 'Is this really free?', a: 'Yes, completely free with no registration. Decode unlimited VINs.' },
            { q: 'Where do I find the VIN?', a: 'Check dashboard (through windshield), driver door jamb, or registration documents (Mulkiya).' },
            { q: 'Works for all cars in UAE?', a: 'Yes—GCC-spec, American-spec, European-spec, and more.' },
            { q: 'VIN not decoding?', a: 'Verify all 17 characters are correct. Some rare vehicles may have limited data.' },
          ].map((item) => (
            <div key={item.q} className="space-y-1">
              <h3 className="text-sm font-medium">{item.q}</h3>
              <p className="text-xs text-muted-foreground/70">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Link
            href="/knowledge/basics/vin-guide"
            className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Read full VIN guide →
          </Link>
        </div>
      </section>
    </div>
  );
}

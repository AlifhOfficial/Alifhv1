'use client';

import { useState, useCallback } from 'react';
import { Loader2, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/utils';
import type { VINCheckResponse } from './types';

interface VINInputProps {
  value: string;
  onChange: (value: string) => void;
  onDecode: (response: VINCheckResponse) => void;
  disabled?: boolean;
  excludeListingId?: string;
}

export function VINInput({ value, onChange, onDecode, disabled, excludeListingId }: VINInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const checkVIN = useCallback(async (vin: string) => {
    if (vin.length !== 17) {
      setStatus('idle');
      setMessage('');
      return;
    }
    
    setIsChecking(true);
    setStatus('checking');
    
    try {
      const params = new URLSearchParams({ vin });
      if (excludeListingId) params.append('excludeId', excludeListingId);
      
      const response = await fetch(`/api/listings/check-vin?${params}`);
      const data: VINCheckResponse = await response.json();
      
      if (data.available) {
        setStatus('available');
        // Handle partial decode - model may be empty for some VINs
        if (data.decoded) {
          const { year, make, model } = data.decoded;
          setMessage(model ? `${year} ${make} ${model}` : `${year} ${make} - select model below`);
        } else {
          setMessage('VIN verified');
        }
        onDecode(data);
      } else {
        setStatus('taken');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Failed to verify VIN');
    } finally {
      setIsChecking(false);
    }
  }, [excludeListingId, onDecode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().replace(/[IOQ]/g, '').slice(0, 17);
    onChange(newValue);
    
    if (newValue.length === 17) {
      checkVIN(newValue);
    } else {
      setStatus('idle');
      setMessage('');
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-[13px] font-semibold tracking-tight text-foreground/80">
          Vehicle Identification Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Enter 17-character VIN"
            className={cn(
              "w-full h-12 bg-background border rounded-xl text-[16px] font-mono tracking-[0.16em] uppercase px-4 pr-12",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
              status === 'available' && "border-green-500/40 bg-green-500/5 focus:border-green-500/60",
              status === 'taken' && "border-red-500/40 bg-red-500/5 focus:border-red-500/60",
              status === 'error' && "border-amber-500/40 bg-amber-500/5 focus:border-amber-500/60",
              (status === 'idle' || status === 'checking') && "border-border/50 hover:bg-muted/10 focus:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed",
              "placeholder:text-muted-foreground/40 placeholder:tracking-normal placeholder:font-sans placeholder:text-[14px]"
            )}
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isChecking ? (
              <Loader2 className="w-5 h-5 text-muted-foreground/60 animate-spin" />
            ) : status === 'available' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : status === 'taken' || status === 'error' ? (
              <X className="w-5 h-5 text-red-500" />
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Character count */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-muted-foreground/50 tabular-nums">
          {value.length} / 17 characters
        </p>
        {/* Status message */}
        {message && (
          <p className={cn(
            "text-[13px] font-semibold",
            status === 'available' && "text-green-600",
            status === 'taken' && "text-red-500",
            status === 'error' && "text-amber-600"
          )}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

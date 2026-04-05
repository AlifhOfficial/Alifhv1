'use client';

/**
 * VIN Input Component - macOS Style
 * 
 * Clean, minimal VIN entry with status indicators.
 * Following "Less is More" principle.
 */

import { useState, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import type { VINCheckResponse } from './types';

/** VIN validation pattern (17 chars, no I, O, Q) */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

interface VINInputProps {
  value: string;
  onChange: (value: string) => void;
  onDecode: (response: VINCheckResponse) => void;
  disabled?: boolean;
  excludeListingId?: string;
  error?: string;
}

export function VINInput({ value, onChange, onDecode, disabled, excludeListingId, error }: VINInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error' | 'invalid'>('idle');
  const [message, setMessage] = useState('');
  
  const checkVIN = useCallback(async (vin: string) => {
    if (vin.length < 17) {
      setStatus('idle');
      setMessage(vin.length > 0 ? `${vin.length}/17 characters` : '');
      return;
    }
    
    if (vin.length > 17) {
      setStatus('invalid');
      setMessage('VIN cannot be more than 17 characters');
      return;
    }
    
    // Check for invalid characters I, O, Q
    if (/[IOQ]/i.test(vin)) {
      setStatus('invalid');
      setMessage('VIN cannot contain letters I, O, or Q');
      return;
    }
    
    // Validate format before API call
    if (!VIN_PATTERN.test(vin)) {
      setStatus('invalid');
      setMessage('VIN can only contain letters A-H, J-N, P-R, S-Z and numbers 0-9');
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
        if (data.decoded) {
          const { year, make, model } = data.decoded;
          setMessage(model ? `${year} ${make} ${model}` : `${year} ${make}`);
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
      {/* Label */}
      <label className="text-subhead font-semibold text-sidebar-foreground/70">
        Vehicle Identification Number
      </label>
      
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Enter 17-character VIN"
          className={cn(
            "w-full h-14 bg-transparent text-headline font-mono tracking-[0.15em] uppercase px-0 pr-12 text-sidebar-foreground",
            "transition-all duration-200 outline-none",
            status === 'available' && "text-success",
            (status === 'taken' || status === 'invalid' || error) && "text-destructive",
            status === 'error' && "text-warning",
            disabled && "opacity-50 cursor-not-allowed",
            "placeholder:text-sidebar-foreground/30 placeholder:tracking-normal placeholder:text-callout"
          )}
        />
        
        {/* Status Icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {isChecking ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : status === 'available' ? (
            <div className="p-1 bg-success-muted rounded-full">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
          ) : status === 'taken' || status === 'invalid' || error ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : status === 'error' ? (
            <AlertCircle className="w-5 h-5 text-warning" />
          ) : null}
        </div>
      </div>
      
      {/* Footer - Character count & status message */}
      <div className="flex items-center justify-between">
        <p className="text-caption2 font-semibold text-sidebar-foreground/70 tabular-nums">
          {value.length}/17
        </p>
        {(message || error) && (
          <p className={cn(
            "text-caption1 font-semibold",
            status === 'available' && "text-success",
            (status === 'taken' || status === 'invalid' || error) && "text-destructive",
            status === 'error' && "text-warning"
          )}>
            {message || error}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

/**
 * Combobox Component - Clean Minimal Style
 * 
 * Following Revvup Design Philosophy:
 * - Border-bottom style inputs
 * - Clean transitions
 * - No heavy card borders
 */

import { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ComboboxProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-controls={listId}
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-12 flex items-center justify-between px-0 bg-transparent",
            "transition-colors focus:outline-none",
            value ? "text-sidebar-foreground text-sm font-medium" : "text-sidebar-foreground/40 text-sm",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected?.icon}
            {selected?.label || placeholder}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-sidebar-foreground/40 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-sidebar-border shadow-xl bg-sidebar backdrop-blur-xl z-[10000]" 
        align="start"
        sideOffset={8}
      >
        <Command className="rounded-xl bg-transparent">
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="h-11 border-b border-sidebar-border text-sm" 
          />
          <CommandList id={listId} className="max-h-[240px]">
            <CommandEmpty className="py-8 text-center text-sm text-sidebar-foreground/50">
              No results found
            </CommandEmpty>
            <CommandGroup className="p-1.5">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors text-sidebar-foreground",
                    value === option.value && "bg-primary/10 text-primary"
                  )}
                >
                  <span className="flex items-center gap-2.5 flex-1">
                    {option.icon}
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

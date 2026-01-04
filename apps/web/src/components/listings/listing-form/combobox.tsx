'use client';

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
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
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
            "w-full h-11 flex items-center justify-between px-4 bg-background border border-border/40 rounded-xl text-sm",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            value ? "text-foreground font-medium" : "text-muted-foreground/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="flex items-center gap-2.5 truncate">
            {selected?.icon}
            {selected?.label || placeholder}
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground/50 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border-border/50 shadow-lg" align="start">
        <Command className="rounded-xl">
          <CommandInput placeholder={searchPlaceholder} className="h-10 border-b border-border/30" />
          <CommandList id={listId} className="max-h-[280px]">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground/60">No results found.</CommandEmpty>
            <CommandGroup className="p-1">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors",
                    value === option.value && "bg-primary/5"
                  )}
                >
                  <span className="flex items-center gap-2 flex-1">
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

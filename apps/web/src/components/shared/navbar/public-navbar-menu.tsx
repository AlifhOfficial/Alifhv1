'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/navigation';
import { MegaDropdown } from './mega-dropdown';

interface PublicNavbarMenuProps {
  navItems: NavItem[];
}

export function PublicNavbarMenu({ navItems }: PublicNavbarMenuProps) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const handleDropdownOpen = useCallback((label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveDropdown(label);
  }, []);

  const cancelDropdownClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  return (
    <>
      <div className="hidden lg:flex items-baseline gap-1">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline"
            onMouseEnter={() => item.submenu && !item.hideSubmenu && handleDropdownOpen(item.label)}
            onMouseLeave={() => item.submenu && !item.hideSubmenu && handleDropdownClose()}
          >
            <Link
              href={item.href}
              className={`inline-flex items-baseline rounded-md px-4 py-2.5 text-[15px] font-semibold leading-none tracking-tight transition-colors ${
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="block">{item.label}</span>
            </Link>
          </div>
        ))}
      </div>

      <MegaDropdown
        activeDropdown={activeDropdown}
        navItems={navItems}
        onClose={() => setActiveDropdown(null)}
        onMouseEnter={cancelDropdownClose}
        onMouseLeave={handleDropdownClose}
      />
    </>
  );
}

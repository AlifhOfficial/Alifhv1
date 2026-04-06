'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  BanknotesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/partner-dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Organizations',
    href: '/partner-organizations',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Partnerships',
    href: '/partner-partnerships',
    icon: UserGroupIcon,
  },
  {
    name: 'Users',
    href: '/partner-users',
    icon: UsersIcon,
  },
  {
    name: 'Analytics',
    href: '/partner-analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Billing',
    href: '/partner-billing',
    icon: BanknotesIcon,
  },
  {
    name: 'Resources',
    href: '/partner-resources',
    icon: DocumentTextIcon,
  },
  {
    name: 'Settings',
    href: '/partner-settings',
    icon: CogIcon,
  },
];

export function PartnerDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-background border-r border-border/40">
      <div className="p-6 border-b border-border/20">
        <h2 className="text-headline font-semibold text-foreground">Partner Hub</h2>
      </div>
      
      <div className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-subhead rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-muted text-primary'
                      : 'text-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-border/20">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-subhead text-white">P</span>
          </div>
          <div className="ml-3">
            <p className="text-subhead text-foreground">Partner Portal</p>
            <p className="text-caption1 text-muted-foreground">Management</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
    <nav className="flex flex-col h-full bg-emerald-50 border-r border-emerald-200">
      <div className="p-6 border-b border-emerald-200">
        <h2 className="text-lg font-semibold text-emerald-900">Partner Hub</h2>
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
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 border-r-2 border-emerald-600'
                      : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-emerald-600'
                        : 'text-emerald-500 group-hover:text-emerald-600'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-emerald-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">P</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-emerald-800">Partner Portal</p>
            <p className="text-xs text-emerald-600">Management</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
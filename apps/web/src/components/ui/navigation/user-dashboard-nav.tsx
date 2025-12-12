'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/user-dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
  },
  {
    name: 'Documents',
    href: '/user-documents',
    icon: DocumentTextIcon,
  },
  {
    name: 'Analytics',
    href: '/user-analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Notifications',
    href: '/user-notifications',
    icon: BellIcon,
  },
  {
    name: 'Settings',
    href: '/user-settings',
    icon: CogIcon,
  },
];

export function UserDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>
      
      <div className="flex-1 px-3">
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
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">User Portal</p>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
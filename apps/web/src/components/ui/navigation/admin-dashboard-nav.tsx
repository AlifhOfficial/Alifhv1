'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ServerIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin-dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Users',
    href: '/admin-users',
    icon: UsersIcon,
  },
  {
    name: 'Partners',
    href: '/admin-partners',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Analytics',
    href: '/admin-analytics',
    icon: ChartBarIcon,
  },
  {
    name: 'Content',
    href: '/admin-content',
    icon: DocumentTextIcon,
  },
  {
    name: 'System',
    href: '/admin-system',
    icon: ServerIcon,
  },
  {
    name: 'Security',
    href: '/admin-security',
    icon: KeyIcon,
  },
  {
    name: 'Settings',
    href: '/admin-settings',
    icon: CogIcon,
  },
];

export function AdminDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-black text-white">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-headline font-semibold">Admin Panel</h2>
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
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-white'
                        : 'text-white/50 group-hover:text-white/70'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-subhead text-white">A</span>
          </div>
          <div className="ml-3">
            <p className="text-subhead text-white">Admin Portal</p>
            <p className="text-caption1 text-white/60">Full Access</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  ShareIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface PartnerSecondaryNavProps {
  currentSection?: string;
  onActionSelect?: (action: string) => void;
}

const quickActions = [
  {
    name: 'View Details',
    action: 'view',
    icon: EyeIcon,
    description: 'View detailed information',
  },
  {
    name: 'Edit',
    action: 'edit',
    icon: PencilIcon,
    description: 'Edit current item',
  },
  {
    name: 'Add New',
    action: 'add',
    icon: PlusIcon,
    description: 'Create new item',
  },
  {
    name: 'Refresh',
    action: 'refresh',
    icon: ArrowPathIcon,
    description: 'Refresh data',
  },
  {
    name: 'Share',
    action: 'share',
    icon: ShareIcon,
    description: 'Share with team',
  },
  {
    name: 'Favorite',
    action: 'favorite',
    icon: StarIcon,
    description: 'Add to favorites',
  },
];

const recentActivity = [
  { action: 'Organization updated', time: '2 min ago' },
  { action: 'New partnership request', time: '15 min ago' },
  { action: 'User invitation sent', time: '1 hour ago' },
  { action: 'Analytics report generated', time: '2 hours ago' },
];

export function PartnerSecondaryNav({ currentSection, onActionSelect }: PartnerSecondaryNavProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-xs text-gray-500 mt-1">
          {currentSection ? `for ${currentSection}` : 'Select an item'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="p-3">
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => onActionSelect?.(action.action)}
                className={cn(
                  'w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left',
                  'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <action.icon className="mr-3 h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{action.name}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="border-t border-gray-200 p-3">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Recent Activity
          </h4>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <ClockIcon className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-700">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Context Info */}
        <div className="border-t border-gray-200 p-3">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Context
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Active partnerships: 12</p>
            <p>Pending requests: 3</p>
            <p>Monthly users: 1.2K</p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { cn } from '@/utils';
import {
  EyeIcon,
  PencilIcon,
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
    <div className="flex flex-col h-full bg-background border-r border-border/40 w-64">
      <div className="p-4 border-b border-border/20">
        <h3 className="text-subhead font-semibold text-foreground">Quick Actions</h3>
        <p className="text-caption1 text-muted-foreground mt-1">
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
                  'w-full flex items-center px-3 py-2 text-subhead rounded-md transition-colors text-left',
                  'text-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <action.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{action.name}</div>
                  <div className="text-caption1 text-muted-foreground">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="border-t border-border/20 p-3">
          <h4 className="text-caption1 font-semibold text-foreground uppercase tracking-wide mb-3">
            Recent Activity
          </h4>
          <div className="space-y-2">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <ClockIcon className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-caption1 text-foreground">{activity.action}</p>
                  <p className="text-caption1 text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Context Info */}
        <div className="border-t border-border/20 p-3">
          <h4 className="text-caption1 font-semibold text-foreground uppercase tracking-wide mb-3">
            Context
          </h4>
          <div className="text-caption1 text-muted-foreground space-y-1">
            <p>Active partnerships: 12</p>
            <p>Pending requests: 3</p>
            <p>Monthly users: 1.2K</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { ComponentType } from 'react';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  BarChart3,
  CalendarPlus,
  CheckCircle2,
  HelpCircle,
  Pencil,
  Trash2,
} from 'lucide-react-native';

import { Colors } from '@/constants/theme';
import type { LifecycleStatus, ModerationStatus } from '@/lib/sell-car-user-api';

type InventoryActionIcon = ComponentType<{ size: number; color: string }>;

export type EditStatusAction =
  | 'edit'
  | 'view_stats'
  | 'view_review_reason'
  | 'mark_sold'
  | 'extend'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'hard_delete';

export interface InventoryActionContext {
  moderationStatus?: string | null;
  lifecycleStatus?: string | null;
  isArchived: boolean;
  expiresAt?: string | null;
}

export interface InventoryActionRow {
  key: EditStatusAction;
  label: string;
  icon: InventoryActionIcon;
  color: (colors: typeof Colors.dark) => string;
  visible: (context: {
    moderationStatus: ModerationStatus;
    lifecycleStatus: LifecycleStatus;
    isArchived: boolean;
    expiresAt?: string | null;
  }) => boolean;
}

export const INVENTORY_ACTION_ROWS: InventoryActionRow[] = [
  {
    key: 'edit',
    label: 'Edit Listing',
    icon: Pencil,
    color: (colors) => colors.label,
    visible: ({ lifecycleStatus, moderationStatus }) =>
      lifecycleStatus !== 'expired' &&
      lifecycleStatus !== 'sold' &&
      lifecycleStatus !== 'deleted' &&
      moderationStatus !== 'rejected',
  },
  {
    key: 'view_stats',
    label: 'View Insights',
    icon: BarChart3,
    color: (colors) => colors.label,
    visible: ({ moderationStatus }) => moderationStatus === 'approved',
  },
  {
    key: 'view_review_reason',
    label: 'Why In Review?',
    icon: HelpCircle,
    color: (colors) => colors.warning,
    visible: ({ moderationStatus }) =>
      moderationStatus === 'submitted' || moderationStatus === 'pending_review',
  },
  {
    key: 'mark_sold',
    label: 'Mark as Sold',
    icon: CheckCircle2,
    color: (colors) => colors.success,
    visible: ({ moderationStatus, lifecycleStatus, isArchived }) =>
      moderationStatus === 'approved' && lifecycleStatus === 'active' && !isArchived,
  },
  {
    key: 'extend',
    label: 'Extend Listing',
    icon: CalendarPlus,
    color: (colors) => colors.primary,
    visible: ({ moderationStatus, lifecycleStatus, isArchived, expiresAt }) => {
      if (moderationStatus !== 'approved' || lifecycleStatus !== 'active' || isArchived || !expiresAt) {
        return false;
      }

      const daysLeft = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 2;
    },
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: Archive,
    color: (colors) => colors.warning,
    visible: ({ lifecycleStatus, isArchived }) => lifecycleStatus === 'active' && !isArchived,
  },
  {
    key: 'unarchive',
    label: 'Unarchive',
    icon: ArchiveRestore,
    color: (colors) => colors.primary,
    visible: ({ isArchived }) => isArchived,
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    color: (colors) => colors.error,
    visible: ({ lifecycleStatus }) => lifecycleStatus !== 'deleted',
  },
  {
    key: 'hard_delete',
    label: 'Delete Forever',
    icon: AlertTriangle,
    color: (colors) => colors.error,
    visible: ({ lifecycleStatus }) => lifecycleStatus === 'deleted',
  },
];

export function isModerationStatus(value?: string | null): value is ModerationStatus {
  return value === 'draft' || value === 'submitted' || value === 'pending_review' || value === 'approved' || value === 'rejected';
}

export function isLifecycleStatus(value?: string | null): value is LifecycleStatus {
  return value === 'active' || value === 'archived' || value === 'sold' || value === 'expired' || value === 'deleted';
}

export function useInventoryActionMenu(context: InventoryActionContext) {
  if (!isModerationStatus(context.moderationStatus) || !isLifecycleStatus(context.lifecycleStatus)) {
    return INVENTORY_ACTION_ROWS.filter((action) => action.key === 'edit' || action.key === 'delete');
  }

  const moderationStatus = context.moderationStatus;
  const lifecycleStatus = context.lifecycleStatus;

  return INVENTORY_ACTION_ROWS.filter((action) =>
    action.visible({
      moderationStatus,
      lifecycleStatus,
      isArchived: context.isArchived,
      expiresAt: context.expiresAt,
    }),
  );
}
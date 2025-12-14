"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { AddStaffForm, EditStaffForm } from "./team-forms";

interface TeamActionsProps {
  canManage: boolean;
}

export function TeamActions({ canManage }: TeamActionsProps) {
  const { open } = useRightSidebar();

  if (!canManage) return null;

  return (
    <button
      onClick={() => open("Add Team Member", <AddStaffForm />)}
      className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 text-sm font-medium"
    >
      + Add Member
    </button>
  );
}

interface StaffCardActionsProps {
  staff: any;
  canManage: boolean;
}

export function StaffCardActions({ staff, canManage }: StaffCardActionsProps) {
  const { open } = useRightSidebar();

  if (!canManage) return null;

  return (
    <button
      onClick={() => open("Edit Team Member", <EditStaffForm staff={staff} />)}
      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
    >
      Edit
    </button>
  );
}

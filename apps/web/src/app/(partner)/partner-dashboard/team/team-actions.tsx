"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { AddStaffForm, EditStaffForm } from "./team-forms";
import { Plus, Settings2 } from "lucide-react";

interface TeamActionsProps {
  canManage: boolean;
}

export function TeamActions({ canManage }: TeamActionsProps) {
  const { open } = useRightSidebar();

  if (!canManage) return null;

  return (
    <button
      onClick={() => open("Add Team Member", <AddStaffForm />)}
      className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 text-sm font-medium transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Member
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
      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-all"
      aria-label="Edit team member"
    >
      <Settings2 className="w-4 h-4" />
    </button>
  );
}

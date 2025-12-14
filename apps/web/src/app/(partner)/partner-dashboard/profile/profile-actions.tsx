"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { EditProfileForm } from "./edit-profile-form";

interface ProfileActionsProps {
  partner: any;
}

export function ProfileActions({ partner }: ProfileActionsProps) {
  const { open } = useRightSidebar();

  return (
    <button
      onClick={() => open("Edit Profile", <EditProfileForm partner={partner} />)}
      className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 text-sm font-medium"
    >
      Edit Profile
    </button>
  );
}

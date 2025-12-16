"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { BusinessHoursForm, ServiceFeaturesForm, NotificationPreferencesForm } from "./settings-forms";

interface SettingsActionsProps {
  type: "businessHours" | "services" | "notifications";
  data: any;
}

export function SettingsActions({ type, data }: SettingsActionsProps) {
  const { open } = useRightSidebar();

  const handleClick = () => {
    if (type === "businessHours") {
      open("Edit Business Hours", <BusinessHoursForm businessHours={data} />);
    } else if (type === "services") {
      open("Edit Service Features", <ServiceFeaturesForm features={data} />);
    } else if (type === "notifications") {
      open("Edit Notification Preferences", <NotificationPreferencesForm preferences={data} />);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
    >
      Edit
    </button>
  );
}

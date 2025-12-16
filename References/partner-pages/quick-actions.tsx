"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { EditProfileForm } from "./profile/edit-profile-form";
import { AddStaffForm } from "./team/team-forms";
import { BusinessHoursForm, ServiceFeaturesForm, NotificationPreferencesForm } from "./settings/settings-forms";
import { 
  User, 
  UserPlus, 
  Clock, 
  CheckSquare, 
  Bell, 
  ArrowUpRight,
  Settings2
} from "lucide-react";

interface QuickActionsProps {
  partner: any;
}

export function QuickActions({ partner }: QuickActionsProps) {
  const { open } = useRightSidebar();

  const actions = [
    {
      title: "Edit Profile",
      description: "Update company information and contact details",
      icon: User,
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-500/10",
      onClick: () => open("Edit Profile", <EditProfileForm partner={partner} />)
    },
    {
      title: "Add Staff Member",
      description: "Invite new team members and assign roles",
      icon: UserPlus,
      color: "text-violet-600 dark:text-violet-500",
      bgColor: "bg-violet-500/10",
      onClick: () => open("Add Staff Member", <AddStaffForm />)
    },
    {
      title: "Business Hours",
      description: "Set operating hours for each day of the week",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-500/10",
      onClick: () => open("Business Hours", <BusinessHoursForm businessHours={partner.businessHours} />)
    },
    {
      title: "Service Features",
      description: "Configure services like delivery and financing",
      icon: CheckSquare,
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-500/10",
      onClick: () => open("Service Features", <ServiceFeaturesForm features={partner.features} />)
    },
    {
      title: "Notifications",
      description: "Manage email and SMS notification preferences",
      icon: Bell,
      color: "text-rose-600 dark:text-rose-500",
      bgColor: "bg-rose-500/10",
      onClick: () => open("Notification Preferences", <NotificationPreferencesForm preferences={partner.notificationPreferences} />)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Common tasks and settings
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="group relative flex flex-col items-start p-6 bg-card hover:bg-muted/40 border border-border/40 transition-all duration-300 text-left"
          >
            <div className={`p-2.5 rounded-lg mb-4 ${action.bgColor} ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>

            <h3 className="text-sm font-medium text-foreground mb-1.5">
              {action.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </button>
        ))}

        {/* View All Link */}
        <a
          href="/partner-dashboard/settings"
          className="group relative flex flex-col items-start p-6 bg-card hover:bg-muted/40 border border-border/40 transition-all duration-300 text-left"
        >
          <div className="p-2.5 rounded-lg mb-4 bg-foreground/5 text-foreground">
            <Settings2 className="w-5 h-5" />
          </div>
          
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <h3 className="text-sm font-medium text-foreground mb-1.5">
            All Settings
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            View all available configuration options
          </p>
        </a>
      </div>
    </div>
  );
}

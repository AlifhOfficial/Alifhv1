"use client";

import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { EditProfileForm } from "./profile/edit-profile-form";
import { AddStaffForm } from "./team/team-forms";
import { BusinessHoursForm, ServiceFeaturesForm, NotificationPreferencesForm } from "./settings/settings-forms";

interface QuickActionsProps {
  partner: any;
}

export function QuickActions({ partner }: QuickActionsProps) {
  const { open } = useRightSidebar();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Try the new right sidebar interface →
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Actions */}
        <button
          onClick={() => open("Edit Profile", <EditProfileForm partner={partner} />)}
          className="bg-card border-2 border-border hover:border-primary rounded-lg p-6 text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Profile</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary">
            Edit Profile
          </h3>
          <p className="text-xs text-muted-foreground">
            Update company info, contact details, and business information
          </p>
        </button>

        {/* Team Actions */}
        <button
          onClick={() => open("Add Staff Member", <AddStaffForm />)}
          className="bg-card border-2 border-border hover:border-primary rounded-lg p-6 text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Team</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary">
            Add Staff Member
          </h3>
          <p className="text-xs text-muted-foreground">
            Invite new team members and assign roles
          </p>
        </button>

        {/* Business Hours */}
        <button
          onClick={() => open("Business Hours", <BusinessHoursForm businessHours={partner.businessHours} />)}
          className="bg-card border-2 border-border hover:border-primary rounded-lg p-6 text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Settings</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary">
            Business Hours
          </h3>
          <p className="text-xs text-muted-foreground">
            Set your operating hours for each day of the week
          </p>
        </button>

        {/* Service Features */}
        <button
          onClick={() => open("Service Features", <ServiceFeaturesForm features={partner.features} />)}
          className="bg-card border-2 border-border hover:border-primary rounded-lg p-6 text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Settings</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary">
            Service Features
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure available services like delivery, financing, trade-in
          </p>
        </button>

        {/* Notification Preferences */}
        <button
          onClick={() => open("Notification Preferences", <NotificationPreferencesForm preferences={partner.notificationPreferences} />)}
          className="bg-card border-2 border-border hover:border-primary rounded-lg p-6 text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Settings</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary">
            Notifications
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage email and SMS notification preferences
          </p>
        </button>

        {/* Link to other sections */}
        <a
          href="/partner-dashboard/team"
          className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary rounded-lg p-6 text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">View More</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary">
            View All Features
          </h3>
          <p className="text-xs text-muted-foreground">
            Explore Team, Reviews, Settings and more sections
          </p>
        </a>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-600 text-white rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">
              New Interface Available!
            </h4>
            <p className="text-xs text-muted-foreground">
              Click any action above to see the new right sidebar interface. Edit forms now appear in a fixed sidebar instead of modal overlays, making it easier to reference data while making changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateBusinessHours, updateServiceFeatures, updateNotificationPreferences } from "../actions";
import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";

interface BusinessHoursFormProps {
  businessHours: any;
}

export function BusinessHoursForm({ businessHours }: BusinessHoursFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close } = useRightSidebar();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateBusinessHours(formData);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to update business hours");
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {days.map((day) => {
          const daySchedule = businessHours?.[day];
          const isClosed = (daySchedule as any)?.closed || false;

          return (
            <div key={day} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground capitalize">{day}</label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={`${day}_closed`}
                    defaultChecked={isClosed}
                    className="rounded"
                  />
                  <span className="text-xs text-muted-foreground">Closed</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Open</label>
                  <input
                    type="time"
                    name={`${day}_open`}
                    defaultValue={daySchedule?.open || "09:00"}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Close</label>
                  <input
                    type="time"
                    name={`${day}_close`}
                    defaultValue={daySchedule?.close || "18:00"}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ServiceFeaturesFormProps {
  features: any;
}

export function ServiceFeaturesForm({ features }: ServiceFeaturesFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close } = useRightSidebar();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateServiceFeatures(formData);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to update services");
    }
    setLoading(false);
  }

  const services = [
    { key: 'homeDelivery', label: '🚚 Home Delivery' },
    { key: 'testDriveAvailable', label: '🚗 Test Drive Available' },
    { key: 'financing', label: '💰 Financing Options' },
    { key: 'tradeIn', label: '🔄 Trade-In Service' },
    { key: 'warranty', label: '✅ Warranty Available' },
    { key: 'insurance', label: '🛡️ Insurance Assistance' },
    { key: 'registration', label: '📋 Registration Service' },
    { key: 'exportAssistance', label: '🌍 Export Assistance' },
  ];

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {services.map((service) => (
          <label key={service.key} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
            <span className="text-sm font-medium text-foreground">{service.label}</span>
            <input
              type="checkbox"
              name={service.key}
              defaultChecked={features?.[service.key] || false}
              className="rounded"
            />
          </label>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface NotificationPreferencesFormProps {
  preferences: any;
}

export function NotificationPreferencesForm({ preferences }: NotificationPreferencesFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close } = useRightSidebar();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateNotificationPreferences(formData);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to update preferences");
    }
    setLoading(false);
  }

  const notificationTypes = [
    { key: 'emailNewLead', label: 'Email - New Lead' },
    { key: 'emailBooking', label: 'Email - Booking' },
    { key: 'emailMessage', label: 'Email - Message' },
    { key: 'emailSale', label: 'Email - Sale' },
    { key: 'emailReview', label: 'Email - Review' },
    { key: 'emailMarketing', label: 'Email - Marketing' },
    { key: 'smsNewLead', label: 'SMS - New Lead' },
    { key: 'smsBooking', label: 'SMS - Booking' },
  ];

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {notificationTypes.map((type) => (
          <label key={type.key} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
            <span className="text-sm font-medium text-foreground">{type.label}</span>
            <input
              type="checkbox"
              name={type.key}
              defaultChecked={preferences?.[type.key] || false}
              className="rounded"
            />
          </label>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateBusinessHours, updateServiceFeatures, updateNotificationPreferences } from "../actions";
import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { 
  Truck, 
  Car, 
  CreditCard, 
  RefreshCw, 
  ShieldCheck, 
  Shield, 
  FileText, 
  Globe,
  Mail,
  Smartphone
} from "lucide-react";

interface BusinessHoursFormProps {
  businessHours: any;
}

export function BusinessHoursForm({ businessHours }: BusinessHoursFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close } = useRightSidebar();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const [closedDays, setClosedDays] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    days.forEach(day => {
      initial[day] = businessHours?.[day]?.closed || false;
    });
    return initial;
  });

  const toggleDay = (day: string) => {
    setClosedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

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
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Operating Hours</h3>
        <p className="text-sm text-muted-foreground">Set your weekly schedule</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          {days.map((day) => {
            const daySchedule = businessHours?.[day];
            const isClosed = closedDays[day];

            return (
              <div key={day} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                <div className="w-28 font-medium capitalize text-sm text-foreground">{day}</div>
                
                <div className="flex items-center gap-4 flex-1 justify-end">
                  {!isClosed ? (
                    <div className="flex items-center gap-2 animate-in fade-in duration-200">
                      <input
                        type="time"
                        name={`${day}_open`}
                        defaultValue={daySchedule?.open || "09:00"}
                        className="bg-transparent border border-border/60 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none w-24"
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input
                        type="time"
                        name={`${day}_close`}
                        defaultValue={daySchedule?.close || "18:00"}
                        className="bg-transparent border border-border/60 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none w-24"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic px-2">Closed</span>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      name={`${day}_closed`}
                      checked={isClosed}
                      onChange={() => toggleDay(day)}
                      className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4"
                    />
                    <span className="sr-only">Closed</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-xs font-medium border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
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
    { key: 'homeDelivery', label: 'Home Delivery', icon: Truck },
    { key: 'testDriveAvailable', label: 'Test Drive Available', icon: Car },
    { key: 'financing', label: 'Financing Options', icon: CreditCard },
    { key: 'tradeIn', label: 'Trade-In Service', icon: RefreshCw },
    { key: 'warranty', label: 'Warranty Available', icon: ShieldCheck },
    { key: 'insurance', label: 'Insurance Assistance', icon: Shield },
    { key: 'registration', label: 'Registration Service', icon: FileText },
    { key: 'exportAssistance', label: 'Export Assistance', icon: Globe },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Services & Features</h3>
        <p className="text-sm text-muted-foreground">Select the services you offer</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          {services.map((service) => (
            <label 
              key={service.key} 
              className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted/50 group-hover:bg-muted transition-colors">
                  <service.icon className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{service.label}</span>
              </div>
              <input
                type="checkbox"
                name={service.key}
                defaultChecked={features?.[service.key] || false}
                className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-xs font-medium border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
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

  const notificationGroups = [
    {
      title: "Email Notifications",
      icon: Mail,
      items: [
        { key: 'emailNewLead', label: 'New Leads' },
        { key: 'emailBooking', label: 'Bookings' },
        { key: 'emailMessage', label: 'Messages' },
        { key: 'emailSale', label: 'Sales Updates' },
        { key: 'emailReview', label: 'New Reviews' },
        { key: 'emailMarketing', label: 'Marketing Updates' },
      ]
    },
    {
      title: "SMS Notifications",
      icon: Smartphone,
      items: [
        { key: 'smsNewLead', label: 'New Leads' },
        { key: 'smsBooking', label: 'Bookings' },
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Notifications</h3>
        <p className="text-sm text-muted-foreground">Manage how you receive alerts</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {notificationGroups.map((group) => (
          <div key={group.title} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
              <group.icon className="w-4 h-4" />
              {group.title}
            </div>
            <div className="space-y-2">
              {group.items.map((item) => (
                <label 
                  key={item.key} 
                  className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <input
                    type="checkbox"
                    name={item.key}
                    defaultChecked={preferences?.[item.key] || false}
                    className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-xs font-medium border border-border/60 rounded-lg hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

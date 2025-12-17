"use client";

import { useState } from "react";
import { updatePartnerProfile } from "./actions";
import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";

interface EditProfileFormProps {
  partner: any;
}

export function EditProfileForm({ partner }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close } = useRightSidebar();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePartnerProfile(formData);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to update profile");
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-8">
      {error && (
        <div className="bg-muted/20 border border-border/20 text-foreground px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Company Information</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Brand Name
            </label>
            <input
              name="brandName"
              defaultValue={partner.brandName}
              className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={partner.description || ""}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                defaultValue={partner.phoneNumber || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Alternate Phone
              </label>
              <input
                name="alternatePhone"
                defaultValue={partner.alternatePhone || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Email
            </label>
            <input
              name="email"
              type="email"
              defaultValue={partner.email || ""}
              className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                WhatsApp
              </label>
              <input
                name="whatsapp"
                defaultValue={partner.whatsapp || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Website
              </label>
              <input
                name="website"
                defaultValue={partner.website || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h3 className="text-sm font-medium text-foreground">Address</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Street
            </label>
            <input
              name="street"
              defaultValue={partner.street || ""}
              className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Area
              </label>
              <input
                name="area"
                defaultValue={partner.area || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                City
              </label>
              <input
                name="city"
                defaultValue={partner.city || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Emirate
              </label>
              <select
                name="emirate"
                defaultValue={partner.emirate || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="">Select Emirate</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Dubai">Dubai</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                P.O. Box
              </label>
              <input
                name="poBox"
                defaultValue={partner.poBox || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h3 className="text-sm font-medium text-foreground">Business Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Years in Business
              </label>
              <input
                name="yearsInBusiness"
                type="number"
                defaultValue={partner.yearsInBusiness || 0}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Founded Year
              </label>
              <input
                name="foundedYear"
                type="number"
                defaultValue={partner.foundedYear || ""}
                className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Number of Showrooms
            </label>
            <input
              name="showroomCount"
              type="number"
              defaultValue={partner.showroomCount || 0}
              className="w-full h-10 px-3 bg-background border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border/60 sticky bottom-0 bg-card -mx-6 px-6 pb-6">
          <button
            type="button"
            onClick={close}
            className="h-8 px-4 text-xs font-medium border border-border/40 text-foreground hover:bg-muted/50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-8 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
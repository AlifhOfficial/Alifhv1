"use client";

import { useState } from "react";
import { updatePartnerProfile } from "../actions";
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
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Company Information</h3>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Brand Name
          </label>
          <input
            name="brandName"
            defaultValue={partner.brandName}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={partner.description || ""}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Phone Number
            </label>
            <input
              name="phoneNumber"
              defaultValue={partner.phoneNumber || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Alternate Phone
            </label>
            <input
              name="alternatePhone"
              defaultValue={partner.alternatePhone || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={partner.email || ""}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              WhatsApp
            </label>
            <input
              name="whatsapp"
              defaultValue={partner.whatsapp || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Website
            </label>
            <input
              name="website"
              defaultValue={partner.website || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground">Address</h3>
        
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Street
          </label>
          <input
            name="street"
            defaultValue={partner.street || ""}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Area
            </label>
            <input
              name="area"
              defaultValue={partner.area || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              City
            </label>
            <input
              name="city"
              defaultValue={partner.city || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Emirate
            </label>
            <select
              name="emirate"
              defaultValue={partner.emirate || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
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

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              P.O. Box
            </label>
            <input
              name="poBox"
              defaultValue={partner.poBox || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground">Business Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Years in Business
            </label>
            <input
              name="yearsInBusiness"
              type="number"
              defaultValue={partner.yearsInBusiness || 0}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Founded Year
            </label>
            <input
              name="foundedYear"
              type="number"
              defaultValue={partner.foundedYear || ""}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Number of Showrooms
          </label>
          <input
            name="showroomCount"
            type="number"
            defaultValue={partner.showroomCount || 0}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border sticky bottom-0 bg-card -mx-6 px-6 pb-6">
        <button
          type="button"
          onClick={close}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

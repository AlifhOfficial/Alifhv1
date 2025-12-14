"use client";

import { useState } from "react";
import { createStaffMember, updateStaffMember, deleteStaffMember } from "../actions";
import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";

export function AddStaffForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { close } = useRightSidebar();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createStaffMember(formData);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to add staff member");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          required
          placeholder="user@example.com"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <p className="text-xs text-muted-foreground mt-1">User must already have an account</p>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Role *</label>
        <select
          name="role"
          required
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="member">Member</option>
          <option value="sales">Sales</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Title</label>
        <input
          type="text"
          name="title"
          placeholder="e.g., Sales Manager"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Department</label>
        <input
          type="text"
          name="department"
          placeholder="e.g., Sales, Operations"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card -mx-6 px-6 pb-6">
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
          {loading ? "Adding..." : "Add Member"}
        </button>
      </div>
    </form>
  );
}

interface EditStaffFormProps {
  staff: any;
}

export function EditStaffForm({ staff }: EditStaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { close } = useRightSidebar();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateStaffMember(staff.id, formData);

    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to update staff member");
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteStaffMember(staff.id);
    if (result.success) {
      close();
    } else {
      setError(result.error || "Failed to delete staff member");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Role *</label>
        <select
          name="role"
          defaultValue={staff.role}
          required
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="member">Member</option>
          <option value="sales">Sales</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={staff.title || ""}
          placeholder="e.g., Sales Manager"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Department</label>
        <input
          type="text"
          name="department"
          defaultValue={staff.department || ""}
          placeholder="e.g., Sales, Operations"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2">Status</label>
        <select
          name="status"
          defaultValue={staff.status}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        >
          <option value="invited">Invited</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="pt-4 border-t border-border">
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-600 hover:text-red-700"
            disabled={loading}
          >
            Remove team member
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-3">Are you sure you want to remove this member?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Removing..." : "Yes, remove"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-card -mx-6 px-6 pb-6">
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

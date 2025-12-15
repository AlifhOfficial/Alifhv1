"use client";

import { useState } from "react";
import { createStaffMember, updateStaffMember, deleteStaffMember } from "../actions";
import { useRightSidebar } from "@/components/dashboard-components/three-column-layout";
import { Mail, Briefcase, User, Building2, Shield, AlertCircle, Trash2, ChevronDown } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-medium">Invite New Member</h3>
          <p className="text-sm text-muted-foreground">Send an invitation to join your team.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">User must already have an account on the platform.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors z-10">
                <Shield className="w-4 h-4" />
              </div>
              <select
                name="role"
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 appearance-none transition-all relative z-0 cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="sales">Sales</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="title"
                  placeholder="Sales Manager"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="department"
                  placeholder="Sales"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending Invite..." : "Send Invite"}
          </button>
        </div>
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-medium">Edit Member</h3>
          <p className="text-sm text-muted-foreground">Update role and permissions.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors z-10">
                <Shield className="w-4 h-4" />
              </div>
              <select
                name="role"
                defaultValue={staff.role}
                required
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 appearance-none transition-all relative z-0 cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="sales">Sales</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="title"
                  defaultValue={staff.title || ""}
                  placeholder="Sales Manager"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="department"
                  defaultValue={staff.department || ""}
                  placeholder="Sales"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
            <div className="relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10 ${
                staff.status === 'active' ? 'bg-emerald-500' : 
                staff.status === 'invited' ? 'bg-amber-500' : 
                'bg-muted-foreground'
              }`} />
              <select
                name="status"
                defaultValue={staff.status}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/10 appearance-none transition-all relative z-0 cursor-pointer"
              >
                <option value="invited">Invited</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-lg transition-colors w-full"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
                Remove team member
              </button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">Remove this member?</p>
                    <p className="text-xs text-red-700 dark:text-red-300/80 mt-1">This action cannot be undone. They will lose access immediately.</p>
                  </div>
                </div>
                <div className="flex gap-2 pl-8">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Removing..." : "Confirm Remove"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

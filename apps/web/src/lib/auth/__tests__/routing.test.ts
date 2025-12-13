import { describe, expect, it } from "bun:test";
import {
  type ExtendedUser,
  getDefaultRedirect,
  getUserPartnerContext,
  getUserPortalAccess,
  isDealerOwner,
  isDealerStaff,
} from "@/lib/auth/routing";

const baseUser: ExtendedUser = {
  id: "user-1",
  email: "user@example.com",
  name: "Sample User",
  image: null,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  banned: false,
  role: "user",
  hasPartnerAccess: false,
  isAlifhAdmin: false,
  partnerMemberships: [],
};

describe("auth routing helpers", () => {
  it("prioritises admin redirect and access", () => {
    const admin: ExtendedUser = {
      ...baseUser,
      role: "super_admin",
      isAlifhAdmin: true,
    };

    expect(getDefaultRedirect(admin)).toBe("/admin-dashboard");
    expect(getUserPortalAccess(admin)).toEqual({
      admin: true,
      partnerOwner: false,
      partnerStaff: false,
      user: true,
    });
    expect(isDealerOwner(admin)).toBe(false);
    expect(isDealerStaff(admin)).toBe(false);
  });

  it("detects dealer owners and routes appropriately", () => {
    const ownerMembership = {
      staffId: "staff-1",
      partnerId: "partner-1",
      partnerName: "Partner One",
      partnerTier: "gold",
      staffRole: "owner" as const,
      permissions: {
        manageListings: true,
        manageTeam: true,
        viewAnalytics: true,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: true,
        manageSettings: true,
        exportData: true,
      },
    };

    const owner: ExtendedUser = {
      ...baseUser,
      id: "owner-1",
      hasPartnerAccess: true,
      partnerMemberships: [ownerMembership],
    };

    expect(isDealerOwner(owner)).toBe(true);
    expect(isDealerStaff(owner)).toBe(false);
    expect(getDefaultRedirect(owner)).toBe("/partner-dashboard");
    expect(getUserPortalAccess(owner)).toEqual({
      admin: false,
      partnerOwner: true,
      partnerStaff: false,
      user: true,
    });

    const partnerContext = getUserPartnerContext(owner);
    expect(partnerContext).toMatchObject({
      totalActivePartners: 1,
      defaultPartnerId: "partner-1",
      ownerPartnerIds: ["partner-1"],
      staffPartnerIds: [],
    });
  });

  it("recognises dealer staff without owner access", () => {
    const staffMembership = {
      staffId: "staff-2",
      partnerId: "partner-2",
      partnerName: "Partner Two",
      partnerTier: "standard",
      staffRole: "sales" as const,
      permissions: {
        manageListings: true,
        manageTeam: false,
        viewAnalytics: false,
        manageBookings: true,
        respondToLeads: true,
        manageFinancials: false,
        manageSettings: false,
        exportData: false,
      },
    };

    const staff: ExtendedUser = {
      ...baseUser,
      id: "staff-1",
      hasPartnerAccess: true,
      partnerMemberships: [staffMembership],
    };

    expect(isDealerOwner(staff)).toBe(false);
    expect(isDealerStaff(staff)).toBe(true);
    expect(getDefaultRedirect(staff)).toBe("/staff-dashboard");
    expect(getUserPortalAccess(staff)).toEqual({
      admin: false,
      partnerOwner: false,
      partnerStaff: true,
      user: true,
    });

    const context = getUserPartnerContext(staff);
    expect(context).toMatchObject({
      totalActivePartners: 1,
      defaultPartnerId: "partner-2",
      ownerPartnerIds: [],
      staffPartnerIds: ["partner-2"],
    });
  });

  it("falls back to user dashboard for general users", () => {
    const customer: ExtendedUser = {
      ...baseUser,
      id: "customer-1",
    };

    expect(getDefaultRedirect(customer)).toBe("/user-dashboard");
    expect(getUserPortalAccess(customer)).toEqual({
      admin: false,
      partnerOwner: false,
      partnerStaff: false,
      user: true,
    });
  });
});

// Platform-level role (User table)
export type UserRole = 'user' | 'admin' | 'super_admin';

// Organization-level role (PartnerStaff table)
export type StaffRole = 'owner' | 'admin' | 'sales' | 'viewer';

// Partner membership info
export interface PartnerMembership {
  staffId: string;
  partnerId: string;
  partnerName: string;
  partnerTier: string;
  staffRole: StaffRole;
  permissions: {
    manageListings: boolean;
    manageTeam: boolean;
    viewAnalytics: boolean;
    manageBookings: boolean;
    respondToLeads: boolean;
    manageFinancials: boolean;
    manageSettings: boolean;
    exportData: boolean;
  };
}

// Extended user type with partner context
export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  
  // Partner access data (populated from session)
  partnerMemberships?: PartnerMembership[];
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
};

export type AuthResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
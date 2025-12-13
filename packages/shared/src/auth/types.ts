export type UserRole = 'admin' | 'partner' | 'staff';

export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
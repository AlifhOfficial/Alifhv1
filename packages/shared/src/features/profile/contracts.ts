import { z } from 'zod';

// Status flags track the lifecycle of a user profile independent of partner roles.
export const userProfileStatusValues = ['active', 'inactive', 'suspended'] as const;
export const userProfileStatusSchema = z.enum(userProfileStatusValues);
export type UserProfileStatus = z.infer<typeof userProfileStatusSchema>;

export const userProfileNotificationPreferencesSchema = z
  .object({
    emailKYC: z.boolean(),
    emailEscrow: z.boolean(),
    emailBooking: z.boolean(),
    emailMessages: z.boolean(),
    emailFinancial: z.boolean(),
    emailMarketing: z.boolean(),
    emailReservation: z.boolean(),
  })
  .strict();
export type UserProfileNotificationPreferences = z.infer<
  typeof userProfileNotificationPreferencesSchema
>;

export const userProfileNotificationPreferencesUpdateSchema =
  userProfileNotificationPreferencesSchema.partial();
export type UserProfileNotificationPreferencesUpdate = z.infer<
  typeof userProfileNotificationPreferencesUpdateSchema
>;

export const userProfilePrivacySettingsSchema = z
  .object({
    showEmail: z.boolean(),
    showPhone: z.boolean(),
  })
  .strict();
export type UserProfilePrivacySettings = z.infer<
  typeof userProfilePrivacySettingsSchema
>;

export const userProfilePrivacySettingsUpdateSchema =
  userProfilePrivacySettingsSchema.partial();
export type UserProfilePrivacySettingsUpdate = z.infer<
  typeof userProfilePrivacySettingsUpdateSchema
>;

export const userProfilePreferencesSchema = z
  .object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string().min(2).max(10),
    distanceUnit: z.enum(['km', 'miles']),
  })
  .strict();
export type UserProfilePreferences = z.infer<typeof userProfilePreferencesSchema>;

export const userProfilePreferencesUpdateSchema =
  userProfilePreferencesSchema.partial();
export type UserProfilePreferencesUpdate = z.infer<
  typeof userProfilePreferencesUpdateSchema
>;

export const userProfileSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    phone: z
      .string()
      .min(5)
      .max(32)
      .regex(/^[+0-9()\s-]+$/)
      .optional(),
    firstName: z.string().min(1).max(120).optional(),
    lastName: z.string().min(1).max(120).optional(),
    avatar: z.string().max(512).optional(),
    description: z.string().max(2000).optional(),
    status: userProfileStatusSchema,
    kycVerified: z.boolean(),
    kycVerifiedAt: z.date().nullable().optional(),
    badges: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    locationLat: z.number().min(-90).max(90).nullable().optional(),
    locationLng: z.number().min(-180).max(180).nullable().optional(),
    locationCity: z.string().max(120).optional(),
    locationEmirate: z.string().max(120).optional(),
    inventoryCount: z.number().int().min(0),
    carsSold: z.number().int().min(0),
    avgResponseTime: z.number().int().min(0).nullable().optional(),
    lastActiveAt: z.date().nullable().optional(),
    notificationPreferences: userProfileNotificationPreferencesSchema,
    privacySettings: userProfilePrivacySettingsSchema,
    preferences: userProfilePreferencesSchema,
    consignmentMode: z.boolean(),
    memberSince: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();
export type UserProfile = z.infer<typeof userProfileSchema>;

export const userProfileUpdateSchema = z
  .object({
    firstName: z.string().min(1).max(120).optional(),
    lastName: z.string().min(1).max(120).optional(),
    phone: z
      .string()
      .min(5)
      .max(32)
      .regex(/^[+0-9()\s-]+$/)
      .optional(),
    avatar: z.string().max(512).nullable().optional(),
    description: z.string().max(2000).optional(),
    status: userProfileStatusSchema.optional(),
    kycVerified: z.boolean().optional(),
    kycVerifiedAt: z.date().nullable().optional(),
    badges: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    locationCity: z.string().max(120).optional(),
    locationEmirate: z.string().max(120).optional(),
    locationLat: z.number().min(-90).max(90).nullable().optional(),
    locationLng: z.number().min(-180).max(180).nullable().optional(),
    inventoryCount: z.number().int().min(0).optional(),
    carsSold: z.number().int().min(0).optional(),
    avgResponseTime: z.number().int().min(0).nullable().optional(),
    lastActiveAt: z.date().nullable().optional(),
    notificationPreferences: userProfileNotificationPreferencesUpdateSchema.optional(),
    privacySettings: userProfilePrivacySettingsUpdateSchema.optional(),
    preferences: userProfilePreferencesUpdateSchema.optional(),
    consignmentMode: z.boolean().optional(),
    memberSince: z.date().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .strict();
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

export const userProfileCreateSchema = userProfileUpdateSchema
  .extend({
    userId: z.string().min(1),
    id: z.string().optional(),
    status: userProfileStatusSchema.optional(),
    kycVerified: z.boolean().optional(),
    kycVerifiedAt: z.date().nullable().optional(),
    badges: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    inventoryCount: z.number().int().min(0).optional(),
    carsSold: z.number().int().min(0).optional(),
    avgResponseTime: z.number().int().min(0).nullable().optional(),
    lastActiveAt: z.date().nullable().optional(),
    consignmentMode: z.boolean().optional(),
    notificationPreferences: userProfileNotificationPreferencesSchema.optional(),
    privacySettings: userProfilePrivacySettingsSchema.optional(),
    preferences: userProfilePreferencesSchema.optional(),
  })
  .strict();
export type UserProfileCreateInput = z.infer<typeof userProfileCreateSchema>;

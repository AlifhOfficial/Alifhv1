/**
 * Server-side profile domain helpers.
 *
 * These functions sit between raw database queries and API routes / server
 * components. They validate payloads with the shared zod contracts and attach
 * derived values like signed avatar URLs when needed.
 */

import type { SignedUrlOptions } from "@/lib/storage";
import { getSignedUrl } from "@/lib/storage";
import {
  userProfileCreateSchema,
  userProfileSchema,
  userProfileUpdateSchema,
} from "@alifh/shared";
import type {
  Profile,
  ProfileCreateInput,
  ProfileUpdateInput,
  ProfileWithAvatarUrl,
} from "./types";
import {
  createUserProfile as dbCreateUserProfile,
  deleteUserProfileByUserId as dbDeleteUserProfileByUserId,
  ensureUserProfile as dbEnsureUserProfile,
  getUserProfileByUserId as dbGetUserProfileByUserId,
  upsertUserProfileByUserId as dbUpsertUserProfileByUserId,
  updateUserProfileByUserId as dbUpdateUserProfileByUserId,
} from "@alifh/database";

type DbUserProfileRecord = Awaited<ReturnType<typeof dbEnsureUserProfile>>;
type DbUserProfileInsert = NonNullable<Parameters<typeof dbEnsureUserProfile>[1]>;
type DbUserProfileUpsertPayload = Parameters<typeof dbUpsertUserProfileByUserId>[1];
type DbUserProfileUpdatePayload = Parameters<typeof dbUpdateUserProfileByUserId>[1];
type DbUserProfileCreatePayload = Parameters<typeof dbCreateUserProfile>[0];

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const NULLISH_TO_UNDEFINED_FIELDS: Array<
  | "phone"
  | "firstName"
  | "lastName"
  | "avatar"
  | "description"
  | "locationCity"
  | "locationEmirate"
> = [
  "phone",
  "firstName",
  "lastName",
  "avatar",
  "description",
  "locationCity",
  "locationEmirate",
];

const NULLISH_TO_EMPTY_ARRAY_FIELDS: Array<"badges" | "tags"> = [
  "badges",
  "tags",
];

function sanitizeStringArray(input: string[] | null | undefined) {
  if (!input) return [];
  return Array.from(
    new Set(
      input
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

export interface BuildProfileOptions {
  includeSignedAvatarUrl?: boolean;
  signedAvatarUrlOptions?: SignedUrlOptions;
}

const DEFAULT_BUILD_OPTIONS: BuildProfileOptions = {
  includeSignedAvatarUrl: true,
};

const DEFAULT_SIGNED_AVATAR_OPTIONS: SignedUrlOptions = {
  expiresIn: 60 * 10, // 10 minutes gives clients time to download/cache
};

function looksLikeAbsoluteUrl(value: string | null | undefined) {
  if (!value) return false;
  return ABSOLUTE_URL_PATTERN.test(value);
}

function normalizeProfileRecord(record: DbUserProfileRecord): DbUserProfileRecord {
  const normalized: Record<string, unknown> = { ...record };

  for (const field of NULLISH_TO_UNDEFINED_FIELDS) {
    if (normalized[field] === null) {
      delete normalized[field];
    }
  }

  for (const field of NULLISH_TO_EMPTY_ARRAY_FIELDS) {
    if (!Array.isArray(normalized[field])) {
      normalized[field] = [];
    }
  }

  if (normalized.avatar === "") {
    delete normalized.avatar;
  }

  return normalized as DbUserProfileRecord;
}

async function attachAvatarUrl(
  profile: Profile,
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl> {
  if (!profile.avatar) {
    return { ...profile, avatarUrl: null };
  }

  if (looksLikeAbsoluteUrl(profile.avatar)) {
    return { ...profile, avatarUrl: profile.avatar };
  }

  const includeSignedAvatarUrl = options?.includeSignedAvatarUrl ?? true;
  if (!includeSignedAvatarUrl) {
    return { ...profile, avatarUrl: null };
  }

  const signedOptions = options?.signedAvatarUrlOptions ?? DEFAULT_SIGNED_AVATAR_OPTIONS;

  try {
    const signedUrl = await getSignedUrl(
      profile.avatar,
      signedOptions
    );

    return { ...profile, avatarUrl: signedUrl };
  } catch (error) {
    console.warn("Failed to generate signed avatar URL", error);
    return { ...profile, avatarUrl: null };
  }
}

async function buildProfile(
  record: DbUserProfileRecord,
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl> {
  const resolvedOptions: BuildProfileOptions = {
    ...DEFAULT_BUILD_OPTIONS,
    ...options,
  };

  const profile = userProfileSchema.parse(normalizeProfileRecord(record));
  return attachAvatarUrl(profile, resolvedOptions);
}

export async function getProfileForUserId(
  userId: string,
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl | null> {
  const record = await dbGetUserProfileByUserId(userId);
  if (!record) return null;
  return buildProfile(record, options);
}

export async function ensureProfileForUser(
  userId: string,
  defaults?: ProfileCreateInput,
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl> {
  const parsedDefaults = defaults
    ? userProfileCreateSchema.parse({ userId, ...defaults })
    : undefined;

  const record = await dbEnsureUserProfile(
    userId,
    parsedDefaults as DbUserProfileInsert | undefined
  );
  return buildProfile(record, options);
}

export async function createProfileForUser(
  input: ProfileCreateInput,
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl> {
  const parsed = userProfileCreateSchema.parse(input);
  const record = await dbCreateUserProfile(parsed as DbUserProfileCreatePayload);
  return buildProfile(record, options);
}

export async function updateProfileForUser(
  userId: string,
  updates: ProfileUpdateInput,
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl | null> {
  const parsed = userProfileUpdateSchema.parse(updates);
  const record = await dbUpdateUserProfileByUserId(
    userId,
    parsed as unknown as DbUserProfileUpdatePayload
  );
  if (!record) return null;
  return buildProfile(record, options);
}

export async function upsertProfileForUser(
  userId: string,
  payload: ProfileUpdateInput & { createDefaults?: ProfileCreateInput },
  options?: BuildProfileOptions
): Promise<ProfileWithAvatarUrl> {
  const { createDefaults, ...updates } = payload;
  const parsedUpdates = userProfileUpdateSchema.parse(updates);
  const parsedDefaults = createDefaults
    ? userProfileCreateSchema.parse({ userId, ...createDefaults })
    : undefined;

  const dbPayload = {
    ...parsedUpdates,
    ...(parsedDefaults
      ? { createDefaults: parsedDefaults as unknown as DbUserProfileInsert }
      : {}),
  } as unknown as DbUserProfileUpsertPayload;

  const record = await dbUpsertUserProfileByUserId(userId, dbPayload);

  return buildProfile(record, options);
}

export async function deleteProfileForUser(userId: string): Promise<void> {
  await dbDeleteUserProfileByUserId(userId);
}

export async function updateProfileTags(
  userId: string,
  tags: string[]
): Promise<ProfileWithAvatarUrl | null> {
  const sanitized = sanitizeStringArray(tags);
  return updateProfileForUser(userId, { tags: sanitized });
}

export interface UpdateProfileLocationInput {
  city?: string | null;
  emirate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export async function updateProfileLocation(
  userId: string,
  location: UpdateProfileLocationInput
): Promise<ProfileWithAvatarUrl | null> {
  const {
    city,
    emirate,
    latitude,
    longitude,
  } = location;

  return updateProfileForUser(userId, {
    locationCity: city ?? undefined,
    locationEmirate: emirate ?? undefined,
    locationLat: latitude ?? null,
    locationLng: longitude ?? null,
  });
}

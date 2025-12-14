/**
 * Profile domain types for the web app. These compose the shared contracts with
 * service-level helpers so hooks and routes keep a single import surface.
 */

import type {
  UserProfile,
  UserProfileCreateInput,
  UserProfileUpdateInput,
} from "@alifh/shared";

export type Profile = UserProfile;
export type ProfileCreateInput = UserProfileCreateInput;
export type ProfileUpdateInput = UserProfileUpdateInput;

export interface ProfileWithAvatarUrl extends Profile {
  avatarUrl?: string | null;
}

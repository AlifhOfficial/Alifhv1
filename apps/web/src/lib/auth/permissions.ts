/**
 * Better Auth Access Control Configuration
 * 
 * This file defines custom roles and permissions for the application
 * using Better Auth's admin plugin access control system.
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * Define custom resources and their actions
 * This extends the default Better Auth admin statements
 */
const statement = {
  ...defaultStatements, // Includes default user and session permissions
  // Add custom resources here if needed in the future
  // e.g., project: ["create", "read", "update", "delete"]
} as const;

/**
 * Create the access control instance
 */
export const ac = createAccessControl(statement);

/**
 * Admin Role
 * Full control over all resources including user management
 */
export const admin = ac.newRole({
  ...adminAc.statements, // Full admin permissions for user and session management
  // Add custom resource permissions here
});

/**
 * Partner Role
 * Can manage their own resources but limited user management
 */
export const partner = ac.newRole({
  user: ["list"], // Can view user lists
  session: ["list"], // Can view session lists
  // Add custom partner permissions here
});

/**
 * Staff Role
 * Limited administrative capabilities
 */
export const staff = ac.newRole({
  user: ["list"], // Can view user lists
  session: ["list"], // Can view session lists
  // Add custom staff permissions here
});

/**
 * User Role (Default)
 * Standard user with no administrative privileges
 */
export const user = ac.newRole({
  // Users have no admin permissions by default
  // Add custom user permissions here if needed
});

/**
 * Type-safe role definitions
 */
export const roles = {
  admin,
  partner,
  staff,
  user,
} as const;

export type RoleName = keyof typeof roles;

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
 * Admin Role (includes super_admin)
 * Full control over all resources including user management
 */
export const admin = ac.newRole({
  ...adminAc.statements, // Full admin permissions for user and session management
  // Add custom resource permissions here
});

/**
 * User Role (Default)
 * Standard user with no administrative privileges
 * Note: Partner access is controlled by partner_staff table membership, not role
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
  user,
} as const;

export type RoleName = keyof typeof roles;

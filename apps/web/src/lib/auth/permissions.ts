/**
 * Access Control & Role Definitions - Production
 * 
 * Better Auth access control configuration using the admin plugin.
 * Defines role-based permissions shared across client and server.
 * 
 * Current roles:
 * - admin: Full administrative access (inherits from Better Auth adminAc)
 * - user: Standard user permissions (extensible for future needs)
 * 
 * @module lib/auth/permissions
 * @see {@link https://better-auth.com/docs/plugins/admin} Better Auth Admin Plugin
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement) as any;

export const admin = ac.newRole({
  ...adminAc.statements,
}) as any;

export const user = ac.newRole({}) as any;

export const roles = {
  admin,
  user,
} as const;

export type RoleName = keyof typeof roles;
/**
 * Better Auth Access Control configuration shared across surfaces.
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

export const user = ac.newRole({
  // extend with user-level permissions when needed
}) as any;

export const roles = {
  admin,
  user,
} as const;

export type RoleName = keyof typeof roles;
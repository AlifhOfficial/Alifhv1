declare module "better-auth/plugins/access" {
  export interface AccessControl<TStatements extends Record<string, readonly string[]>> {
    statements: TStatements;
    newRole: <TRoleStatements extends Record<string, readonly string[]>>(
      statements: TRoleStatements
    ) => Role<TRoleStatements>;
  }

  export interface Role<TRoleStatements extends Record<string, readonly string[]>> {
    statements: TRoleStatements;
    authorize(resource: string, action: string): boolean;
  }

  export function createAccessControl<TStatements extends Record<string, readonly string[]>>(
    statements: TStatements
  ): AccessControl<TStatements>;
}

declare module "better-auth/plugins/admin/access" {
  export const defaultStatements: Record<string, readonly string[]>;
  export const adminAc: {
    statements: Record<string, readonly string[]>;
  };
}declare module "better-auth/plugins/access" {
  export function createAccessControl<TStatements extends Record<string, unknown>>(
    statements: TStatements
  ): {
    newRole: <TRoleStatements extends Record<string, unknown>>(statements: TRoleStatements) => TRoleStatements;
  };
}

declare module "better-auth/plugins/admin/access" {
  export const defaultStatements: Record<string, readonly string[]>;
  export const adminAc: {
    statements: Record<string, readonly string[]>;
  };
}

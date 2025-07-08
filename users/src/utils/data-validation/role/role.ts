import { z } from "zod";
import { PermissionEnum } from "..";

// Defines the schema for a single RolePermission object
const rolePermissionSchema = z.object({
  name: PermissionEnum,
  description: z
    .string()
    .min(3, "Permission description must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
});

// Defines the schema for validating role names
export const roleNameSchema = z
  .string()
  .min(3, "Role name must be at least 3 characters long")
  .max(50, "Role name must not exceed 50 characters")
  .trim();

/**
 * Defines the schema for creating a user role.
 *
 * Workflow:
 * 1. Validates role name (3-50 chars) and optional description (min 3 chars).
 * 2. Allows an optional array of default permissions.
 * 3. Validates optional system protection flags (delete, update, permanent).
 * 4. Ensures permanent protection flags require corresponding non-permanent flags.
 * 5. Allows an optional password field.
 *
 * @property name - Role name (3-50 chars).
 * @property description - Optional role description (min 3 chars).
 * @property defaultPermissions - Optional array of default permissions.
 * @property systemDeleteProtection - Optional flag for delete protection.
 * @property systemUpdateProtection - Optional flag for update protection.
 * @property systemPermanentDeleteProtection - Optional flag for permanent delete protection.
 * @property systemPermanentUpdateProtection - Optional flag for permanent update protection.
 * @property password - Optional password for the role.
 */
export const userRoleSchema = z
  .object({
    name: roleNameSchema,
    description: z
      .string()
      .min(3, "Role description must be at least 3 characters long")
      .trim()
      .optional(),
    defaultPermissions: z.array(rolePermissionSchema).optional(),
    systemDeleteProtection: z.boolean().nullable().optional(),
    systemUpdateProtection: z.boolean().nullable().optional(),
    systemPermanentDeleteProtection: z.boolean().nullable().optional(),
    systemPermanentUpdateProtection: z.boolean().nullable().optional(),
    password: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.systemPermanentDeleteProtection) {
        return data.systemDeleteProtection === true;
      }
      return true;
    },
    {
      message:
        "If systemPermanentDeleteProtection is true, systemDeleteProtection must also be true.",
      path: ["systemDeleteProtection"],
    }
  )
  .refine(
    (data) => {
      if (data.systemPermanentUpdateProtection) {
        return data.systemUpdateProtection === true;
      }
      return true;
    },
    {
      message:
        "If systemPermanentUpdateProtection is true, systemUpdateProtection must also be true.",
      path: ["systemUpdateProtection"],
    }
  );

/**
 * Defines the schema for updating a user role.
 *
 * Workflow:
 * 1. Validates role ID as a UUID and optional role name (3-50 chars).
 * 2. Allows an optional description (min 3 chars) and default permissions array.
 * 3. Validates optional system protection flags (delete, update, permanent).
 * 4. Ensures permanent protection flags require corresponding non-permanent flags.
 * 5. Allows an optional password field.
 *
 * @property id - UUID for the role.
 * @property name - Optional role name (3-50 chars).
 * @property description - Optional role description (min 3 chars).
 * @property defaultPermissions - Optional array of default permissions.
 * @property systemDeleteProtection - Optional flag for delete protection.
 * @property systemUpdateProtection - Optional flag for update protection.
 * @property systemPermanentDeleteProtection - Optional flag for permanent delete protection.
 * @property systemPermanentUpdateProtection - Optional flag for permanent update protection.
 * @property password - Optional password for the role.
 */
export const userRoleInfoUpdateSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    name: roleNameSchema.optional(),
    description: z
      .string()
      .min(3, "Role description must be at least 3 characters long")
      .trim()
      .optional(),
    defaultPermissions: z.array(rolePermissionSchema).nullable().optional(),
    systemDeleteProtection: z.boolean().nullable().optional(),
    systemUpdateProtection: z.boolean().nullable().optional(),
    systemPermanentDeleteProtection: z.boolean().nullable().optional(),
    systemPermanentUpdateProtection: z.boolean().nullable().optional(),
    password: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.systemPermanentDeleteProtection) {
        return data.systemDeleteProtection === true;
      }
      return true;
    },
    {
      message:
        "If systemPermanentDeleteProtection is true, systemDeleteProtection must also be true.",
      path: ["systemDeleteProtection"],
    }
  )
  .refine(
    (data) => {
      if (data.systemPermanentUpdateProtection) {
        return data.systemUpdateProtection === true;
      }
      return true;
    },
    {
      message:
        "If systemPermanentUpdateProtection is true, systemUpdateProtection must also be true.",
      path: ["systemUpdateProtection"],
    }
  )
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== "id" && data[key as keyof typeof data] !== undefined
      ),
    {
      message: "At least one field must be provided for update besides id",
      path: [],
    }
  );

/**
 * Defines the schema for updating a user's role assignments.
 *
 * Workflow:
 * 1. Validates userId as a UUID.
 * 2. Allows optional arrays for roleAddIds and roleRemoveIds (UUIDs).
 * 3. Ensures at least one of roleAddIds or roleRemoveIds contains a UUID.
 * 4. Allows an optional password field.
 *
 * @property roleAddIds - Array of UUIDs for roles to assign.
 * @property roleRemoveIds - Array of UUIDs for roles to remove.
 * @property userId - UUID of the user to update.
 * @property password - Optional password for the update.
 */
export const userRoleUpdateSchema = z
  .object({
    roleAddIds: z
      .array(z.string().uuid({ message: "roleAddId: Invalid UUID format" }))
      .default([])
      .optional(),
    roleRemoveIds: z
      .array(z.string().uuid({ message: "roleRemoveId: Invalid UUID format" }))
      .optional()
      .default([]),
    userId: z.string().uuid({ message: "Invalid UUID format for userId" }),
    password: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.roleAddIds?.length > 0 || data.roleRemoveIds?.length > 0,
    {
      message:
        "Either roleAddIds or roleRemoveIds must contain at least one UUID",
      path: ["roleAddIds", "roleRemoveIds"],
    }
  );

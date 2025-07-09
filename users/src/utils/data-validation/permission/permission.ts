import { z } from "zod";
import { hasDuplicatePermissionNames, PermissionEnum } from "../common/common";

// Defines the schema for a single permission object
const singlePermissionSchema = z.object({
  name: PermissionEnum,
  canCreate: z
    .boolean({
      message: "canCreate must be a boolean",
    })
    .optional(),
  canRead: z
    .boolean({
      message: "canRead must be a boolean",
    })
    .optional(),
  canUpdate: z
    .boolean({
      message: "canUpdate must be a boolean",
    })
    .optional(),
  canDelete: z
    .boolean({
      message: "canDelete must be a boolean",
    })
    .optional(),
  description: z
    .string({ message: "Description must be a string" })
    .trim()
    .optional(),
});

/**
 * Defines the schema for updating a user's permissions.
 *
 * Workflow:
 * 1. Validates userId as a UUID.
 * 2. Allows optional accessAll or deniedAll flags (mutually exclusive).
 * 3. Validates an optional array of permissions if neither flag is true.
 * 4. Ensures either both flags are null or exactly one is true.
 * 5. Allows an optional password field.
 *
 * @property userId - UUID of the user to update.
 * @property accessAll - If true, grants all permissions (permissions array omitted).
 * @property deniedAll - If true, denies all permissions (permissions array omitted).
 * @property permissions - Array of permission objects (required if no flags).
 * @property password - Optional password for the update.
 */
/**
 * Defines the schema for updating a user's permissions.
 *
 * Workflow:
 * 1. Validates userId as a UUID.
 * 2. Allows optional accessAll or deniedAll flags (mutually exclusive).
 * 3. Validates an optional array of permissions if neither flag is true.
 * 4. Ensures either both flags are null or exactly one is true.
 * 5. Allows an optional password field.
 * 6. Ensures no duplicate permission names in permissions array.
 *
 * @property userId - UUID of the user to update.
 * @property accessAll - If true, grants all permissions (permissions array omitted).
 * @property deniedAll - If true, denies all permissions (permissions array omitted).
 * @property permissions - Array of permission objects (required if no flags).
 * @property password - Optional password for the update.
 */
export const updateUserPermissionSchema = z
  .object({
    userId: z.string().uuid({ message: "Invalid UUID format" }),
    accessAll: z
      .boolean({ message: "accessAll must be a boolean" })
      .nullable()
      .optional(),
    deniedAll: z
      .boolean({ message: "deniedAll must be a boolean" })
      .nullable()
      .optional(),
    permissions: z
      .array(singlePermissionSchema)
      .nullable()
      .optional()
      .default([]),
    password: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      (data.accessAll === null && data.deniedAll === null) ||
      ((data.accessAll === true || data.deniedAll === true) &&
        !(data.accessAll === true && data.deniedAll === true)),
    {
      message:
        "Either both accessAll and deniedAll must be null, or exactly one must be true.",
      path: ["accessAll"],
    }
  )
  .refine((data) => !hasDuplicatePermissionNames(data.permissions), {
    message: "Duplicate permission names are not allowed in permissions array.",
    path: ["permissions"],
  });

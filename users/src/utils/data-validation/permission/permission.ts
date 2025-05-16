import { z } from "zod";

// Define the Permission enum as per your GraphQL schema
export const PermissionEnum = z.enum(
  [
    "User",
    "Brand",
    "Category",
    "Permission",
    "Product",
    "Product Review",
    "Shipping Class",
    "Sub Category",
    "Tax Class",
    "Tax Status",
    "FAQ",
    "News Letter",
    "Pop Up Banner",
    "Privacy & Policy",
    "Terms & Conditions",
    "Order",
    "Role",
    "Notification",
    "Media",
  ],
  {
    errorMap: () => ({ message: "Invalid permission name" }),
  }
);

// Single permission object schema
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
  description: z.string({ message: "Description must be a string" }).optional(),
});

// Define the Zod schema for the update user's permission input
export const updateUserPermissionSchema = z
  .object({
    userId: z.string().uuid({ message: "Invalid UUID format" }),
    accessAll: z
      .boolean({ message: "accessAll must be a boolean" })
      .default(false)
      .optional(),
    deniedAll: z
      .boolean({ message: "deniedAll must be a boolean" })
      .default(false)
      .optional(),
    permissions: z
      .array(singlePermissionSchema)
      .optional()
      .refine((val) => val === undefined || val.length > 0, {
        message:
          "Permissions must be a non-empty array of valid permission objects",
      }),
  })
  .refine(
    (data) => !(data.accessAll && data.deniedAll), // both cannot be true
    {
      message: "Only one of accessAll or deniedAll can be true",
      path: ["accessAll"],
    }
  )
  .refine(
    (data) => {
      // If either accessAll or deniedAll is true, permissions must be omitted
      if (data.accessAll || data.deniedAll) {
        return !data.permissions || data.permissions.length === 0;
      }
      // Otherwise, permissions must be provided
      return Array.isArray(data.permissions) && data.permissions.length > 0;
    },
    {
      message:
        "If accessAll or deniedAll is true, permissions must be omitted. Otherwise, provide at least one permission.",
      path: ["permissions"],
    }
  );

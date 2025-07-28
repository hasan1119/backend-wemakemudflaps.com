import { z } from "zod";

// Defines an array of permission names used in permission schemas
export const PERMISSIONS = [
  "User",
  "Brand",
  "Category",
  "Product",
  "Permission",
  "Product Review",
  "Shipping Settings",
  "Sub Category",
  "Tag",
  "Tax Settings",
  "Site Settings",
  "Faq",
  "News Letter",
  "Pop Up Banner",
  "Privacy Policy",
  "Terms & Conditions",
  "Order",
  "Role",
  "Notification",
  "Media",
  "Coupon",
  "Address Book",
  "Tax Exemption",
];

// Defines a TypeScript type for permission names as a union of literals
export type PermissionName =
  | "User"
  | "Brand"
  | "Category"
  | "Product"
  | "Permission"
  | "Product Review"
  | "Shipping Settings"
  | "Sub Category"
  | "Tag"
  | "Tax Settings"
  | "Site Settings"
  | "Faq"
  | "News Letter"
  | "Pop Up Banner"
  | "Privacy Policy"
  | "Terms & Conditions"
  | "Order"
  | "Role"
  | "Notification"
  | "Media"
  | "Coupon"
  | "Address Book"
  | "Tax Exemption";

// Defines a mapping for permission values used in permission schemas
export const PERMISSION_NORMALIZATION_MAP: Record<string, string> = {
  USER: "User",
  BRAND: "Brand",
  CATEGORY: "Category",
  PRODUCT: "Product",
  PERMISSION: "Permission",
  PRODUCT_REVIEW: "Product Review",
  SHIPPING_SETTINGS: "Shipping Settings",
  SUB_CATEGORY: "Sub Category",
  TAG: "Tag",
  TAX_SETTINGS: "Tax Settings",
  SITE_SETTINGS: "Site Settings",
  FAQ: "Faq",
  NEWS_LETTER: "News Letter",
  POP_UP_BANNER: "Pop Up Banner",
  PRIVACY_POLICY: "Privacy Policy",
  TERMS_CONDITIONS: "Terms & Conditions",
  ORDER: "Order",
  ROLE: "Role",
  NOTIFICATION: "Notification",
  MEDIA: "Media",
  COUPON: "Coupon",
  ADDRESS_BOOK: "Address Book",
  TAX_EXEMPTION: "Tax Exemption",
};

// Utility function to check for duplicate permission names
export const hasDuplicatePermissionNames = (
  permissions?: { name?: string | null }[] | null
): boolean => {
  if (!permissions || permissions.length === 0) return false;

  // Extract only non-empty string names
  const names = permissions
    .map((p) => p.name)
    .filter(
      (name): name is string => typeof name === "string" && name.trim() !== ""
    );

  return new Set(names).size !== names.length;
};

/**
 * Defines an enum for permission names used in permission schemas.
 *
 * Workflow:
 * 1. Preprocesses input to match case-insensitive permission names from PERMISSIONS.
 * 2. Returns the matched permission or undefined if no match is found.
 * 3. Validates against the PERMISSIONS array as a Zod enum.
 *
 * @type z.ZodEnum<[string, ...string[]]>
 */
export const PermissionEnum = z.preprocess((val) => {
  if (typeof val === "string") {
    const key = val.trim().toUpperCase();
    return PERMISSION_NORMALIZATION_MAP[key];
  }
}, z.enum(PERMISSIONS as [string, ...string[]]));

/**
 * Enum definition for sort order types used in sorting queries.
 * Accepts 'asc' for ascending and 'desc' for descending.
 * Can be optional and nullable.
 */
export const SortOrderTypeEnum = z
  .enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" })
  .nullable()
  .optional();

/**
 * Defines the schema for validating a single UUID.
 *
 * Workflow:
 * 1. Validates that the id field is a valid UUID string.
 *
 * @property id - The UUID string to validate.
 */
export const idSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating a session string.
 *
 * Workflow:
 * 1. Validates that the sessionId field is a valid string.
 *
 * @property id - The UUID string to validate.
 */
export const sessionStringSchema = z.object({
  sessionId: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating an array of UUIDs.
 *
 * Workflow:
 * 1. Validates that the ids field is a non-empty array of valid UUID strings.
 *
 * @property ids - An array of UUID strings (at least one required).
 */
export const idsSchema = z.object({
  ids: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" }),
});

/**
 * Defines the schema for validating the skipTrash flag.
 *
 * Workflow:
 * 1. Validates that skipTrash is a boolean value.
 *
 * @property skipTrash - Boolean flag to indicate skipping trash.
 */
export const skipTrashSchema = z.object({
  skipTrash: z.boolean().refine((val) => typeof val === "boolean", {
    message: "skipTrash must be a boolean value",
  }),
});

/**
 * Defines the schema for validating pagination parameters.
 *
 * Workflow:
 * 1. Validates page and limit as positive numbers (limit max 100).
 * 2. Allows an optional search term (max 100 chars, nullable).
 *
 * @property page - The page number (minimum 1).
 * @property limit - The number of items per page (1-100).
 * @property search - Optional search term (max 100 chars).
 */
export const paginationSchema = z.object({
  page: z.number().min(1, { message: "Page number must be at least 1" }),
  limit: z
    .number()
    .min(1, { message: "Limit must be at least 1" })
    .max(100, { message: "Limit must not exceed 100" }),
  search: z
    .string()
    .min(0, { message: "Search term is required" })
    .max(100, { message: "Search term is too long" })
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating role sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields ( name, description, createdAt, deletedAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by ( name, description, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const rolesSortingSchema = z.object({
  sortBy: z
    .enum(["name", "description", "createdAt", "deletedAt"], {
      message:
        "Sort field must be one of:  name, description, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

/**
 * Defines the schema for validating user sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (id, firstName, lastName, email, etc.).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (id, firstName, lastName, email, etc.).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const usersSortingSchema = z.object({
  sortBy: z
    .enum(
      [
        "firstName",
        "lastName",
        "email",
        "emailVerified",
        "gender",
        "roles",
        "isAccountActivated",
        "createdAt",
        "deletedAt",
      ],
      {
        message:
          "Sort field must be one of: firstName, lastName, email, emailVerified, gender, role, isAccountActivated, createdAt, deletedAt",
      }
    )
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

// Defines a mapping for category values used in category schemas
export const categoryMap: Record<string, string> = {
  Category: "category",
  Sub_Category: "subCategory",
};

/**
 * Defines the schema for validating a single category creation input.
 *
 * Workflow:
 * 1. Validates thumbnail as a UUID (nullable and optional).
 * 2. Ensures name and slug are non-empty strings with a minimum length of 3 characters.
 * 3. Validates optional description with a minimum length of 3 characters if provided.
 * 4. Validates optional parentCategoryId as UUID.
 *
 * @property thumbnail - UUID for the category's thumbnail image.
 * @property name - Category name (minimum 3 characters).
 * @property slug - Category slug (minimum 3 characters).
 * @property description - Optional category description (minimum 3 characters).
 * @property parentCategoryId - Optional parent category ID (UUID format).
 */
export const createCategorySchema = z.object({
  thumbnail: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .nullable()
    .optional(),
  name: z.string().min(3, "Category name must be at least 3 characters").trim(),
  slug: z.string().min(3, "Category slug must be at least 3 characters").trim(),
  description: z
    .string()
    .min(3, "Category description must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
  parentCategoryId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating a single category update input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Validates thumbnail as an optional UUID.
 * 3. Ensures name, slug, and description are optional strings with a minimum length of 3 characters if provided.
 * 4. Validates optional parentCategoryId as UUID.
 * 5. Ensures that at least one field other than id is provided for update.
 *
 * @property id - Unique identifier of the category (UUID format).
 * @property thumbnail - Optional UUID for the category's thumbnail image.
 * @property name - Optional category name (minimum 3 characters).
 * @property slug - Optional category slug (minimum 3 characters).
 * @property description - Optional category description (minimum 3 characters).
 * @property parentCategoryId - Optional parent category ID (UUID format).
 */
export const updateCategorySchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    thumbnail: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .nullable()
      .optional(),
    name: z
      .string()
      .min(3, "Category name must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    slug: z
      .string()
      .min(3, "Category slug must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    description: z
      .string()
      .min(3, "Category description must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    parentCategoryId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .nullable()
      .optional(),
  })
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
 * Defines the schema for validating a single category position update input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Ensures position is a non-negative integer.
 * 3. Validates categoryType as either 'category' or 'subCategory'.
 *
 * @property id - Unique identifier of the category (UUID format).
 * @property position - Position value (non-negative integer).
 * @property categoryType - Category type (category or subCategory).
 */
export const updateCategoryPositionSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
  position: z
    .number({
      required_error: "Position is required",
      invalid_type_error: "Position must be a number",
    })
    .int("Position must be an integer")
    .nonnegative("Position must be 0 or a positive integer"),
  categoryType: z.preprocess((val) => {
    if (typeof val === "string" && categoryMap[val]) {
      return categoryMap[val];
    }
    return val;
  }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]])),
});

/**
 * Defines the schema for validating a single category deletion input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Validates categoryType as either 'category' or 'subCategory'.
 * 3. Ensures skipTrash is an optional boolean with a default of false.
 * 4. Validates optional categoryId and parentSubCategoryId as UUIDs if provided.
 *
 * @property id - Unique identifier of the category (UUID format).
 * @property categoryType - Category type (category or subCategory).
 * @property skipTrash - Optional flag to skip trash (defaults to false).
 * @property categoryId - Optional parent category ID (UUID format) for subcategory position update.
 * @property parentSubCategoryId - Optional parent subcategory ID (UUID format) for nested subcategory.
 */
export const deleteCategorySchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
  categoryType: z.preprocess((val) => {
    if (typeof val === "string" && categoryMap[val]) {
      return categoryMap[val];
    }
    return val;
  }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]])),
  skipTrash: z.boolean().optional().default(false),
  categoryId: z.string().uuid({ message: "Invalid UUID format" }).optional(), // needed for subcategory position update
  parentSubCategoryId: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .optional(), // needed for nested subcategory
});

/**
 * Defines the schema for validating category restoration input.
 *
 * Workflow:
 * 1. Validates ids as an array of UUIDs with at least one entry.
 * 2. Validates categoryType as either 'category' or 'subCategory'.
 *
 * @property ids - Array of category IDs (UUID format, minimum 1).
 * @property categoryType - Category type (category or subCategory).
 */
export const restoreCategorySchema = z.array(
  z.object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    categoryType: z.preprocess((val) => {
      if (typeof val === "string" && categoryMap[val]) {
        return categoryMap[val];
      }
      return val;
    }, z.enum([...new Set(Object.values(categoryMap))] as [string, ...string[]])),
  })
);

/**
 * Defines the schema for validating category sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (name, description, createdAt, deletedAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, slug, description, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const categorySortingSchema = z.object({
  sortBy: z
    .enum(["name", "slug", "description", "createdAt", "deletedAt"], {
      message:
        "Sort field must be one of: name, slug, description, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

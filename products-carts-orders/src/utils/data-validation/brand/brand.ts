import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating a single brand object creation input.
 *
 * Workflow:
 * 1. Validates thumbnail as an optional URL.
 * 2. Ensures name and slug are non-empty strings with a minimum length of 3 characters.
 *
 * @property thumbnail - Optional ID for the brand's thumbnail image.
 * @property name - Brand name (minimum 3 characters).
 * @property slug - Brand slug (minimum 3 characters).
 */
export const createBrandSchema = z.object({
  thumbnail: z
    .string()
    .uuid({ message: "Invalid UUID format" })
    .nullable()
    .optional(),
  name: z.string().min(3, "Brand name must be at least 3 characters").trim(),
  slug: z.string().min(3, "Brand slug must be at least 3 characters").trim(),
});

/**
 * Defines the schema for validating a single brand object update input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Validates thumbnail as an optional URL.
 * 3. Ensures name and slug are optional strings with a minimum length of 3 characters if provided.
 *
 * @property id - Unique identifier of the brand (UUID format).
 * @property thumbnail - Optional ID for the brand's thumbnail image.
 * @property name - Optional brand name (minimum 3 characters).
 * @property slug - Optional brand slug (minimum 3 characters).
 */
export const updateBrandSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    thumbnail: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .nullable()
      .optional(),
    name: z
      .string()
      .min(3, "Brand name must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    slug: z
      .string()
      .min(3, "Brand slug must be at least 3 characters")
      .trim()
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
 * Defines the schema for validating brand sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (name, slug, createdAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, slug, createdAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const brandsSortingSchema = z.object({
  sortBy: z
    .enum(["name", "slug", "createdAt"], {
      message: "Sort field must be one of: name, slug, createdAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating a single tag object creation input.
 *
 * Workflow:
 * 1. Validates name as a non-empty string with a minimum length of 3 characters.
 * 2. Validates slug as a non-empty string with a minimum length of 3 characters.
 *
 * @property name - Tag name (minimum 3 characters).
 * @property slug - Tag slug (minimum 3 characters).
 */
export const createTagSchema = z.object({
  name: z.string().min(3, "Tag name must be at least 3 characters").trim(),
  slug: z.string().min(3, "Tag slug must be at least 3 characters").trim(),
});

/**
 * Defines the schema for validating a single tag object update input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Validates name and slug as optional strings with a minimum length of 3 characters if provided.
 *
 * @property id - Unique identifier of the tag (UUID format).
 * @property name - Optional tag name (minimum 3 characters).
 * @property slug - Optional tag slug (minimum 3 characters).
 */
export const updateTagSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    name: z
      .string()
      .min(3, "Tag name must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    slug: z
      .string()
      .min(3, "Tag slug must be at least 3 characters")
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
 * Defines the schema for validating tag sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (name, slug, createdAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, slug, createdAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const tagsSortingSchema = z.object({
  sortBy: z
    .enum(["name", "slug", "createdAt"], {
      message: "Sort field must be one of: name, slug, createdAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating a single tax status object creation input.
 *
 * Workflow:
 * 1. Validates value as a non-empty string with a minimum length of 3 characters.
 * 2. Ensures description is an optional string with a minimum length of 3 characters if provided.
 *
 * @property value - Tax status value (minimum 3 characters).
 * @property description - Optional tax status description (minimum 3 characters).
 */
export const createTaxStatusSchema = z.object({
  value: z
    .string()
    .min(3, "Tax status value must be at least 3 characters")
    .trim(),
  description: z
    .string()
    .min(3, "Tax status description must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating a single tax status object update input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Validates value as an optional string with a minimum length of 3 characters if provided.
 * 3. Ensures description is an optional string with a minimum length of 3 characters if provided.
 *
 * @property id - Unique identifier of the tax status (UUID format).
 * @property value - Optional tax status value (minimum 3 characters).
 * @property description - Optional tax status description (minimum 3 characters).
 */
export const updateTaxStatusSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
  value: z
    .string()
    .min(3, "Tax status value must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
  description: z
    .string()
    .min(3, "Tax status description must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating tax status sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (value, description, createdAt, deletedAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (value, description, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const taxStatusSortingSchema = z.object({
  sortBy: z
    .enum(["value", "description", "createdAt", "deletedAt"], {
      message:
        "Sort field must be one of: value, description, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

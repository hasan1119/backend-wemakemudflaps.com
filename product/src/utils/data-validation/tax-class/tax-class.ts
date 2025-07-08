import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating a single tax class object creation input.
 *
 * Workflow:
 * 1. Validates value as a non-empty string with a minimum length of 3 characters.
 * 2. Ensures description is an optional string with a minimum length of 3 characters if provided.
 *
 * @property value - Tax class value (minimum 3 characters).
 * @property description - Optional tax class description (minimum 3 characters).
 */
export const createTaxClassSchema = z.object({
  value: z
    .string()
    .min(3, "Tax class value must be at least 3 characters")
    .trim(),
  description: z
    .string()
    .min(3, "Tax class description must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating a single tax class object update input.
 *
 * Workflow:
 * 1. Validates id as a UUID.
 * 2. Validates value as an optional string with a minimum length of 3 characters if provided.
 * 3. Ensures description is an optional string with a minimum length of 3 characters if provided.
 *
 * @property id - Unique identifier of the tax class (UUID format).
 * @property value - Optional tax class value (minimum 3 characters).
 * @property description - Optional tax class description (minimum 3 characters).
 */
export const updateTaxClassSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    value: z
      .string()
      .min(3, "Tax class value must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    description: z
      .string()
      .min(3, "Tax class description must be at least 3 characters")
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
 * Defines the schema for validating tax class sorting parameters.
 *
 * Workflow:
 * 1. Validates sortBy as one of the allowed fields (value, description, createdAt, deletedAt).
 * 2. Validates sortOrder as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (value, description, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const taxClassSortingSchema = z.object({
  sortBy: z
    .enum(["value", "description", "createdAt", "deletedAt"], {
      message:
        "Sort field must be one of: value, description, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

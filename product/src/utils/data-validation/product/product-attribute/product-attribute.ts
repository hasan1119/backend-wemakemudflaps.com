import { z } from "zod";
import { SortOrderTypeEnum } from "../../common/common";

/**
 * Defines the schema for creating a new product attribute.
 *
 * Workflow:
 * 1. Validates that `name` is a non-empty string.
 * 2. Validates `isVisible` as a boolean.
 * 3. Validates `values` as an array of product attribute values, ensuring at least one value is provided.
 *
 * @property name - The name of the product attribute, which must be a non-empty string.
 * @property slug - A URL-friendly identifier for the product attribute, which must be a non-empty string.
 * @property values - An array of product attribute values, which must contain at least one value.
 * @property systemAttributeId - An optional string representing the ID of a system attribute to replicate, which can be null.
 */
export const CreateProductAttributeInputSchema = z.object({
  name: z.string().min(1, "Attribute name is required").trim(),
  slug: z.string().min(1, "Slug is required").trim(),
  values: z
    .array(z.string().min(1, "Value cannot be empty").trim())
    .min(1, "At least one value is required"),
  systemAttributeId: z
    .string()
    .uuid("Invalid UUID ID format")
    .optional()
    .nullable(),
});

/**
 * Defines the schema for updating an existing product attribute.
 *
 * Workflow:
 * 1. Validates that `name` is a non-empty string if provided.
 * 2. Validates `isVisible` as a boolean if provided.
 * 3. Validates `values` as an optional array of product attribute values.
 *
 * @property name - The name of the product attribute, which can be an empty string or omitted.
 * @property slug - A URL-friendly identifier for the product attribute, which can be an empty string or omitted.
 * @property isVisible - An optional boolean indicating if the attribute should be visible.
 * @property values - An optional array of product attribute values.
 */
export const UpdateProductAttributeInputSchema = z
  .object({
    id: z.string().uuid("Invalid UUID ID format"),
    name: z
      .string()
      .min(1, "Attribute name cannot be empty")
      .trim()
      .optional()
      .nullable(),
    slug: z
      .string()
      .min(1, "Slug cannot be empty")
      .trim()
      .optional()
      .nullable(),
    values: z
      .array(z.string().min(1, "Value cannot be empty").trim())
      .optional()
      .nullable(),
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
 * Defines the schema for validating product attribute sorting parameters.
 *
 * Workflow:
 * 1. Validates `sortBy` as one of the allowed fields (name, slug, createdAt, deletedAt).
 * 2. Validates `sortOrder` as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, slug, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const productAttributeSortingSchema = z.object({
  sortBy: z
    .enum(["name", "slug", "createdAt", "deletedAt"], {
      message: "Sort field must be one of: name, slug, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

import { z } from "zod";
import { SortOrderTypeEnum } from "../../common/common";

/**
 * Defines the schema for validating product attribute values input.
 *
 * Workflow:
 * 1. Validates that the `value` is a non-empty string.
 *
 * @property value - The value of the product attribute, which must be a non-empty string.
 */
export const ProductAttributeValueInputSchema = z.object({
  value: z.string().min(1, "Attribute value cannot be empty").trim(),
});

/**
 * Defines the schema for creating a new product attribute.
 *
 * Workflow:
 * 1. Validates that `name` is a non-empty string.
 * 2. Validates `isVisible` as a boolean.
 * 3. Validates `values` as an array of product attribute values, ensuring at least one value is provided.
 *
 * @property name - The name of the product attribute, which must be a non-empty string.
 * @property isVisible - A boolean indicating if the attribute is visible.
 * @property values - An array of product attribute values, which must contain at least one value.
 */
export const CreateProductAttributeInputSchema = z.object({
  name: z.string().min(1, "Attribute name is required").trim(),
  isVisible: z.boolean(),
  values: z
    .array(ProductAttributeValueInputSchema)
    .min(1, "At least one value is required"),
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
 * @property isVisible - A boolean indicating if the attribute is visible, which can be omitted.
 * @property values - An optional array of product attribute values.
 */
export const UpdateProductAttributeInputSchema = z.object({
  name: z.string().min(1, "Attribute name cannot be empty").trim().optional(),
  isVisible: z.boolean().optional(),
  values: z.array(ProductAttributeValueInputSchema).optional(),
});

/**
 * Defines the schema for validating product attribute sorting parameters.
 *
 * Workflow:
 * 1. Validates `sortBy` as one of the allowed fields (name, createdAt, deletedAt).
 * 2. Validates `sortOrder` as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by (name, createdAt, deletedAt).
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const productAttributeSortingSchema = z.object({
  sortBy: z
    .enum(["name", "createdAt", "deletedAt"], {
      message: "Sort field must be one of: name, createdAt, deletedAt",
    })
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

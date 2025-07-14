import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating a single shipping method object creation input.
 *
 * Workflow:
 * 1. Validates title as a non-empty string.
 * 2. Ensures status is an optional boolean.
 * 3. Ensures description is an optional string that can be null.
 * 4. Validates that exactly one of the shipping method IDs is provided.
 *
 * @property title - Shipping method title (required).
 * @property status - Optional shipping method status (boolean).
 * @property description - Optional shipping method description (string or null).
 */
export const createShippingMethodSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    status: z.boolean().optional(),
    description: z.string().nullable().optional(),
    flatRateId: z.string().uuid().optional().nullable(),
    freeShippingId: z.string().uuid().optional().nullable(),
    localPickUpId: z.string().uuid().optional().nullable(),
    upsId: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) => {
      const ids = [
        data.flatRateId,
        data.freeShippingId,
        data.localPickUpId,
        data.upsId,
      ];
      // Only one must be set (not null/undefined)
      return ids.filter((id) => !!id).length === 1;
    },
    {
      message:
        "Only one of flatRateId, freeShippingId, localPickUpId, or upsId can be set.",
      path: ["flatRateId", "freeShippingId", "localPickUpId", "upsId"],
    }
  );

/**
 * Defines the schema for validating a single shipping method object update input.
 *
 * Workflow:
 * 1. Validates id as a UUID string.
 * 2. Validates title as a non-empty string with a minimum length of 3 characters if provided.
 * 3. Ensures description is an optional string with a minimum length of 3 characters if provided.
 *
 * @property id - Shipping method ID (UUID).
 * @property title - Shipping method title (minimum 3 characters).
 * @property description - Optional shipping method description (minimum 3 characters).
 */
export const updateShippingMethodSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").optional(),
  status: z.boolean().optional(),
  description: z.string().nullable().optional(),
});

/**
 * Defines the schema for validating sorting options for shipping methods.
 *
 * Workflow:
 * 1. Validates sortBy as an optional enum with allowed values.
 * 2. Validates sortOrder as a required enum.
 *
 * @property sortBy - Optional field to sort by (title, status, createdAt).
 * @property sortOrder - Required field to specify the order (ascending or descending).
 */
export const shippingMethodSortingSchema = z.object({
  sortBy: z.enum(["title", "status", "createdAt"]).optional(),
  sortOrder: SortOrderTypeEnum,
});

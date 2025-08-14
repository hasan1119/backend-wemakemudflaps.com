import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

const regionSchema = z.object({
  country: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  area: z.string().min(1).max(100).nullable().optional(),
});

/**
 * Defines the schema for validating a shipping zone creation input.
 *
 * Workflow:
 * 1. Validates name as a non-empty string with a minimum length of 2 characters.
 * 2. Validates regions as an array of non-empty strings with a minimum length of 1 characters.
 * 3. Validates zipCodes as an optional array of strings with a minimum length of 1 characters.
 *
 * @property name - Shipping zone name (required).
 * @property regions - Array of regions (required).
 * @property zipCodes - Optional array of zip codes.
 */
export const createShippingZoneSchema = z.object({
  name: z.string().min(2).max(100),
  regions: z.array(regionSchema).optional().nullable(),
  zipCodes: z.array(z.string().min(1).max(20)).optional(),
});

/**
 * Defines the schema for validating a shipping zone update input.
 *
 * Workflow:
 * 1. Validates id as a UUID string.
 * 2. Validates name as an optional string with a minimum length of 1 characters.
 * 3. Validates regions as an optional array of non-empty strings with a minimum length of 1 characters.
 * 4. Validates shippingMethodIds as an optional array of UUID strings.
 *
 * @property id - Shipping zone ID (required).
 * @property name - Shipping zone name (optional).
 * @property regions - Array of regions (optional).
 * @property zipCodes - Optional array of zip codes.
 */
export const updateShippingZoneSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(2).max(100).optional().nullable(),
    regions: z.array(regionSchema).optional().nullable(),
    zipCodes: z.array(z.string().min(1).max(20)).optional().nullable(),
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
  )
  .refine(
    (data) =>
      !data.regions || (Array.isArray(data.regions) && data.regions.length > 0),
    {
      message: "Regions array cannot be empty if provided",
      path: ["regions"],
    }
  );

/**
 * Exports shipping zone related schemas for shipping zone management.
 *
 * Workflow:
 * 1. Provides schemas for creating, updating, and sorting shipping zones.
 */
export const sortShippingZoneSchema = z.object({
  sortBy: z.enum(["name", "createdAt"]),
  sortOrder: SortOrderTypeEnum,
});

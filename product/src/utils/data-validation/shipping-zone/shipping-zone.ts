import { z } from "zod";

/**
 * Defines the schema for validating a shipping zone creation input.
 *
 * Workflow:
 * 1. Validates name as a non-empty string with a minimum length of 2 characters.
 * 2. Validates regions as an array of non-empty strings with a minimum length of 2 characters.
 * 3. Validates zipCodes as an optional array of strings with a minimum length of 2 characters.
 *
 * @property name - Shipping zone name (required).
 * @property regions - Array of regions (required).
 * @property zipCodes - Optional array of zip codes.
 */
export const createShippingZoneSchema = z.object({
  name: z.string().min(2).max(100),
  regions: z.array(z.string().min(2).max(100)),
  zipCodes: z.array(z.string().min(2).max(20)).optional(),
});

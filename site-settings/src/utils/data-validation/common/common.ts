import { z } from "zod";

/**
 * Defines the schema for validating a single UUID.
 *
 * Workflow:
 * 1. Validates that the id field is a valid UUID string.
 *
 * @property id - The UUID string to validate.
 */
export const idSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating an array of UUIDs.
 *
 * Workflow:
 * 1. Validates that the ids field is a non-empty array of valid UUID strings.
 *
 * @property ids - An array of UUID strings (at least one required).
 */
export const idsSchema = z.object({
  ids: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" }),
});

/**
 * Defines the schema for validating the skipTrash flag.
 *
 * Workflow:
 * 1. Validates that skipTrash is a boolean value.
 *
 * @property skipTrash - Boolean flag to indicate skipping trash.
 */
export const skipTrashSchema = z.object({
  skipTrash: z.boolean().refine((val) => typeof val === "boolean", {
    message: "skipTrash must be a boolean value",
  }),
});

/**
 * Defines the schema for validating pagination parameters.
 *
 * Workflow:
 * 1. Validates page and limit as positive numbers (limit max 100).
 * 2. Allows an optional search term (max 100 chars, nullable).
 *
 * @property page - The page number (minimum 1).
 * @property limit - The number of items per page (1-100).
 * @property search - Optional search term (max 100 chars).
 */
export const paginationSchema = z.object({
  page: z.number().min(1, { message: "Page number must be at least 1" }),
  limit: z
    .number()
    .min(1, { message: "Limit must be at least 1" })
    .max(100, { message: "Limit must not exceed 100" }),
  search: z
    .string()
    .min(0, { message: "Search term is required" })
    .max(100, { message: "Search term is too long" })
    .nullable()
    .optional(),
});

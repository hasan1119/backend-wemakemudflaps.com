import { z } from "zod";

// ID Schema (Single UUID)
export const idSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
});

// IDs Schema (Array of UUIDs)
export const idsSchema = z.object({
  ids: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" }),
});

// IDs Schema (Array of UUIDs)
export const skipTrashSchema = z.object({
  skipTrash: z.boolean().refine((val) => typeof val === "boolean", {
    message: "skipTrash must be a boolean value",
  }),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().min(1, { message: "Page number must be at least 1" }),
  limit: z
    .number()
    .min(1, { message: "Limit must be at least 1" })
    .max(100, { message: "Limit must not exceed 100" }),
  search: z
    .string()
    .min(1, { message: "Search term is required" })
    .max(100, { message: "Search term is too long" })
    .optional(),
  sortBy: z
    .string()
    .min(1, { message: "Sort field is required" })
    .max(50, { message: "Sort field is too long" })
    .optional(),
  sortOrder: z
    .enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" })
    .optional(),
});

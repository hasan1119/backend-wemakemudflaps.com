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
    .min(0, { message: "Search term is required" })
    .max(100, { message: "Search term is too long" })
    .optional(),
});

// Sorting Schema for Media
export const mediaSortingSchema = z.object({
  sortBy: z
    .enum(["title", "description", "category", "createdBy", "createdAt"], {
      message:
        "Sort field must be one of: title, description, category, createdBy, createdAt",
    })
    .nullable()
    .optional(),
  sortOrder: z
    .enum(["asc", "desc"], { message: "Sort order must be 'asc' or 'desc'" })
    .nullable()
    .optional(),
});

// Combined Schema for Media Pagination and Sorting
export const mediaCombinedSchema = z.intersection(
  paginationSchema,
  mediaSortingSchema
);

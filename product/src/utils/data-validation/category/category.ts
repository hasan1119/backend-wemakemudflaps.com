import { z } from "zod";

// Defines the schema for a single RolePermission object
export const createCategorySchema = z
  .object({
    thumbnail: z.string().url("Invalid URL format"),
    name: z
      .string()
      .min(3, "Category name must be at least 3 characters")
      .trim(),
    description: z
      .string()
      .min(3, "Category description must be at least 3 characters")
      .trim()
      .nullable()
      .optional(),
    categoryId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .nullable()
      .optional(),
    parentSubCategoryId: z
      .string()
      .uuid({ message: "Invalid UUID format" })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => !(data.categoryId && data.parentSubCategoryId), // both can't be present
    {
      message: "Only one of categoryId or parentSubCategoryId can be provided.",
      path: ["categoryId"], // You can target both fields if needed
    }
  );

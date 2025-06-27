import { z } from "zod";

// Defines the schema for a single category object
export const createCategorySchema = z
  .object({
    thumbnail: z.string().url("Invalid URL format"),
    name: z
      .string()
      .min(3, "Category name must be at least 3 characters")
      .trim(),
    slug: z
      .string()
      .min(3, "Category slug must be at least 3 characters")
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

// Define enum for category type
export const CategoryTypeEnum = z.enum(["category", "subCategory"], {
  errorMap: () => ({
    message: "Category type must be either 'category' or 'subCategory'",
  }),
});

// Defines the schema for a single update category object
export const updateCategorySchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
  thumbnail: z.string().url("Invalid URL format").optional(),
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .trim()
    .optional(),
  slug: z
    .string()
    .min(3, "Category slug must be at least 3 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .min(3, "Category description must be at least 3 characters")
    .trim()
    .nullable()
    .optional(),
  categoryType: CategoryTypeEnum,
});

// Defines the schema for a single update position category object
export const updateCategoryPositionSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }),
  position: z
    .number({
      required_error: "Position is required",
      invalid_type_error: "Position must be a number",
    })
    .int("Position must be an integer")
    .nonnegative("Position must be 0 or a positive integer"),
  categoryType: CategoryTypeEnum,
});

// Defines the schema for a single delete category object
export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
  categoryType: CategoryTypeEnum,
  skipTrash: z.boolean().optional().default(false),
  categoryId: z.string().uuid().optional(), // needed for subcategory position update
  parentSubCategoryId: z.string().uuid().optional(), // needed for nested subcategory
});

// Defines the schema to restore category object
export const restoreCategorySchema = z.object({
  ids: z
    .array(z.string().uuid({ message: "Invalid UUID format" }))
    .min(1, { message: "At least one UUID is required" }),
  categoryType: CategoryTypeEnum,
});

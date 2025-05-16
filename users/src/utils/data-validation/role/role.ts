import { z } from "zod";

// Define the Zod schema for the create/update user role input
export const userRoleSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format" }).optional(),
  name: z
    .string()
    .min(3, "Role name must be at least 3 characters long")
    .max(50, "Role name must not exceed 50 characters")
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .min(3, "Role description must be at least 3 characters long")
    .max(50, "Role description must not exceed 50 characters")
    .optional(),
  password: z.string().optional(),
});

// Define the Zod schema for the update user's role input
export const userRoleUpdateSchema = z.object({
  roleId: z.string().uuid({ message: "Invalid UUID format" }),
  userId: z.string().uuid({ message: "Invalid UUID format" }),
  password: z.string().optional(),
});

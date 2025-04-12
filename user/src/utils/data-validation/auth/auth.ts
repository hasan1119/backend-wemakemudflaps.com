import { z } from "zod";

// Define the Gender enum as per your GraphQL schema
const GenderEnum = z.enum(["Male", "Female", "Others", "Rather not to say"]);

// Define the Zod schema for the register input
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must not exceed 50 characters" })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: "First name must contain only letters, spaces, or hyphens",
    }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must not exceed 50 characters" })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: "Last name must contain only letters, spaces, or hyphens",
    }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must not exceed 100 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
  gender: GenderEnum.nullable().optional(), // Gender is optional and can be null
});

// Define the Zod schema for the login input
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  password: z.string().min(1, { message: "Password is required" }),
});

// Define the Zod schema for the login input
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

// Define the Zod schema for the login input
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must not exceed 100 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

// Define the Zod schema for the change password input
export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must not exceed 100 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must not exceed 100 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

// Define the Zod schema for the update profile input
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name is too long" })
    .optional(),

  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name is too long" })
    .optional(),

  email: z.string().email({ message: "Invalid email format" }).optional(),

  gender: GenderEnum.nullable().optional(), // Gender is optional and can be null
});

// Define the Zod schema for the creaete/update user role input
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
});

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

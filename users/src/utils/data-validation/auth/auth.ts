import { z } from "zod";

// Defines a mapping for gender values used in authentication and profile schemas
export const genderMap: Record<string, string> = {
  Male: "Male",
  Female: "Female",
  Others: "Others",
  Rather_not_to_say: "Rather not to say",
};

/**
 * Defines the schema for validating user registration input.
 *
 * Workflow:
 * 1. Validates firstName, lastName, email, password, and optional gender and companyName fields.
 * 2. Ensures firstName and lastName contain only letters, spaces, or hyphens.
 * 3. Enforces password complexity (min 8 chars, uppercase, lowercase, number, special char).
 * 4. Maps gender values to predefined options using genderMap.
 *
 * @property firstName - User's first name (letters, spaces, hyphens, max 50 chars).
 * @property lastName - User's last name (letters, spaces, hyphens, max 50 chars).
 * @property username - User's user name (letters, numbers, hyphens, max 50 chars).
 * @property email - User's email address (valid format).
 * @property password - User's password (complexity requirements).
 * @property gender - Optional gender value from genderMap.
 * @property companyName - Optional company or organization name (max 100 characters).
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must not exceed 50 characters" })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: "First name must contain only letters, spaces, or hyphens",
    })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must not exceed 50 characters" })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: "Last name must contain only letters, spaces, or hyphens",
    })
    .trim(),
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .max(50, { message: "Username must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Username must contain only letters, numbers, or hyphens",
    })
    .trim(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
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
  gender: z
    .preprocess((val) => {
      if (typeof val === "string" && genderMap[val]) {
        return genderMap[val];
      }
      return val;
    }, z.enum([...new Set(Object.values(genderMap))] as [string, ...string[]]))
    .nullable()
    .optional(),
  companyName: z
    .string()
    .max(100, { message: "Company name must not exceed 100 characters" })
    .nullable()
    .optional(),
});

/**
 * Defines the schema for validating user login input.
 *
 * Workflow:
 * 1. Validates email and password fields.
 * 2. Ensures email is in a valid format.
 * 3. Requires a non-empty password string.
 *
 * @property email - User's email address (valid format).
 * @property password - User's password (non-empty).
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  password: z.string({ message: "Password is required" }),
});

/**
 * Defines the schema for validating email input.
 *
 * Workflow:
 * 1. Validates a single email field.
 * 2. Ensures email is in a valid format.
 *
 * @property email - User's email address (valid format).
 */
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

/**
 * Defines the schema for validating password reset input.
 *
 * Workflow:
 * 1. Validates a UUID token and new password.
 * 2. Ensures new password meets complexity requirements (min 8 chars, uppercase, lowercase, number, special char).
 *
 * @property token - UUID token for password reset.
 * @property newPassword - New password with complexity requirements.
 */
export const resetPasswordSchema = z.object({
  token: z.string().uuid({ message: "Invalid UUID format" }),
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

/**
 * Defines the schema for validating user password change input.
 *
 * Workflow:
 * 1. Validates old and new passwords.
 * 2. Ensures both passwords meet complexity requirements (min 8 chars, uppercase, lowercase, number, special char).
 *
 * @property oldPassword - User's current password.
 * @property newPassword - User's new password with complexity requirements.
 */
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

/**
 * Defines the schema for validating user profile update input.
 *
 * Workflow:
 * 1. Validates required fields like userId, firstName, lastName, username, and email.
 * 2. Validates optional fields like phone, gender, address, avatar, website, bio, and companyName.
 * 3. Ensures firstName and lastName contain only letters, spaces, or hyphens.
 * 4. Validates username pattern and length.
 * 5. Validates email format.
 * 6. Maps gender string input to predefined options using genderMap.
 * 7. Validates address structure and optional nested fields.
 * 8. Validates website as a valid URL.
 * 9. Enforces max length for bio and companyName.
 *
 * @property userId - UUID of the user (required).
 * @property firstName - First name (letters, spaces, hyphens, max 50 chars).
 * @property lastName - Last name (letters, spaces, hyphens, max 50 chars).
 * @property username - Unique username (letters, numbers, hyphens, max 50 chars).
 * @property phone - Optional phone number (max 15 characters).
 * @property email - Valid email address (required).
 * @property gender - Optional gender value from genderMap.
 * @property address - Optional structured address (street, city, state, zip, country).
 * @property avatar - Optional media ID representing user's avatar.
 * @property website - Optional personal or professional website (valid URL).
 * @property bio - Optional short biography (max 1000 characters).
 * @property companyName - Optional company or organization name (max 100 characters).
 */
export const updateProfileSchema = z.object({
  userId: z.string().uuid({ message: "Invalid UUID format" }),
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name is too long" })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: "First name must contain only letters, spaces, or hyphens",
    })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name is too long" })
    .regex(/^[a-zA-Z\s-]+$/, {
      message: "Last name must contain only letters, spaces, or hyphens",
    })
    .trim(),
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .max(50, { message: "Username must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Username must contain only letters, numbers, or hyphens",
    })
    .trim(),
  phone: z
    .string()
    .max(15, { message: "Phone number must not exceed 15 digits" })
    .trim()
    .nullable()
    .optional(),
  email: z.string().email({ message: "Invalid email format" }).trim(),
  gender: z.preprocess((val) => {
    if (typeof val === "string" && genderMap[val]) {
      return genderMap[val];
    }
    return val;
  }, z.enum([...new Set(Object.values(genderMap))] as [string, ...string[]])),
  address: z
    .object({
      street: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      zip: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  avatar: z.string().nullable().optional(),
  website: z
    .string()
    .url({ message: "Website must be a valid URL" })
    .nullable()
    .optional(),
  bio: z
    .string()
    .max(1000, { message: "Bio must not exceed 1000 characters" })
    .nullable()
    .optional(),
  companyName: z
    .string()
    .max(100, { message: "Company name must not exceed 100 characters" })
    .nullable()
    .optional(),
});

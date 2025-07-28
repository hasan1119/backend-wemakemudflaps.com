import z from "zod";

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
 * Defines the schema for validating site settings.
 *
 *  Workflow:
 * 1. Validates that the name is a non-empty string.
 * 2. Validates that metaData is a string or null.
 * 3. Validates that favIcon and logo are strings or null.
 * 4. Validates that contactNumber is a string or null.
 * 5. Validates that contactEmail is a valid email string or null.
 * 6. Validates that shopAddress is an object with optional string fields.
 *
 * @property name - The name of the site setting (optional, nullable).
 * @property metaData - Metadata for the site setting (optional, nullable).
 * @property favIcon - Favicon URL for the site setting (optional, nullable).
 * @property logo - Logo URL for the site setting (optional, nullable).
 * @property contactNumber - Contact number for the site setting (optional, nullable).
 * @property contactEmail - Contact email for the site setting (optional, nullable).
 * @property shopAddress - Address of the shop (optional, nullable).
 * The shopAddress object can contain:
 *   - addressLine1: Address line 1 (optional, nullable).
 *   - addressLine2: Address line 2 (optional, nullable).
 *   - city: City (optional, nullable).
 *   - state: State (optional, nullable).
 *   - country: Country (optional, nullable).
 *   - zip: ZIP code (optional, nullable).
 */
export const siteSettingsSchema = z
  .object({
    name: z
      .string({ message: "Site name is required" })
      .min(1, { message: "Site name cannot be empty" })
      .optional()
      .nullable(),
    metaData: z
      .string({ message: "Meta data must be a string" })
      .optional()
      .nullable(),
    favIcon: z
      .string({ message: "Favicon URL must be a string" })
      .optional()
      .nullable(),
    logo: z
      .string({ message: "Logo URL must be a string" })
      .optional()
      .nullable(),
    contactNumber: z
      .string({ message: "Contact number must be a string" })
      .optional()
      .nullable(),
    contactEmail: z
      .string({ required_error: "Contact email is required" })
      .email({ message: "Invalid email format" })
      .optional()
      .nullable(),
    shopAddress: z
      .object({
        addressLine1: z
          .string({ message: "Address Line 1 must be a string" })
          .optional()
          .nullable(),
        addressLine2: z
          .string({ message: "Address Line 2 must be a string" })
          .optional()
          .nullable(),
        city: z
          .string({ message: "City must be a string" })
          .optional()
          .nullable(),
        state: z
          .string({ message: "State must be a string" })
          .optional()
          .nullable(),
        country: z
          .string({ message: "Country must be a string" })
          .optional()
          .nullable(),
        zipCode: z
          .string({ message: "ZIP code must be a string" })
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== null), {
    message: "At least one field must be provided",
  });

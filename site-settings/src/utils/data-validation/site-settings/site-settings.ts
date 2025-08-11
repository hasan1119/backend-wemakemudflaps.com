import z from "zod";

/**
 * Defines the schema for validating site settings.
 *
 * Workflow:
 * 1. Validates that the name is a string (optional, nullable, non-empty if provided).
 * 2. Validates that metaData is an object with optional title, description, and keywords (nullable).
 * 3. Validates that favIcon and logo are strings (optional, nullable).
 * 4. Validates that contactNumber is a string (optional, nullable).
 * 5. Validates that contactEmail is a valid email string (optional, nullable).
 * 6. Validates that shopAddresses is an array of objects with optional fields (nullable).
 * 7. Validates that privacyPolicy and termsAndConditions are strings (optional, nullable).
 * 8. Validates that createdBy is a non-empty string (required).
 * 9. Validates that createdAt and deletedAt are Date objects or ISO strings (optional, nullable).
 *
 * @property name - The name of the site setting (optional, nullable).
 * @property metaData - Metadata for the site setting (optional, nullable).
 * @property favIcon - Favicon URL for the site setting (optional, nullable).
 * @property logo - Logo URL for the site setting (optional, nullable).
 * @property contactNumber - Contact number for the site setting (optional, nullable).
 * @property contactEmail - Contact email for the site setting (optional, nullable).
 * @property shopAddress - Shop address for the site setting (optional, nullable).
 * @property privacyPolicy - Privacy policy for the site setting (optional, nullable).
 * @property termsAndConditions - Terms and conditions for the site setting (optional, nullable).
 * @property createdBy - ID of the user who created the settings (required).
 * @property createdAt - Creation timestamp (optional, set by database if not provided).
 * @property deletedAt - Deletion timestamp (optional, nullable).
 *
 * The shopAddress object contains:
 *   - id: Unique identifier for the branch (required for updates, optional for creates).
 *   - brunchName: Name of the branch (optional, nullable).
 *   - addressLine1: Address line 1 (optional, nullable).
 *   - addressLine2: Address line 2 (optional, nullable).
 *   - emails: Array of email objects with type and email (optional, nullable).
 *   - phones: Array of phone objects with type and number (optional, nullable).
 *   - city: City (optional, nullable).
 *   - state: State (optional, nullable).
 *   - country: Country (optional, nullable).
 *   - zipCode: ZIP code (optional, nullable).
 *   - direction: Google Maps direction (optional, nullable).
 */
export const siteSettingsSchema = z
  .object({
    name: z
      .string({ message: "Site name must be a string" })
      .min(1, { message: "Site name cannot be empty if provided" })
      .optional()
      .nullable(),
    metaData: z
      .object({
        title: z
          .string({ message: "Title must be a string" })
          .optional()
          .nullable(),
        description: z
          .string({ message: "Description must be a string" })
          .optional()
          .nullable(),
        keywords: z
          .array(z.string(), {
            message: "Keywords must be an array of strings",
          })
          .optional()
          .nullable(),
      })
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
      .string({ message: "Contact email must be a string" })
      .email({ message: "Invalid email format" })
      .optional()
      .nullable(),
    shopAddress: z
      .object({
        id: z
          .string({ message: "Branch ID must be a string" })
          .uuid({ message: "Branch ID must be a valid UUID" })
          .optional()
          .nullable(),
        brunchName: z
          .string({ message: "Branch name must be a string" })
          .optional()
          .nullable(),
        addressLine1: z
          .string({ message: "Address Line 1 must be a string" })
          .optional()
          .nullable(),
        addressLine2: z
          .string({ message: "Address Line 2 must be a string" })
          .optional()
          .nullable(),
        emails: z
          .array(
            z.object({
              type: z
                .enum(["Corporate", "Complain", "Support", "Other"], {
                  message:
                    "Email type must be one of Corporate, Complain, Support, Other",
                })
                .optional()
                .nullable(),
              email: z
                .string({ message: "Email must be a string" })
                .email({ message: "Invalid email format" })
                .optional()
                .nullable(),
            }),
            { message: "Emails must be an array of email objects" }
          )
          .optional()
          .nullable(),
        phones: z
          .array(
            z.object({
              type: z
                .enum(["Mobile", "Landline", "Fax", "Other"], {
                  message:
                    "Phone type must be one of Mobile, Landline, Fax, Other",
                })
                .optional()
                .nullable(),
              number: z
                .string({ message: "Phone number must be a string" })
                .optional()
                .nullable(),
            }),
            { message: "Phones must be an array of phone objects" }
          )
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
        direction: z
          .string({ message: "Direction must be a string" })
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
    privacyPolicy: z
      .string({ message: "Privacy policy must be a string" })
      .optional()
      .nullable(),
    termsAndConditions: z
      .string({ message: "Terms and conditions must be a string" })
      .optional()
      .nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== null), {
    message: "At least one field must be provided",
  });

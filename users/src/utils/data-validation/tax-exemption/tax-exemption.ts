import { z } from "zod";

/**
 * Enum representing the possible statuses of a tax exemption.
 *
 * @enum {string}
 * @property Pending - Tax exemption request is pending approval.
 * @property Approved - Tax exemption request has been approved.
 * @property Rejected - Tax exemption request has been rejected.
 * @property Expired - Tax exemption request has expired.
 */
export enum TaxExemptionStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Expired = "Expired",
}

/**
 * Zod schema for validating the creation of a tax exemption entry.
 *
 * Fields:
 * - userId: Required UUID string representing the user submitting the exemption.
 * - taxNumber: Required string representing the tax identification number.
 * - assumptionReason: Required string explaining the reason for tax exemption.
 * - taxCertificate: Required string representing the media ID of the tax certificate.
 * - expiryDate: Required string representing the expiration date of the exemption.
 */
export const createTaxExemptionSchema = z.object({
  userId: z.string().uuid({ message: "Invalid UUID format" }),
  taxNumber: z.string().min(1, "Tax number is required"),
  assumptionReason: z.string().min(1, "Assumption reason is required"),
  taxCertificate: z.string().min(1, "Tax certificate media ID is required"),
  expiryDate: z.string().datetime({ message: "Invalid date format" }),
});

/**
 * Zod schema for validating updates to a tax exemption entry.
 *
 * Fields:
 * - id: Required UUID string representing the tax exemption record to update.
 * - userId: Required UUID string representing the user submitting the exemption.
 * - taxNumber: Optional string representing an updated tax number.
 * - assumptionReason: Optional string representing an updated assumption reason.
 * - taxCertificate: Optional string representing an updated tax certificate media ID.
 * - expiryDate: Optional string representing an updated expiration date.
 * - status: Optional enum indicating the updated status of the tax exemption.
 *
 * Validation ensures that at least one field besides `id` is provided for update.
 */
export const updateTaxExemptionSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    userId: z.string().uuid({ message: "Invalid UUID format" }),
    taxNumber: z
      .string({ message: "Tax number is required" })
      .min(1)
      .nullable()
      .optional(),
    assumptionReason: z
      .string({ message: "Assumption reason is required" })
      .min(1)
      .nullable()
      .optional(),
    taxCertificate: z
      .string({ message: "Tax certificate media ID is required" })
      .min(1)
      .nullable()
      .optional(),
    expiryDate: z
      .string()
      .datetime({ message: "Invalid date format" })
      .nullable()
      .optional(),
    status: z.nativeEnum(TaxExemptionStatus).nullable().optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== "id" && data[key as keyof typeof data] !== undefined
      ),
    {
      message: "At least one field must be provided for update besides id",
      path: [],
    }
  );

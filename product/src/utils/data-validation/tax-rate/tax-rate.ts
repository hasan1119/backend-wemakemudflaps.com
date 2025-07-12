import { z } from "zod";
import { SortOrderTypeEnum } from "../common/common";

/**
 * Defines the schema for validating the creation of a new tax rate.
 *
 * Workflow:
 * 1. Validates `country` and `label` as non-empty strings.
 * 2. Validates `rate`, `appliesToShipping`, `isCompound`, and `priority` as required fields with appropriate types.
 * 3. Validates `taxClassId` as a UUID to associate the tax rate with a tax class.
 * 4. `state`, `city`, and `postcode` are optional strings.
 *
 * @property country - The two-letter ISO country code (e.g., "US", "GB").
 * @property state - Optional state or province code within the country.
 * @property city - Optional city name.
 * @property postcode - Optional postal or ZIP code.
 * @property rate - The tax percentage (e.g., 7.5 is stored as 7.5000).
 * @property label - Label shown to customers (e.g., "Sales Tax", "VAT").
 * @property appliesToShipping - Whether this tax rate also applies to shipping.
 * @property isCompound - Whether this tax is compounded on top of other taxes.
 * @property priority - Priority for applying tax rates (lower number = higher priority).
 * @property taxClassId - The UUID of the tax class this rate belongs to.
 */
export const createTaxRateSchema = z.object({
  country: z.string().min(1, "Country is required."),
  state: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  rate: z.number({ required_error: "Rate is required." }),
  label: z.string().min(1, "Label is required."),
  appliesToShipping: z.boolean({
    required_error: "appliesToShipping is required.",
  }),
  isCompound: z.boolean({ required_error: "isCompound is required." }),
  priority: z.number({ required_error: "Priority is required." }).int(),
  taxClassId: z.string().uuid({ message: "Invalid UUID format" }),
});

/**
 * Defines the schema for validating updates to an existing tax rate.
 *
 * Workflow:
 * 1. Validates `id` as a UUID.
 * 2. All other fields are optional, allowing partial updates.
 * 3. Ensures at least one field (excluding `id`) is provided for update.
 *
 * @property id - Unique identifier of the tax rate (UUID format).
 * @property country - Optional two-letter ISO country code.
 * @property state - Optional state or province code.
 * @property city - Optional city name.
 * @property postcode - Optional postal or ZIP code.
 * @property rate - Optional tax percentage.
 * @property label - Optional label shown to customers.
 * @property appliesToShipping - Optional flag for shipping application.
 * @property isCompound - Optional flag for compounding.
 * @property priority - Optional priority for applying tax rates.
 * @property taxClassId - Optional UUID of associated tax class.
 */
export const updateTaxRateSchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    country: z.string().min(1, "Country is required.").optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    rate: z.number().optional(),
    label: z.string().min(1, "Label is required.").optional(),
    appliesToShipping: z.boolean().optional(),
    isCompound: z.boolean().optional(),
    priority: z.number().int().optional(),
    taxClassId: z.string().uuid({ message: "Invalid UUID format" }),
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

/**
 * Defines the schema for validating tax rate sorting parameters.
 *
 * Workflow:
 * 1. Validates `sortBy` as one of the allowed fields (country, state, city, postcode, rate, label, priority, createdAt, deletedAt).
 * 2. Validates `sortOrder` as either 'asc' or 'desc'.
 * 3. Allows both fields to be nullable or optional.
 *
 * @property sortBy - Field to sort by.
 * @property sortOrder - Sort order direction (asc, desc).
 */
export const taxRateSortingSchema = z.object({
  sortBy: z
    .enum(
      [
        "country",
        "state",
        "city",
        "postcode",
        "rate",
        "label",
        "priority",
        "createdAt",
        "deletedAt",
      ],
      {
        message:
          "Sort field must be one of: country, state, city, postcode, rate, label, priority, createdAt, deletedAt",
      }
    )
    .nullable()
    .optional(),
  sortOrder: SortOrderTypeEnum,
});

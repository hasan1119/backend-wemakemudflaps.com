import { z } from "zod";

/**
 * Enum representing the types of addresses that can be stored in the address book.
 *
 * @enum {string}
 * @property SHIPPING - Represents a shipping address.
 * @property BILLING - Represents a billing address.
 */

/**
 * Zod schema for validating the base structure of an address book entry.
 *
 * Fields:
 * - street: Required string representing the street address.
 * - houseNo: Optional string for the house or apartment number.
 * - city: Required string for the city name.
 * - state: Required string for the state or region.
 * - zip: Required string for the ZIP or postal code.
 * - country: Optional string for the country or district.
 * - type: Required enum value indicating the address type (SHIPPING or BILLING).
 * - isDefault: Required boolean indicating if this is the default address.
 */

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
}

// For create: all required except optional fields
export const createAddressBookEntrySchema = z.object({
  userId: z.string().uuid({ message: "Invalid UUID format" }),
  company: z.string().min(1, "Company name must be at least 1 character long"),
  streetOne: z.string().min(1, "Street one must be at least 1 character long"),
  streetTwo: z.string().min(1, "Street two must be at least 1 character long"),
  city: z.string().min(1, "City must be at least 1 character long"),
  state: z.string().min(1, "State must be at least 1 character long"),
  zip: z.string().min(1, "ZIP code must be at least 1 character long"),
  country: z.string().optional(),
  type: z.nativeEnum(AddressType),
  isDefault: z.boolean(),
});

// For update: allow partial updates, but require at least one field
export const updateAddressBookEntrySchema = z
  .object({
    userId: z.string().uuid({ message: "Invalid UUID format" }),
    id: z.string().uuid({ message: "Invalid UUID format" }),
    company: z
      .string()
      .min(1, "Company name is required")
      .nullable()
      .optional(),
    streetOne: z
      .string()
      .min(1, "Street one is required")
      .nullable()
      .optional(),
    streetTwo: z
      .string()
      .min(1, "Street two is required")
      .nullable()
      .optional(),
    city: z.string().min(1, "City is required").nullable().optional(),
    state: z.string().min(1, "State is required").nullable().optional(),
    zip: z.string().min(1, "ZIP code is required").nullable().optional(),
    country: z.string().nullable().optional(),
    type: z.nativeEnum(AddressType).nullable().optional(),
    isDefault: z.boolean().nullable().optional(),
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

// For get: get all the address depends on the user id and type
export const getAddressBookSchema = z.object({
  userId: z.string().uuid({ message: "Invalid UUID format" }),
  type: z.nativeEnum(AddressType),
});

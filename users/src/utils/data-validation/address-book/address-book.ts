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
 * - county: Optional string for the county or district.
 * - type: Required enum value indicating the address type (SHIPPING or BILLING).
 * - isDefault: Required boolean indicating if this is the default address.
 */

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
}

// For create: all required except optional fields
export const createAddressBookEntrySchema = z.object({
  street: z.string().min(1, "Street is required"),
  houseNo: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  county: z.string().optional(),
  type: z.nativeEnum(AddressType),
  isDefault: z.boolean(),
});

// For update: allow partial updates, but require at least one field
export const updateAddressBookEntrySchema = z
  .object({
    id: z.string().uuid({ message: "Invalid UUID format" }),
    street: z.string().min(1, "Street is required").optional(),
    houseNo: z.string().optional(),
    city: z.string().min(1, "City is required").optional(),
    state: z.string().min(1, "State is required").optional(),
    zip: z.string().min(1, "ZIP code is required").optional(),
    county: z.string().optional(),
    type: z.nativeEnum(AddressType).optional(),
    isDefault: z.boolean().optional(),
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

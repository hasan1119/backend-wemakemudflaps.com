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

/**
 * Zod schema for validating the creation of a new address book entry.
 *
 * All required fields from the base schema must be provided, except for optional fields.
 *
 * @see addressBookBaseSchema
 */

/**
 * Zod schema for validating updates to an address book entry.
 *
 * Allows partial updates: any subset of fields from the base schema may be provided,
 * but at least one field must be present in the update payload.
 *
 * @see addressBookBaseSchema
 */
import { z } from "zod";

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
}

export const addressBookBaseSchema = z.object({
  street: z.string().min(1, "Street is required"),
  houseNo: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  county: z.string().optional(),
  type: z.nativeEnum(AddressType),
  isDefault: z.boolean(),
});

// For create: all required except optional fields
export const createAddressBookEntrySchema = addressBookBaseSchema;

// For update: allow partial updates, but require at least one field
export const updateAddressBookEntrySchema = addressBookBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

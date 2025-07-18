import { TaxOptions } from "../../../entities";
import { taxOptionsRepository } from "../repositories/repositories";

/**
 * Retrieves the current TaxOptions.
 *
 * Workflow:
 * 1. Fetches the first TaxOptions record from the database.
 * 2. Returns null if no records are found.
 *
 * @returns Promise resolving to TaxOptions or null if not found.
 */
export const getTaxOptions = async (): Promise<TaxOptions | null> => {
  const taxOptions = await taxOptionsRepository.find();
  return taxOptions[0] || null;
};

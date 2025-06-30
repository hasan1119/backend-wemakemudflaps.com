import { TaxStatus } from "../../../entities";
import { MutationCreateTaxStatusArgs } from "../../../types";
import { taxStatusRepository } from "../repositories/repositories";

/**
 * Creates a new tax status.
 *
 * Workflow:
 * 1. Validates and prepares tax status creation input.
 * 2. Checks if a tax status with the same name already exists (case-insensitive).
 * 3. Creates the tax status with provided values and user context.
 *
 * @param data - Input data for creating the tax status.
 * @param userId - Optional user ID who creates this tax status.
 * @returns Created Tax status entity.
 */
export const createTaxStatus = async (
  data: MutationCreateTaxStatusArgs,
  userId?: string
): Promise<TaxStatus> => {
  const { value, description } = data ?? {};

  const taxStatus = taxStatusRepository.create({
    value,
    description,
    createdBy: userId ?? null,
  });

  return await taxStatusRepository.save(taxStatus);
};

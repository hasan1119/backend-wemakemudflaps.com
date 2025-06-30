import { TaxClass } from "../../../entities";
import { MutationCreateTaxClassArgs } from "../../../types";
import { taxClassRepository } from "../repositories/repositories";

/**
 * Creates a new tax class.
 *
 * Workflow:
 * 1. Validates and prepares tax class creation input.
 * 2. Checks if a tax class with the same name already exists (case-insensitive).
 * 3. Creates the tax class with provided values and user context.
 *
 * @param data - Input data for creating the tax class.
 * @param userId - Optional user ID who creates this tax class.
 * @returns Created Tax class entity.
 */
export const createTaxClass = async (
  data: MutationCreateTaxClassArgs,
  userId?: string
): Promise<TaxClass> => {
  const { value, description } = data ?? {};

  const taxClass = taxClassRepository.create({
    value,
    description,
    createdBy: userId ?? null,
  });

  return await taxClassRepository.save(taxClass);
};

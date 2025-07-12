import { TaxRate } from "../../../entities";
import { MutationCreateTaxRateArgs } from "../../../types";
import { taxRateRepository } from "../repositories/repositories";

/**
 * Creates a new tax rate.
 *
 * Workflow:
 * 1. Validates and prepares tax rate creation input.
 * 2. Creates the tax rate with provided values and user context.
 *
 * @param data - Input data for creating the tax rate.
 * @param userId - Optional user ID who creates this tax rate.
 * @returns Created Tax rate entity.
 */
export const createTaxRate = async (
  data: MutationCreateTaxRateArgs,
  userId?: string
): Promise<TaxRate> => {
  const {
    country,
    state,
    city,
    postcode,
    rate,
    label,
    appliesToShipping,
    isCompound,
    priority,
  } = data ?? {};

  const taxRate = taxRateRepository.create({
    country,
    state,
    city,
    postcode,
    rate,
    label,
    appliesToShipping,
    isCompound,
    priority,
    createdBy: userId,
  });

  return await taxRateRepository.save(taxRate);
};

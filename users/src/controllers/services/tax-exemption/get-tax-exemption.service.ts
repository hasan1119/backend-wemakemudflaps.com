import { TaxExemption } from "../../../entities";
import { taxExemptionRepository } from "../repositories/repositories";

/**
 * Retrieves the tax exemption for a specific user.
 * Since each user can have only one tax exemption, this function fetches it based on the user's ID.
 *
 * @param userId - The ID of the user whose tax exemption is to be retrieved.
 * @returns A promise that resolves to the TaxExemption entity, or null if not found.
 */
export const getTaxExemptionByUserId = async (
  userId: string
): Promise<TaxExemption | null> => {
  return await taxExemptionRepository.findOne({
    where: { user: { id: userId } },
  });
};

/**
 * Retrieves a tax exemption entry by its unique ID.
 *
 * @param id - The unique ID of the tax exemption entry.
 * @returns A promise that resolves to the TaxExemption entity, or null if not found.
 */
export const getTaxExemptionById = async (
  id: string
): Promise<TaxExemption | null> => {
  return await taxExemptionRepository.findOne({
    where: {
      id: id,
    },
  });
};

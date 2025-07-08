import { TaxExemption } from "../../../entities";
import { MutationCreateTaxExemptionArgs } from "../../../types";
import { taxExemptionRepository } from "../repositories/repositories";

/**
 * Creates and saves a new tax exemption entry for a user.
 * Each user is allowed only one tax exemption. If one already exists, an error is thrown.
 *
 * @param data - The data for creating the new tax exemption entry.
 * @param userId - The ID of the user for whom the exemption is being created.
 * @returns A promise that resolves to the newly created TaxExemption entity.
 * @throws An error if a tax exemption already exists for the user.
 */
export const createTaxExemption = async (
  data: MutationCreateTaxExemptionArgs,
  userId: string
): Promise<TaxExemption> => {
  // Create the new tax exemption entry
  const taxExemptionEntry = taxExemptionRepository.create({
    ...data,
    user: { id: userId } as any,
  });

  const result = await taxExemptionRepository.save(taxExemptionEntry);

  // // Cache the new tax exemption info
  // await setTaxExemptionInfoByUserIdInRedis(userId, {
  //   ...result,
  //   createdAt:
  //     result.createdAt instanceof Date
  //       ? result.createdAt.toISOString()
  //       : result.createdAt,
  //   updatedAt:
  //     result.updatedAt instanceof Date
  //       ? result.updatedAt.toISOString()
  //       : result.updatedAt,
  // });

  return result;
};

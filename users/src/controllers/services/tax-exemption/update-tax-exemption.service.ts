import { TaxExemption } from "../../../entities";
import { MutationUpdateTaxExemptionArgs } from "../../../types";
import { taxExemptionRepository } from "../repositories/repositories";
import { getTaxExemptionById } from "./get-tax-exemption.service";

/**
 * Updates an existing tax exemption entry with new data.
 * The updated entry is then saved to the database and the Redis cache is updated.
 *
 * @param id - The ID of the tax exemption entry to update.
 * @param data - An object containing the fields to update.
 * @returns The updated TaxExemption entity, or null if the entry does not exist.
 */
export const updateTaxExemption = async (
  data: MutationUpdateTaxExemptionArgs
): Promise<TaxExemption | null> => {
  await taxExemptionRepository.update(
    { id: data.id },
    {
      taxNumber: data.taxNumber,
      assumptionReason: data.assumptionReason,
      taxCertificate: data.taxCertificate,
      expiryDate: data.expiryDate,
      status: data.status,
    }
  );
  // Update the cache in Redis
  // await setTaxExemptionInfoByUserIdInRedis(userId, {
  //   ...updatedExemption,
  //   createdAt:
  //     updatedExemption.createdAt instanceof Date
  //       ? updatedExemption.createdAt.toISOString()
  //       : updatedExemption.createdAt,
  //   updatedAt:
  //     updatedExemption.updatedAt instanceof Date
  //       ? updatedExemption.updatedAt.toISOString()
  //       : updatedExemption.updatedAt,
  // });

  return await getTaxExemptionById(data.id);
};

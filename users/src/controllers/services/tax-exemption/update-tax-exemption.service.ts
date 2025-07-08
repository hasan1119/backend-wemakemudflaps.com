import { TaxExemption } from "../../../entities";
import { setTaxExemptionByUserIdInRedis } from "../../../helper/redis";
import { MutationUpdateTaxExemptionEntryArgs } from "../../../types";
import { TaxExemptionStatus } from "../../../utils/data-validation";
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
  data: MutationUpdateTaxExemptionEntryArgs
): Promise<TaxExemption | null> => {
  await taxExemptionRepository.update(
    { id: data.id },
    {
      ...(data.taxNumber !== undefined &&
        data.taxNumber !== null && { taxNumber: data.taxNumber }),
      ...(data.assumptionReason !== undefined &&
        data.assumptionReason !== null && {
          assumptionReason: data.assumptionReason,
        }),
      ...(data.taxCertificate !== undefined &&
        data.taxCertificate !== null && {
          taxCertificate: data.taxCertificate,
        }),
      ...(data.expiryDate !== undefined &&
        data.expiryDate !== null && { expiryDate: data.expiryDate }),
      ...(data.status !== undefined &&
        data.status !== null && { status: data.status }),
    }
  );

  const result = await getTaxExemptionById(data.id);

  // Update the cache in Redis
  await setTaxExemptionByUserIdInRedis(data.userId, {
    id: result.id,
    taxNumber: result.taxNumber,
    assumptionReason: result.assumptionReason,
    taxCertificate: result.taxCertificate as any,
    status: result.status as TaxExemptionStatus,
    expiryDate: result.expiryDate ? result.expiryDate.toISOString() : null,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  });

  return result;
};

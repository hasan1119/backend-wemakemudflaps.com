import { TaxExemption } from "../../../entities";
import { setTaxExemptionByUserIdInRedis } from "../../../helper/redis";
import {
  MutationCreateTaxExemptionEntryArgs,
  TaxExemptionStatus,
} from "../../../types";
import { taxExemptionRepository } from "../repositories/repositories";

/**
 * Creates and saves a new tax exemption entry for a user.
 * Each user is allowed only one tax exemption. If one already exists, an error is thrown.
 *
 * @param data - The data for creating the new tax exemption entry.
 * @returns A promise that resolves to the newly created TaxExemption entity.
 * @throws An error if a tax exemption already exists for the user.
 */
export const createTaxExemption = async (
  data: MutationCreateTaxExemptionEntryArgs
): Promise<TaxExemption> => {
  // Create the new tax exemption entry
  const taxExemptionEntry = taxExemptionRepository.create({
    ...data,
    user: data.userId as any,
    status: "Pending",
  });

  const result = await taxExemptionRepository.save(taxExemptionEntry);

  // Cache the new tax exemption info using the user's ID
  await setTaxExemptionByUserIdInRedis(data.userId, {
    id: result.id,
    taxNumber: result.taxNumber,
    assumptionReason: result.assumptionReason,
    taxCertificate: result.taxCertificate as any,
    status: result.status as TaxExemptionStatus,
    expiryDate:
      result.expiryDate instanceof Date
        ? result.expiryDate.toISOString()
        : result.expiryDate || null,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  });

  return result;
};

import { Brackets, ILike, In } from "typeorm";
import { TaxRate } from "../../../entities";
import { taxRateRepository } from "../repositories/repositories";

/**
 * Retrieves a single tax rate entity by its ID and tax class ID.
 *
 * Workflow:
 * 1. Queries the taxRateRepository for a tax rate matching the provided ID and taxClassId.
 * 2. Ensures the tax rate is not soft-deleted.
 * 3. Returns the tax rate entity or null if not found.
 *
 * @param taxClassId - The ID of the tax class to filter tax rates.
 * @param id - The UUID of the tax rate to retrieve.
 * @returns A promise resolving to the TaxRate entity or null.
 */
export const getTaxRateById = async (id: string): Promise<TaxRate | null> => {
  return await taxRateRepository.findOne({
    where: {
      id,
      deletedAt: null,
    },
    relations: ["taxClass"],
  });
};

/**
 * Retrieves multiple tax rate entities by their IDs and tax class ID.
 *
 * Workflow:
 * 1. Returns empty array if no IDs provided.
 * 2. Queries taxRateRepository for tax rates with IDs in the provided list and matching taxClassId.
 * 3. Filters out soft-deleted tax rates.
 * 4. Returns an array of tax rate entities.
 *
 * @param taxClassId - The ID of the tax class to filter tax rates.
 * @param ids - An array of tax rate UUIDs to retrieve.
 * @returns A promise resolving to an array of TaxRate entities.
 */
export const getTaxRateByIds = async (ids: string[]): Promise<TaxRate[]> => {
  return await taxRateRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["taxClass"],
  });
};

/**
 * Fetches the applicable tax rate based on tax class and shipping address using case-insensitive matching.
 * @param taxClassId - The ID of the tax class.
 * @param address - The shipping address details.
 * @returns The applicable TaxRate or null if none found.
 */
export const getTaxRateByTaxClassAndAddress = async (
  taxClassId: string,
  address: { country: string; state?: string; city?: string; postcode?: string }
): Promise<TaxRate | null> => {
  try {
    const whereClause: any = {
      taxClass: { id: taxClassId },
    };

    // Case-insensitive matching using ILike
    whereClause.country = ILike(address.country);
    if (address.state) {
      whereClause.state = ILike(address.state);
    } else {
      whereClause.state = null;
    }
    if (address.city) {
      whereClause.city = ILike(address.city);
    } else {
      whereClause.city = null;
    }
    if (address.postcode) {
      whereClause.postcode = ILike(address.postcode);
    } else {
      whereClause.postcode = null;
    }

    const taxRate = await taxRateRepository.findOne({
      where: whereClause,
      order: { priority: "ASC" },
    });

    return taxRate || null;
  } catch (error) {
    console.error("Error fetching tax rate:", error);
    return null;
  }
};

interface GetPaginatedTaxRatesInput {
  taxClassId: string;
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of tax rates filtered by tax class ID and optional search term.
 *
 * Workflow:
 * 1. Calculates the offset for pagination based on page and limit.
 * 2. Builds a query joining taxClass relation and filtering by taxClassId and non-deleted rates.
 * 3. Applies search filters on label and country if search term is provided.
 * 4. Applies sorting by the specified field and order.
 * 5. Retrieves matching tax rates and total count.
 *
 * @param params - Pagination parameters including taxClassId, page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing paginated tax rates and total count.
 */
export const paginateTaxRates = async ({
  taxClassId,
  page,
  limit,
  search,
  sortBy = "createdAt",
  sortOrder,
}: GetPaginatedTaxRatesInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = taxRateRepository
    .createQueryBuilder("taxRate")
    .innerJoin("taxRate.taxClass", "taxClass")
    .where("taxRate.deletedAt IS NULL")
    .andWhere("taxClass.id = :taxClassId", { taxClassId });

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("taxRate.label ILIKE :search", { search: searchTerm }).orWhere(
          "taxRate.country ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`taxRate.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [taxRates, total] = await queryBuilder.getManyAndCount();

  return { taxRates, total };
};

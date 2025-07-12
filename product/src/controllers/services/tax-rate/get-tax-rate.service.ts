import { Brackets, ILike, In, Not } from "typeorm";
import { TaxRate } from "../../../entities";
import { taxRateRepository } from "../repositories/repositories";

/**
 * Finds a tax rate entity by its label (case-insensitive).
 *
 * @param label - The label of the tax rate to find.
 * @returns A promise resolving to the tax rate entity or null if not found.
 */
export const findTaxRateByLabel = async (
  label: string
): Promise<TaxRate | null> => {
  return await taxRateRepository.findOne({
    where: {
      label: ILike(label),
      deletedAt: null,
    },
  });
};

/**
 * Finds a tax rate entity by its label (case-insensitive) to update tax rate info.
 *
 * @param id - The UUID of the tax rate.
 * @param label - The label of the tax rate to find.
 * @returns A promise resolving to the tax rate entity or null if not found.
 */
export const findTaxRateByLabelToUpdate = async (
  id: string,
  label: string
): Promise<TaxRate | null> => {
  return await taxRateRepository.findOne({
    where: {
      id: Not(id),
      label: ILike(label),
      deletedAt: null,
    },
  });
};

/**
 * Retrieves a single tax rate entity by its ID.
 *
 * Workflow:
 * 1. Queries the taxRateRepository to find a tax rate that matches the provided ID.
 * 2. Returns the tax rate entity or null if not found.
 *
 * @param id - The UUID of the tax rate to retrieve.
 * @returns A promise that resolves to the tax rate entity, or null if no match is found.
 */
export const getTaxRateById = async (id: string): Promise<TaxRate | null> => {
  return await taxRateRepository.findOne({
    where: { id, deletedAt: null },
  });
};

/**
 * Retrieves multiple tax rate entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all tax rate IDs in the provided list.
 * 3. Filters out soft-deleted tax rates (deletedAt IS NULL).
 * 4. Returns an array of matching tax rate entities.
 *
 * @param ids - An array of tax rate UUIDs to retrieve.
 * @returns A promise resolving to an array of tax rate entities.
 */
export const getTaxRateByIds = async (ids: string[]): Promise<TaxRate[]> => {
  if (!ids.length) return [];

  return await taxRateRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
  });
};

interface GetPaginatedTaxRatesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of tax rates based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted tax rates and apply search conditions if provided.
 * 3. Queries the taxRateRepository to fetch tax rates with pagination, sorting, and filtering.
 * 4. Returns an object with the list of tax rates and the total count of matching tax rates.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated tax rates and total count.
 */
export const paginateTaxRates = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedTaxRatesInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = taxRateRepository
    .createQueryBuilder("taxRate")
    .where("taxRate.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("taxRate.label ILIKE :search", {
          search: searchTerm,
        }).orWhere("taxRate.country ILIKE :search", {
          search: searchTerm,
        });
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

/**
 * Handles counting tax rates matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted tax rates and apply search conditions if provided.
 * 2. Queries the taxRateRepository to count tax rates matching the criteria.
 * 3. Returns the total number of matching tax rates.
 *
 * @param search - Optional search term to filter by label or country (case-insensitive).
 * @returns A promise resolving to the total number of matching tax rates.
 */
export const countTaxRatesWithSearch = async (
  search?: string
): Promise<number> => {
  const queryBuilder = taxRateRepository
    .createQueryBuilder("taxRate")
    .where("taxRate.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("taxRate.label ILIKE :search", {
          search: searchTerm,
        }).orWhere("taxRate.country ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  return await queryBuilder.getCount();
};

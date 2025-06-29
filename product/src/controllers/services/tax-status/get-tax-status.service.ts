import { Brackets, ILike, In, Not } from "typeorm";
import { TaxStatus } from "../../../entities";
import { taxStatusRepository } from "../repositories/repositories";

/**
 * Counts the number of non-deleted products associated with a specific tax status.
 *
 * @param taxStatusId - The UUID of the tax status.
 * @returns A promise resolving to the number of linked, non-deleted products.
 */
export const countProductsForTaxStatus = async (
  taxStatusId: string
): Promise<number> => {
  const result = await taxStatusRepository
    .createQueryBuilder("taxStatus")
    .innerJoin("taxStatus.products", "product", "product.deletedAt IS NULL")
    .where("taxStatus.id = :taxStatusId", { taxStatusId })
    .andWhere("taxStatus.deletedAt IS NULL")
    .getCount();

  return result;
};

/**
 * Finds a tax status entity by its value (case-insensitive).
 *
 * @param value - The value of the tax status to find.
 * @returns A promise resolving to the tax status entity or null if not found.
 */
export const findTaxStatusByValue = async (
  value: string
): Promise<TaxStatus | null> => {
  return await taxStatusRepository.findOne({
    where: {
      value: ILike(value),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Finds a tax status entity by its value (case-insensitive) to update tax status info.
 *
 * @param id - The UUID of the tax status.
 * @param value - The value of the tax status to find.
 * @returns A promise resolving to the tax status entity or null if not found.
 */
export const findTaxStatusByValueToUpdate = async (
  id: string,
  value: string
): Promise<TaxStatus | null> => {
  return await taxStatusRepository.findOne({
    where: {
      id: Not(id),
      value: ILike(value),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Retrieves a single tax status entity by its ID.
 *
 * Workflow:
 * 1. Queries the taxStatusRepository to find a tax status that matches the provided ID.
 * 2. Includes the "products" relation to load associated products.
 * 3. Returns the tax status entity or null if not found.
 *
 * @param id - The UUID of the tax status to retrieve.
 * @returns A promise that resolves to the tax status entity, or null if no match is found.
 */
export const getTaxStatusById = async (
  id: string
): Promise<TaxStatus | null> => {
  return await taxStatusRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["products"],
  });
};

/**
 * Retrieves multiple tax status entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all tax status IDs in the provided list.
 * 3. Filters out soft-deleted tax statuses (deletedAt IS NULL).
 * 4. Includes the "products" relation for each taxStatus.
 * 5. Returns an array of matching tax status entities.
 *
 * @param ids - An array of tax status UUIDs to retrieve.
 * @returns A promise resolving to an array of tax status entities.
 */
export const getTaxStatusesByIds = async (
  ids: string[]
): Promise<TaxStatus[]> => {
  if (!ids.length) return [];

  return await taxStatusRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

interface GetPaginatedTaxStatusesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of tax statuses based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted tax statuses and apply search conditions if provided.
 * 3. Queries the taxStatusRepository to fetch tax statuses with pagination, sorting, and filtering.
 * 4. Includes the "products" relation.
 * 5. Returns an object with the list of tax statuses and the total count of matching tax statuses.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated tax statuses and total count.
 */
export const paginateTaxStatuses = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedTaxStatusesInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = taxStatusRepository
    .createQueryBuilder("taxStatus")
    .leftJoinAndSelect("taxStatus.products", "products")
    .where("taxStatus.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("taxStatus.value ILIKE :search", {
          search: searchTerm,
        }).orWhere("taxStatus.description ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`taxStatus.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [taxStatuses, total] = await queryBuilder.getManyAndCount();

  return { taxStatuses, total };
};

/**
 * Handles counting tax statuses matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted tax statuses and apply search conditions if provided.
 * 2. Queries the taxStatusRepository to count tax statuses matching the criteria.
 * 3. Returns the total number of matching tax statuses.
 *
 * @param search - Optional search term to filter by value or description (case-insensitive).
 * @returns A promise resolving to the total number of matching tax statuses.
 */
export const countTaxStatusesWithSearch = async (
  search?: string
): Promise<number> => {
  const queryBuilder = taxStatusRepository
    .createQueryBuilder("taxStatus")
    .where("taxStatus.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("taxStatus.value ILIKE :search", {
          search: searchTerm,
        }).orWhere("taxStatus.description ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  return await queryBuilder.getCount();
};

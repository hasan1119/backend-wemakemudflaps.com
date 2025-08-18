import { Brackets, ILike, In, Not } from "typeorm";
import { TaxClass } from "../../../entities";
import { taxClassRepository } from "../repositories/repositories";

/**
 * Counts the number of non-deleted products associated with a specific tax class.
 *
 * @param taxClassId - The UUID of the tax class.
 * @returns A promise resolving to the number of linked, non-deleted products.
 */
export const countProductsForTaxClass = async (
  taxClassId: string
): Promise<number> => {
  const result = await taxClassRepository
    .createQueryBuilder("taxClass")
    .innerJoin("taxClass.products", "product", "product.deletedAt IS NULL")
    .where("taxClass.id = :taxClassId", { taxClassId })
    .andWhere("taxClass.deletedAt IS NULL")
    .getCount();

  return result;
};

/**
 * Finds a tax class entity by its value (case-insensitive).
 *
 * @param value - The value of the tax class to find.
 * @returns A promise resolving to the tax class entity or null if not found.
 */
export const findTaxClassByValue = async (
  value: string
): Promise<TaxClass | null> => {
  return await taxClassRepository.findOne({
    where: {
      value: ILike(value),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Finds a tax class entity by its value (case-insensitive) to update tax class info.
 *
 * @param id - The UUID of the tax class.
 * @param value - The value of the tax class to find.
 * @returns A promise resolving to the tax class entity or null if not found.
 */
export const findTaxClassByValueToUpdate = async (
  id: string,
  value: string
): Promise<TaxClass | null> => {
  return await taxClassRepository.findOne({
    where: {
      id: Not(id),
      value: ILike(value),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Retrieves a single tax class entity by its ID.
 *
 * Workflow:
 * 1. Queries the taxClassRepository to find a tax class that matches the provided ID.
 * 2. Includes the "products" relation to load associated products.
 * 3. Returns the tax class entity or null if not found.
 *
 * @param id - The UUID of the tax class to retrieve.
 * @returns A promise that resolves to the tax class entity, or null if no match is found.
 */
export const getTaxClassById = async (id: string): Promise<TaxClass | null> => {
  return await taxClassRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["products"],
  });
};

/**
 * Retrieves multiple tax class entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all tax class IDs in the provided list.
 * 3. Filters out soft-deleted tax classes (deletedAt IS NULL).
 * 4. Includes the "products" relation for each taxClass.
 * 5. Returns an array of matching tax class entities.
 *
 * @param ids - An array of tax class UUIDs to retrieve.
 * @returns A promise resolving to an array of tax class entities.
 */
export const getTaxClassByIds = async (ids: string[]): Promise<TaxClass[]> => {
  if (!ids.length) return [];

  return await taxClassRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

interface GetPaginatedTaxClassesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of tax classes based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted tax classes and apply search conditions if provided.
 * 3. Queries the taxClassRepository to fetch tax classes with pagination, sorting, and filtering.
 * 4. Includes the "products" relation.
 * 5. Returns an object with the list of tax classes and the total count of matching tax classes.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated tax classes and total count.
 */
export const paginateTaxClasses = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedTaxClassesInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = taxClassRepository
    .createQueryBuilder("taxClass")
    .leftJoinAndSelect("taxClass.products", "products")
    .where("taxClass.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("taxClass.value ILIKE :search", {
          search: searchTerm,
        }).orWhere("taxClass.description ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`taxClass.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [taxClasses, total] = await queryBuilder.getManyAndCount();

  return { taxClasses, total };
};

import { Brackets, ILike, In, Not } from "typeorm";
import { ShippingClass } from "../../../entities";
import { shippingClassRepository } from "../repositories/repositories";

/**
 * Counts the number of non-deleted products associated with a specific shipping class.
 *
 * @param shippingClassId - The UUID of the shipping class.
 * @returns A promise resolving to the number of linked, non-deleted products.
 */
export const countProductsForShippingClass = async (
  shippingClassId: string
): Promise<number> => {
  const result = await shippingClassRepository
    .createQueryBuilder("shippingClass")
    .innerJoin("shippingClass.products", "product", "product.deletedAt IS NULL")
    .where("shippingClass.id = :shippingClassId", { shippingClassId })
    .andWhere("shippingClass.deletedAt IS NULL")
    .getCount();

  return result;
};

/**
 * Finds a shipping class entity by its value (case-insensitive).
 *
 * @param value - The value of the shipping class to find.
 * @returns A promise resolving to the shipping class entity or null if not found.
 */
export const findShippingClassByValue = async (
  value: string
): Promise<ShippingClass | null> => {
  return await shippingClassRepository.findOne({
    where: {
      value: ILike(value),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Finds a shipping class entity by its value (case-insensitive) to update shipping class info.
 *
 * @param id - The UUID of the shipping class.
 * @param value - The value of the shipping class to find.
 * @returns A promise resolving to the shipping class entity or null if not found.
 */
export const findShippingClassByValueToUpdate = async (
  id: string,
  value: string
): Promise<ShippingClass | null> => {
  return await shippingClassRepository.findOne({
    where: {
      id: Not(id),
      value: ILike(value),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Retrieves a single shipping class entity by its ID.
 *
 * Workflow:
 * 1. Queries the shippingClassRepository to find a shipping class that matches the provided ID.
 * 2. Includes the "products" relation to load associated products.
 * 3. Returns the shipping class entity or null if not found.
 *
 * @param id - The UUID of the shipping class to retrieve.
 * @returns A promise that resolves to the shipping class entity, or null if no match is found.
 */
export const getShippingClassById = async (
  id: string
): Promise<ShippingClass | null> => {
  return await shippingClassRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["products"],
  });
};

/**
 * Retrieves multiple shipping class entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all shipping class IDs in the provided list.
 * 3. Filters out soft-deleted shipping classes (deletedAt IS NULL).
 * 4. Includes the "products" relation for each shippingClass.
 * 5. Returns an array of matching shipping class entities.
 *
 * @param ids - An array of shipping class UUIDs to retrieve.
 * @returns A promise resolving to an array of shipping class entities.
 */
export const getShippingClassesByIds = async (
  ids: string[]
): Promise<ShippingClass[]> => {
  if (!ids.length) return [];

  return await shippingClassRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

interface GetPaginatedShippingClassesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of shipping classes based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted shipping classes and apply search conditions if provided.
 * 3. Queries the shippingClassRepository to fetch shipping classes with pagination, sorting, and filtering.
 * 4. Includes the "products" relation.
 * 5. Returns an object with the list of shipping classes and the total count of matching shipping classes.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated shipping classes and total count.
 */
export const paginateShippingClasses = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedShippingClassesInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = shippingClassRepository
    .createQueryBuilder("shippingClass")
    .leftJoinAndSelect("shippingClass.products", "products")
    .where("shippingClass.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("shippingClass.value ILIKE :search", {
          search: searchTerm,
        }).orWhere("shippingClass.description ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(
      `shippingClass.${sortBy}`,
      sortOrder.toUpperCase() as "ASC" | "DESC"
    );

  const [shippingClasses, total] = await queryBuilder.getManyAndCount();

  return { shippingClasses, total };
};

/**
 * Handles counting shipping classes matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted shipping classes and apply search conditions if provided.
 * 2. Queries the shippingClassRepository to count shipping classes matching the criteria.
 * 3. Returns the total number of matching shipping classes.
 *
 * @param search - Optional search term to filter by value or description (case-insensitive).
 * @returns A promise resolving to the total number of matching shipping classes.
 */
export const countShippingClassesWithSearch = async (
  search?: string
): Promise<number> => {
  const queryBuilder = shippingClassRepository
    .createQueryBuilder("shippingClass")
    .where("shippingClass.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("shippingClass.value ILIKE :search", {
          search: searchTerm,
        }).orWhere("shippingClass.description ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  return await queryBuilder.getCount();
};

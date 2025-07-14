import { Brackets, In } from "typeorm";
import { ShippingMethod } from "../../../entities";
import { shippingMethodRepository } from "../repositories/repositories";

/**
 * Retrieves a single shipping method entity by its ID.
 *
 * @param id - The UUID of the shipping method to retrieve.
 * @returns A promise that resolves to the shipping method entity, or null if no match is found.
 */
export const getShippingMethodById = async (
  id: string
): Promise<ShippingMethod | null> => {
  return await shippingMethodRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["flatRate", "freeShipping", "localPickUp", "ups"],
  });
};

/**
 * Retrieves multiple shipping method entities by their IDs.
 *
 * @param ids - An array of shipping method UUIDs to retrieve.
 * @returns A promise resolving to an array of shipping method entities.
 */
export const getShippingMethodsByIds = async (
  ids: string[]
): Promise<ShippingMethod[]> => {
  if (!ids.length) return [];

  return await shippingMethodRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["flatRate", "freeShipping", "localPickUp", "ups"],
  });
};

interface GetPaginatedShippingMethodsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of shipping methods based on provided parameters.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated shipping methods and total count.
 */
export const paginateShippingMethods = async ({
  page,
  limit,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetPaginatedShippingMethodsInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = shippingMethodRepository
    .createQueryBuilder("shippingMethod")
    .leftJoinAndSelect("shippingMethod.flatRate", "flatRate")
    .leftJoinAndSelect("shippingMethod.freeShipping", "freeShipping")
    .leftJoinAndSelect("shippingMethod.localPickUp", "localPickUp")
    .leftJoinAndSelect("shippingMethod.ups", "ups")
    .where("shippingMethod.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("shippingMethod.title ILIKE :search", {
          search: searchTerm,
        }).orWhere("shippingMethod.description ILIKE :search", {
          search: searchTerm,
        });
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(
      `shippingMethod.${sortBy}`,
      sortOrder.toUpperCase() as "ASC" | "DESC"
    );

  const [shippingMethods, total] = await queryBuilder.getManyAndCount();

  return { shippingMethods, total };
};

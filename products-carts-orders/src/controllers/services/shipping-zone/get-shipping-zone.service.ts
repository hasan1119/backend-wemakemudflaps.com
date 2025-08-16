import { Brackets, In } from "typeorm";
import { ShippingZone } from "../../../entities";
import { shippingZoneRepository } from "../repositories/repositories";

/**
 * Retrieves a shipping zone by its ID, along with all related shipping methods and their details.
 *
 * Workflow:
 * 1. Uses the shippingZoneRepository to find a shipping zone by its ID.
 * 2. Retrieves all related shipping methods and their details.
 *
 * @param id - The UUID of the shipping zone.
 * @returns The ShippingZone entity with full nested relations or null if not found.
 */
export async function getShippingZoneById(
  id: string
): Promise<ShippingZone | null> {
  return shippingZoneRepository.findOne({
    where: { id, deletedAt: null },
    relations: [
      "shippingMethods",
      "shippingMethods.flatRate",
      "shippingMethods.flatRate.costs",
      "shippingMethods.flatRate.costs.shippingClass",
      "shippingMethods.freeShipping",
      "shippingMethods.localPickUp",
      "shippingMethods.ups",
    ],
  });
}

/**
 * Retrieves multiple shipping zones by their IDs.
 *
 * Workflow:
 * 1. Uses the shippingZoneRepository to find shipping zones by their IDs.
 * 2. Fetches all related shipping methods and their details.
 *
 * @param ids - An array of UUIDs for the shipping zones.
 * @returns An array of ShippingZone entities or an empty array if none found.
 */
export async function getShippingZonesByIds(
  ids: string[]
): Promise<ShippingZone[]> {
  if (!ids.length) return [];
  return shippingZoneRepository.find({
    where: { id: In(ids), deletedAt: null },
    relations: [
      "shippingMethods",
      "shippingMethods.flatRate",
      "shippingMethods.flatRate.costs",
      "shippingMethods.flatRate.costs.shippingClass",
      "shippingMethods.freeShipping",
      "shippingMethods.localPickUp",
      "shippingMethods.ups",
    ],
  });
}

/**
 * Handles fetching paginated shipping zones with optional search and sorting.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted shipping zones and apply search conditions if provided.
 * 3. Sets sorting order for shipping zones or other fields.
 * 4. Queries the shippingZoneRepository to fetch shipping zones with pagination, sorting, and relations (roles, permissions).
 * 5. Selects specific fields for efficiency.
 * 6. Returns an object with the paginated shipping zones and total count.
 *
 * @param input - Input parameters including page, limit, search, sortBy, and sortOrder.
 * @returns A promise resolving to an object containing the paginated shipping zones and total count.
 */

interface GetPaginatedShippingZonesInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

export const paginateShippingZones = async ({
  page,
  limit,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}: GetPaginatedShippingZonesInput) => {
  const queryBuilder =
    shippingZoneRepository.createQueryBuilder("shippingZone");

  // Add relations
  queryBuilder
    .leftJoinAndSelect("shippingZone.shippingMethods", "shippingMethods")
    .leftJoinAndSelect("shippingMethods.flatRate", "flatRate")
    .leftJoinAndSelect("flatRate.costs", "flatRateCosts")
    .leftJoinAndSelect("flatRateCosts.shippingClass", "shippingClass")
    .leftJoinAndSelect("shippingMethods.freeShipping", "freeShipping")
    .leftJoinAndSelect("shippingMethods.localPickUp", "localPickUp")
    .leftJoinAndSelect("shippingMethods.ups", "ups");

  if (search) {
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where("shippingZone.name ILIKE :search", { search: `%${search}%` })
          .orWhere(":search ILIKE ANY (shippingZone.regions)", {
            search: `%${search}%`,
          })
          .orWhere(":search ILIKE ANY (shippingZone.zipCodes)", {
            search: `%${search}%`,
          });
      })
    );
  }

  queryBuilder.andWhere("shippingZone.deletedAt IS NULL");

  queryBuilder.orderBy(
    `shippingZone.${sortBy}`,
    sortOrder.toUpperCase() as "ASC" | "DESC"
  );

  const [shippingZones, total] = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    shippingZones,
    total,
  };
};

import { Brackets, ILike, In, Not } from "typeorm";
import { Coupon } from "../../../entities";
import { couponRepository } from "../repositories/repositories";

/**
 * Retrieves a Coupon entity by its ID.
 *
 * @param id - The UUID of the coupon to retrieve.
 * @returns A promise resolving to the Coupon entity or null if not found.
 */
export const getCouponById = async (id: string): Promise<Coupon | null> => {
  const coupon = await couponRepository.findOne({
    where: { id, deletedAt: null },
    relations: [
      "applicableProducts",
      "excludedProducts",
      "applicableCategories",
      "excludedCategories",
    ],
  });

  return coupon;
};

/**
 * Retrieves multiple Coupon entities by their IDs.
 *
 * @param ids - An array of UUIDs for the coupons to retrieve.
 * @returns A promise resolving to an array of Coupon entities.
 */
export const getCouponsByIds = async (ids: string[]): Promise<Coupon[]> => {
  return await couponRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: [
      "applicableProducts",
      "excludedProducts",
      "applicableCategories",
      "excludedCategories",
    ],
  });
};

/**
 * Finds a Coupon entity by its code.
 *
 * @param code - The code of the coupon to find.
 * @returns A promise resolving to the Coupon entity or null if not found.
 */
export const findCouponByCode = async (
  code: string
): Promise<Coupon | null> => {
  return await couponRepository.findOne({
    where: {
      code: ILike(code),
      deletedAt: null,
    },
    relations: [
      "applicableProducts",
      "excludedProducts",
      "applicableCategories",
      "excludedCategories",
    ],
  });
};

/**
 * Finds multiple Coupon entities by their codes.
 *
 * @param codes - An array of coupon codes to find.
 * @returns A promise resolving to an array of Coupon entities.
 */
export const findCouponsByCodes = async (
  codes: string[]
): Promise<Coupon[]> => {
  return await couponRepository.find({
    where: {
      code: In(codes),
      deletedAt: null,
    },
    relations: [
      "applicableProducts",
      "excludedProducts",
      "applicableCategories",
      "excludedCategories",
    ],
  });
};

/**
 * Finds a Coupon entity by its code, excluding a specific ID.
 *
 * @param id - The UUID of the coupon to exclude.
 * @param code - The code of the coupon to find.
 * @returns A promise resolving to the Coupon entity or null if not found.
 */
export const findCouponByCodeToUpdate = async (
  id: string,
  code: string
): Promise<Coupon | null> => {
  return await couponRepository.findOne({
    where: {
      id: Not(id),
      code: ILike(code),
      deletedAt: null,
    },
    relations: [
      "applicableProducts",
      "excludedProducts",
      "applicableCategories",
      "excludedCategories",
    ],
  });
};

/**
 * Counts the number of times a coupon has been used.
 *
 * @param couponId - The UUID of the coupon to count usages for.
 * @returns A promise resolving to the usage count of the coupon.
 */
export const countCouponUsages = async (couponId: string): Promise<number> => {
  const coupon = await couponRepository.findOne({
    where: { id: couponId, deletedAt: null },
    select: ["usageCount"],
  });

  return coupon?.usageCount ?? 0;
};

interface GetPaginatedCouponsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of coupons based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted coupons and apply search conditions if provided.
 * 3. Queries the couponRepository to fetch coupons with pagination, sorting, and filtering.
 * 4. Includes the "products" relation.
 * 5. Returns an object with the list of coupons and the total count of matching coupons.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated coupons and total count.
 */
export const paginateCoupons = async ({
  page,
  limit,
  search,
  sortBy = "createdAt",
  sortOrder,
}: GetPaginatedCouponsInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = couponRepository
    .createQueryBuilder("coupon")
    .leftJoinAndSelect("coupon.applicableProducts", "applicableProducts")
    .leftJoinAndSelect("coupon.excludedProducts", "excludedProducts")
    .leftJoinAndSelect("coupon.applicableCategories", "applicableCategories")
    .leftJoinAndSelect("coupon.excludedCategories", "excludedCategories")
    .where("coupon.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("coupon.code ILIKE :search", { search: searchTerm }).orWhere(
          "coupon.description ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`coupon.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [coupons, total] = await queryBuilder.getManyAndCount();

  return { coupons, total };
};

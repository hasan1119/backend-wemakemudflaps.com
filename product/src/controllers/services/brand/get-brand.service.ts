import { Brackets, ILike, In, Not } from "typeorm";
import { Brand } from "../../../entities";
import { brandRepository } from "../repositories/repositories";

/**
 * Counts the number of non-deleted products associated with a specific brand.
 *
 * @param brandId - The UUID of the brand.
 * @returns A promise resolving to the number of linked, non-deleted products.
 */
export const countProductsForBrand = async (
  brandId: string
): Promise<number> => {
  const result = await brandRepository
    .createQueryBuilder("brand")
    .innerJoin("brand.products", "product", "product.deletedAt IS NULL")
    .where("brand.id = :brandId", { brandId })
    .andWhere("brand.deletedAt IS NULL")
    .getCount();

  return result;
};

/**
 * Finds a Brand entity by its name (case-insensitive).
 *
 * @param name - The name of the brand to find.
 * @returns A promise resolving to the Brand entity or null if not found.
 */
export const findBrandByName = async (name: string): Promise<Brand | null> => {
  return await brandRepository.findOne({
    where: {
      name: ILike(name),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Finds a Brand entity by its slug (case-insensitive).
 *
 * @param slug - The slug of the brand to find.
 * @returns A promise resolving to the Brand entity or null if not found.
 */
export const findBrandBySlug = async (slug: string): Promise<Brand | null> => {
  return await brandRepository.findOne({
    where: {
      slug: ILike(slug),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Finds a Brand entity by its name (case-insensitive) to update brand info.
 *
 * @param id - The UUID of the brand.
 * @param name - The name of the brand to find.
 * @returns A promise resolving to the Brand entity or null if not found.
 */
export const findBrandByNameToUpdate = async (
  id: string,
  name: string
): Promise<Brand | null> => {
  return await brandRepository.findOne({
    where: {
      id: Not(id),
      name: ILike(name),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Finds a Brand entity by its slug (case-insensitive) to update brand info.
 *
 * @param id - The UUID of the brand.
 * @param slug - The slug of the brand to find.
 * @returns A promise resolving to the Brand entity or null if not found.
 */
export const findBrandBySlugToUpdate = async (
  id: string,
  slug: string
): Promise<Brand | null> => {
  return await brandRepository.findOne({
    where: {
      id: Not(id),
      slug: ILike(slug),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

/**
 * Retrieves a single Brand entity by its ID.
 *
 * Workflow:
 * 1. Queries the brandRepository to find a brand that matches the provided ID.
 * 2. Includes the "products" relation to load associated products.
 * 3. Returns the Brand entity or null if not found.
 *
 * @param id - The UUID of the brand to retrieve.
 * @returns A promise that resolves to the Brand entity, or null if no match is found.
 */
export const getBrandById = async (id: string): Promise<Brand | null> => {
  return await brandRepository.findOne({
    where: { id, deletedAt: null },
    relations: ["products"],
  });
};

/**
 * Retrieves multiple Brand entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all brand IDs in the provided list.
 * 3. Filters out soft-deleted brands (deletedAt IS NULL).
 * 4. Includes the "products" relation for each brand.
 * 5. Returns an array of matching Brand entities.
 *
 * @param ids - An array of brand UUIDs to retrieve.
 * @returns A promise resolving to an array of Brand entities.
 */
export const getBrandsByIds = async (ids: string[]): Promise<Brand[]> => {
  if (!ids.length) return [];

  return await brandRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
    relations: ["products"],
  });
};

interface GetPaginatedBrandsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of brands based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted brands and apply search conditions if provided.
 * 3. Queries the brandRepository to fetch brands with pagination, sorting, and filtering.
 * 4. Includes the "products" relation.
 * 5. Returns an object with the list of brands and the total count of matching brands.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated brands and total count.
 */
export const paginateBrands = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedBrandsInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = brandRepository
    .createQueryBuilder("brand")
    .leftJoinAndSelect("brand.products", "products")
    .where("brand.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("brand.name ILIKE :search", { search: searchTerm }).orWhere(
          "brand.slug ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`brand.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [brands, total] = await queryBuilder.getManyAndCount();

  return { brands, total };
};

/**
 * Handles counting brands matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted brands and apply search conditions if provided.
 * 2. Queries the brandRepository to count brands matching the criteria.
 * 3. Returns the total number of matching brands.
 *
 * @param search - Optional search term to filter by name or slug (case-insensitive).
 * @returns A promise resolving to the total number of matching brands.
 */
export const countBrandsWithSearch = async (
  search?: string
): Promise<number> => {
  const queryBuilder = brandRepository
    .createQueryBuilder("brand")
    .where("brand.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("brand.name ILIKE :search", { search: searchTerm }).orWhere(
          "brand.slug ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  return await queryBuilder.getCount();
};

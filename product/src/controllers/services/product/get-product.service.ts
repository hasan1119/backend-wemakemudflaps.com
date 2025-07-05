import { Brackets, ILike, In, Not } from "typeorm";
import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";

/**
 * Finds a Product entity by its name (case-insensitive).
 *
 * @param name - The name of the product to find.
 * @returns A promise resolving to the Product entity or null if not found.
 */
export const findProductByName = async (
  name: string
): Promise<Product | null> => {
  return await productRepository.findOne({
    where: {
      name: ILike(name),
      deletedAt: null,
    },
  });
};

/**
 * Finds a Product entity by its slug (case-insensitive).
 *
 * @param slug - The slug of the product to find.
 * @returns A promise resolving to the Product entity or null if not found.
 */
export const findProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  return await productRepository.findOne({
    where: {
      slug: ILike(slug),
      deletedAt: null,
    },
  });
};

/**
 * Finds a Product entity by its name (case-insensitive) to update product info.
 *
 * @param id - The UUID of the product.
 * @param name - The name of the product to find.
 * @returns A promise resolving to the Product entity or null if not found.
 */
export const findProductByNameToUpdate = async (
  id: string,
  name: string
): Promise<Product | null> => {
  return await productRepository.findOne({
    where: {
      id: Not(id),
      name: ILike(name),
      deletedAt: null,
    },
  });
};

/**
 * Finds a Product entity by its slug (case-insensitive) to update product info.
 *
 * @param id - The UUID of the product.
 * @param slug - The slug of the product to find.
 * @returns A promise resolving to the Product entity or null if not found.
 */
export const findProductBySlugToUpdate = async (
  id: string,
  slug: string
): Promise<Product | null> => {
  return await productRepository.findOne({
    where: {
      id: Not(id),
      slug: ILike(slug),
      deletedAt: null,
    },
  });
};

/**
 * Retrieves a single Product entity by its ID.
 *
 * Workflow:
 * 1. Queries the productRepository to find a product that matches the provided ID.
 * 2. Returns the Product entity or null if not found.
 *
 * @param id - The UUID of the product to retrieve.
 * @returns A promise that resolves to the Product entity, or null if no match is found.
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  return await productRepository.findOne({
    where: { id, deletedAt: null },
  });
};

/**
 * Retrieves multiple Product entities by their IDs.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all product IDs in the provided list.
 * 3. Filters out soft-deleted products (deletedAt IS NULL).
 * 4. Returns an array of matching Product entities.
 *
 * @param ids - An array of product UUIDs to retrieve.
 * @returns A promise resolving to an array of Product entities.
 */
export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
  return await productRepository.find({
    where: {
      id: In(ids),
      deletedAt: null,
    },
  });
};

interface GetPaginatedProductsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
}

/**
 * Handles pagination of products based on provided parameters.
 *
 * Workflow:
 * 1. Calculates the number of records to skip based on page and limit.
 * 2. Constructs a where clause to filter non-deleted products and apply search conditions if provided.
 * 3. Queries the productRepository to fetch products with pagination, sorting, and filtering.
 * 4. Returns an object with the list of products and the total count of matching products.
 *
 * @param params - Pagination parameters including page, limit, search, sortBy, sortOrder.
 * @returns A promise resolving to an object containing the paginated products and total count.
 */
export const paginateProducts = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: GetPaginatedProductsInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.deletedAt IS NULL")
    // Relations eager loading via left joins
    .leftJoinAndSelect("product.brands", "brands")
    .leftJoinAndSelect("product.tags", "tags")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.subCategories", "subCategories")
    .leftJoinAndSelect("product.attributes", "attributes")
    .leftJoinAndSelect("product.variations", "variations")
    .leftJoinAndSelect("product.shippingClass", "shippingClass")
    .leftJoinAndSelect("product.upsells", "upsells")
    .leftJoinAndSelect("product.crossSells", "crossSells")
    .leftJoinAndSelect("product.reviews", "reviews")
    .leftJoinAndSelect("product.taxStatus", "taxStatus")
    .leftJoinAndSelect("product.taxClass", "taxClass")
    .leftJoinAndSelect("product.tierPricingInfo", "tierPricingInfo")

    .leftJoinAndSelect("variation.brand", "brand")
    .leftJoinAndSelect("variation.tierPricingInfo", "tierPricingInfo")
    .leftJoinAndSelect("tierPricingInfo.tieredPrices", "tieredPrices")

    .leftJoinAndSelect("variation.product", "product")
    .leftJoinAndSelect("variation.attributeValues", "attributeValues")
    .leftJoinAndSelect("attributeValues.attribute", "attribute")

    .leftJoinAndSelect("variation.shippingClass", "shippingClass")
    .leftJoinAndSelect("variation.taxStatus", "taxStatus")
    .leftJoinAndSelect("variation.taxClass", "taxClass");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("product.name ILIKE :search", { search: searchTerm }).orWhere(
          "product.slug ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [products, total] = await queryBuilder.getManyAndCount();

  return { products, total };
};

/**
 * Handles counting products matching optional search criteria.
 *
 * Workflow:
 * 1. Constructs a where clause to filter non-deleted products and apply search conditions if provided.
 * 2. Queries the productRepository to count products matching the criteria.
 * 3. Returns the total number of matching products.
 *
 * @param search - Optional search term to filter by name or slug (case-insensitive).
 * @returns A promise resolving to the total number of matching products.
 */
export const countProductsWithSearch = async (
  search?: string
): Promise<number> => {
  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.deletedAt IS NULL");

  if (search) {
    const searchTerm = `%${search.trim()}%`;
    queryBuilder.andWhere(
      new Brackets((qb) => {
        qb.where("product.name ILIKE :search", { search: searchTerm }).orWhere(
          "product.slug ILIKE :search",
          { search: searchTerm }
        );
      })
    );
  }

  return await queryBuilder.getCount();
};

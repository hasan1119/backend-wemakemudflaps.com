import { Brackets, ILike, Not, SelectQueryBuilder } from "typeorm";
import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";

interface QueryBuilderOptions {
  includeDeletedProducts?: boolean;
  customerView?: boolean;
}

/**
 * Creates a base query builder with all product relations and proper soft delete filtering.
 * This function eliminates code duplication across all product query functions.
 *
 * @param options - Configuration options for the query builder
 * @returns A configured QueryBuilder instance with all relations loaded
 */
const createProductQueryBuilder = (
  options: QueryBuilderOptions = {}
): SelectQueryBuilder<Product> => {
  const { includeDeletedProducts = false, customerView = false } = options;

  let baseWhere = "product.deletedAt IS NULL";
  if (customerView) {
    baseWhere += " AND product.isVisible = :isVisible";
  }
  if (includeDeletedProducts) {
    baseWhere = "1=1"; // No deletion filter
  }

  const attributeCondition = customerView
    ? "attributes.deletedAt IS NULL AND attributes.visible = true"
    : "attributes.deletedAt IS NULL";

  const variationCondition = customerView
    ? "variations.deletedAt IS NULL AND variations.isActive = true"
    : "variations.deletedAt IS NULL";

  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect("product.attributes", "attributes", attributeCondition)
    .leftJoinAndSelect(
      "attributes.systemAttributeRef",
      "attribute_systemAttribute",
      "attribute_systemAttribute.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attributes.copiedAttributes",
      "attribute_copiedAttributes",
      "attribute_copiedAttributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attributes.values",
      "attribute_values",
      "attribute_values.deletedAt IS NULL"
    )
    .leftJoinAndSelect("product.variations", "variations", variationCondition)
    .leftJoinAndSelect(
      "product.shippingClass",
      "shippingClass",
      "shippingClass.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.upsells",
      "upsells",
      "upsells.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.crossSells",
      "crossSells",
      "crossSells.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.reviews",
      "reviews",
      "reviews.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.taxClass",
      "taxClass",
      "taxClass.deletedAt IS NULL"
    )
    .leftJoinAndSelect("product.tierPricingInfo", "tierPricingInfo")
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    .addOrderBy("tieredPrices.maxQuantity", "ASC")
    .leftJoinAndSelect(
      "variations.brands",
      "variation_brands",
      "variation_brands.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variations.tierPricingInfo",
      "variation_tierPricingInfo"
    )
    .leftJoinAndSelect(
      "variation_tierPricingInfo.tieredPrices",
      "variation_tieredPrices"
    )
    .addOrderBy("variation_tieredPrices.maxQuantity", "ASC")
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attributeValue",
      "variation_attributeValue",
      "variation_attributeValue.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variations.shippingClass",
      "variation_shippingClass",
      "variation_shippingClass.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variations.taxClass",
      "variation_taxClass",
      "variation_taxClass.deletedAt IS NULL"
    );

  if (customerView) {
    queryBuilder.where(baseWhere, { isVisible: true });
  } else if (!includeDeletedProducts) {
    queryBuilder.where(baseWhere);
  }

  return queryBuilder;
};

/**
 * Retrieves a single Product entity by its slug (case-insensitive).
 *
 * Workflow:
 * 1. Uses QueryBuilder to find a product that matches the provided slug.
 * 2. Includes all relations with soft delete filtering.
 * 3. Returns the Product entity or null if not found.
 *
 * @param slug - The slug of the product to retrieve.
 * @returns A promise that resolves to the Product entity, or null if no match is found.
 */
export const findProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  const queryBuilder = createProductQueryBuilder({
    customerView: true,
  }).andWhere("product.slug ILIKE :slug", { slug });

  return await queryBuilder.getOne();
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
  const queryBuilder = createProductQueryBuilder().andWhere(
    "product.id = :id",
    { id }
  );

  return await queryBuilder.getOne();
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
  const queryBuilder = createProductQueryBuilder().andWhere(
    "product.id IN (:...ids)",
    { ids }
  );

  return await queryBuilder.getMany();
};

/**
 * Retrieves multiple Product entities by their IDs, including soft-deleted products.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Uses `In` operator to match all product IDs in the provided list.
 * 3. Returns an array of matching Product entities, including those that are soft-deleted.
 *
 * @param ids - An array of product UUIDs to retrieve.
 * @returns A promise resolving to an array of Product entities.
 */
export const getProductsByIdsToDelete = async (
  ids: string[]
): Promise<Product[]> => {
  const queryBuilder = createProductQueryBuilder({
    includeDeletedProducts: true,
  }).andWhere("product.id IN (:...ids)", { ids });

  return await queryBuilder.getMany();
};

interface GetPaginatedProductsInput {
  page: number;
  limit: number;
  search?: string | null;
  sortBy?: string | null;
  sortOrder: "asc" | "desc";
  filtering?: Record<string, any>;
}

/**
 * Applies filtering logic to a query builder.
 * This function eliminates code duplication for filtering in pagination functions.
 *
 * @param queryBuilder - The query builder to apply filters to
 * @param filtering - The filtering object containing filter criteria
 */
const applyFiltering = (
  queryBuilder: SelectQueryBuilder<Product>,
  filtering: Record<string, any>
): void => {
  if (!filtering) return;

  const { brandIds, categoryIds, tagIds, productDeliveryTypes } = filtering;

  if (brandIds?.length) {
    queryBuilder.andWhere("brands.id IN (:...brandIds)", { brandIds });
  }
  if (categoryIds?.length) {
    queryBuilder.andWhere("categories.id IN (:...categoryIds)", {
      categoryIds,
    });
  }
  if (tagIds?.length) {
    queryBuilder.andWhere("tags.id IN (:...tagIds)", { tagIds });
  }
  if (productDeliveryTypes?.length) {
    queryBuilder.andWhere(
      "product.productDeliveryType && :productDeliveryTypes",
      { productDeliveryTypes }
    );
  }
};

/**
 * Applies search logic to a query builder.
 * This function eliminates code duplication for search in pagination functions.
 *
 * @param queryBuilder - The query builder to apply search to
 * @param search - The search term
 */
const applySearch = (
  queryBuilder: SelectQueryBuilder<Product>,
  search: string
): void => {
  const searchTerm = `%${search.trim()}%`;
  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where("product.name ILIKE :search", { search: searchTerm })
        .orWhere("product.slug ILIKE :search", { search: searchTerm })
        .orWhere("product.sku ILIKE :search", { search: searchTerm })
        .orWhere("brands.name ILIKE :search", { search: searchTerm })
        .orWhere("categories.name ILIKE :search", { search: searchTerm })
        .orWhere("tags.name ILIKE :search", { search: searchTerm });
    })
  );
};

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
  filtering = {},
}: GetPaginatedProductsInput) => {
  const skip = (page - 1) * limit;
  const queryBuilder = createProductQueryBuilder();

  applyFiltering(queryBuilder, filtering);

  if (search) {
    applySearch(queryBuilder, search);
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [products, total] = await queryBuilder.getManyAndCount();

  return { products, total };
};

export const paginateProductsForCustomer = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
  filtering = {},
}: GetPaginatedProductsInput) => {
  const skip = (page - 1) * limit;
  const queryBuilder = createProductQueryBuilder({ customerView: true });

  applyFiltering(queryBuilder, filtering);

  if (search) {
    applySearch(queryBuilder, search);
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [products, total] = await queryBuilder.getManyAndCount();

  return { products, total };
};

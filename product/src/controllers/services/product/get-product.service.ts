import { Brackets, ILike, Not } from "typeorm";
import { Product } from "../../../entities";
import { productRepository } from "../repositories/repositories";

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
  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.slug ILIKE :slug AND product.deletedAt IS NULL", { slug })
    // Product relations
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.attributes",
      "attributes",
      "attributes.deletedAt IS NULL AND attributes.visible = true"
    )
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
    .orderBy("attribute_values.createdAt", "ASC")
    .leftJoinAndSelect(
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL"
    )
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
    // Variation relations
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
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attribute",
      "variation_attribute",
      "variation_attribute.deletedAt IS NULL"
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
  // Build query with soft delete filtering for all relations
  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.id = :id AND product.deletedAt IS NULL", { id })
    // Product relations
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.attributes",
      "attributes",
      "attributes.deletedAt IS NULL"
    )
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
    .orderBy("attribute_values.createdAt", "ASC")
    .leftJoinAndSelect(
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL"
    )
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
    // Tier Pricing Info
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    // Variation relations
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
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attribute",
      "variation_attribute",
      "variation_attribute.deletedAt IS NULL"
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

  // Execute query
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
  // Build query with soft delete filtering for all relations
  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.id IN (:...ids) AND product.deletedAt IS NULL", { ids })
    // Product relations
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.attributes",
      "attributes",
      "attributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attributes.values",
      "attribute_values",
      "attribute_values.deletedAt IS NULL"
    )
    .orderBy("attribute_values.createdAt", "ASC")
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
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL"
    )
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
    // Tier Pricing Info
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    // Variation relations
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
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attribute",
      "variation_attribute",
      "variation_attribute.deletedAt IS NULL"
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

  // Execute query
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
  // Build query with soft delete filtering for all relations
  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.id IN (:...ids)", { ids })
    // Product relations
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.attributes",
      "attributes",
      "attributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attributes.values",
      "attribute_values",
      "attribute_values.deletedAt IS NULL"
    )
    .orderBy("attribute_values.createdAt", "ASC")
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
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL"
    )
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
    // Tier Pricing Info
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    // Variation relations
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
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attribute",
      "variation_attribute",
      "variation_attribute.deletedAt IS NULL"
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

  // Execute query
  return await queryBuilder.getMany();
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
    // Product relations
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.attributes",
      "attributes",
      "attributes.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "attributes.values",
      "attribute_values",
      "attribute_values.deletedAt IS NULL"
    )
    .orderBy("attribute_values.createdAt", "ASC")
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
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL"
    )
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
    // Tier Pricing Info
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    // Variation relations
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
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attribute",
      "variation_attribute",
      "variation_attribute.deletedAt IS NULL"
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

  if (search) {
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
}: GetPaginatedProductsInput) => {
  const skip = (page - 1) * limit;

  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .where("product.deletedAt IS NULL AND product.isVisible = :isVisible", {
      isVisible: true,
    })
    // Product relations
    .leftJoinAndSelect("product.brands", "brands", "brands.deletedAt IS NULL")
    .leftJoinAndSelect("product.tags", "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      "product.categories",
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "product.attributes",
      "attributes",
      "attributes.deletedAt IS NULL AND attributes.visible = true"
    )
    .leftJoinAndSelect(
      "attributes.values",
      "attribute_values",
      "attribute_values.deletedAt IS NULL"
    )
    .orderBy("attribute_values.createdAt", "ASC")
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
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL"
    )
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
    // Tier Pricing Info
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    // Variation relations
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
    .leftJoinAndSelect(
      "variations.attributeValues",
      "variation_attributeValues",
      "variation_attributeValues.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      "variation_attributeValues.attribute",
      "variation_attribute",
      "variation_attribute.deletedAt IS NULL"
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

  if (search) {
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
  }

  queryBuilder
    .skip(skip)
    .take(limit)
    .orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as "ASC" | "DESC");

  const [products, total] = await queryBuilder.getManyAndCount();

  return { products, total };
};

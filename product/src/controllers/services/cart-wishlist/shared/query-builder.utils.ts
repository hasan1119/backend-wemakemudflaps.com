import { SelectQueryBuilder } from "typeorm";

interface ProductQueryOptions {
  includeOnlyVisible?: boolean;
  includeBrands?: boolean;
}

/**
 * Adds all product relations to a query builder for cart/wishlist items.
 * This function eliminates code duplication across cart and wishlist services.
 *
 * @param queryBuilder - The query builder to add product relations to
 * @param productAlias - The alias used for the product entity (default: "product")
 * @param options - Options to control which relations and filters to include
 * @returns The same query builder with all product relations added
 */
export const addProductRelationsToQuery = <T>(
  queryBuilder: SelectQueryBuilder<T>,
  productAlias: string = "product",
  options: ProductQueryOptions = {}
): SelectQueryBuilder<T> => {
  const { includeOnlyVisible = true, includeBrands = true } = options;

  // Apply product visibility filter if requested (for customer-facing queries)
  if (includeOnlyVisible) {
    queryBuilder = queryBuilder.andWhere(
      `${productAlias}.deletedAt IS NULL AND ${productAlias}.isVisible = :isVisible`,
      { isVisible: true }
    );
  } else {
    queryBuilder = queryBuilder.andWhere(`${productAlias}.deletedAt IS NULL`);
  }

  return queryBuilder
    .leftJoinAndSelect(
      `${productAlias}.brands`,
      "brands",
      "brands.deletedAt IS NULL"
    )
    .leftJoinAndSelect(`${productAlias}.tags`, "tags", "tags.deletedAt IS NULL")
    .leftJoinAndSelect(
      `${productAlias}.categories`,
      "categories",
      "categories.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      `${productAlias}.attributes`,
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
    .leftJoinAndSelect(
      `${productAlias}.variations`,
      "variations",
      "variations.deletedAt IS NULL AND variations.isActive = true"
    )
    .leftJoinAndSelect(
      `${productAlias}.shippingClass`,
      "shippingClass",
      "shippingClass.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      `${productAlias}.upsells`,
      "upsells",
      "upsells.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      `${productAlias}.crossSells`,
      "crossSells",
      "crossSells.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      `${productAlias}.reviews`,
      "reviews",
      "reviews.deletedAt IS NULL"
    )
    .leftJoinAndSelect(
      `${productAlias}.taxClass`,
      "taxClass",
      "taxClass.deletedAt IS NULL"
    )
    .leftJoinAndSelect(`${productAlias}.tierPricingInfo`, "tierPricingInfo")
    .leftJoinAndSelect(
      "tierPricingInfo.tieredPrices",
      "tieredPrices",
      "tieredPrices.deletedAt IS NULL"
    )
    .addOrderBy("tieredPrices.maxQuantity", "ASC")
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
};

/**
 * Adds product variation relations to a query builder for cart/wishlist items.
 * This handles the productVariation relations that are specific to cart/wishlist items.
 *
 * @param queryBuilder - The query builder to add variation relations to
 * @param variationAlias - The alias used for the variation entity (default: "variation")
 * @returns The same query builder with variation relations added
 */
export const addProductVariationRelationsToQuery = <T>(
  queryBuilder: SelectQueryBuilder<T>,
  variationAlias: string = "variation"
): SelectQueryBuilder<T> => {
  return queryBuilder
    .leftJoinAndSelect(
      `${variationAlias}.tierPricingInfo`,
      "variation_tierPricingInfo_2"
    )
    .leftJoinAndSelect(
      "variation_tierPricingInfo_2.tieredPrices",
      "variation_tieredPrices_2"
    )
    .addOrderBy("variation_tieredPrices_2.maxQuantity", "ASC")
    .leftJoinAndSelect(
      `${variationAlias}.attributeValues`,
      "variation_attributeValues_2"
    )
    .leftJoinAndSelect(
      "variation_attributeValues_2.attributeValue",
      "variation_attributeValue_2"
    )
    .leftJoinAndSelect(
      `${variationAlias}.shippingClass`,
      "variation_shippingClass_2"
    )
    .leftJoinAndSelect(`${variationAlias}.taxClass`, "variation_taxClass_2");
};

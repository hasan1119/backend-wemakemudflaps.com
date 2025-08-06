import { Wishlist } from "../../../entities";
import { wishlistRepository } from "../repositories/repositories";

/**
 * Retrieves a single Wishlist entity by its ID using QueryBuilder.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a wishlist matching the provided ID.
 * 2. Left joins "items" relation, including nested product and productVariation.
 * 3. Filters out soft-deleted wishlists (deletedAt IS NULL).
 * 4. Returns the Wishlist entity or null if not found.
 *
 * @param id - The UUID of the wishlist to retrieve.
 * @returns A promise that resolves to the Wishlist entity, or null if no match is found.
 */
export const getWishlistById = async (id: string): Promise<Wishlist | null> => {
  return await wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product")
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
    .leftJoinAndSelect(
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL AND variations.isActive = true"
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
    )
    .leftJoinAndSelect("items.productVariation", "variation")
    .leftJoinAndSelect(
      "variation.tierPricingInfo",
      "variation_tierPricingInfo_2"
    )
    .leftJoinAndSelect(
      "variation_tierPricingInfo_2.tieredPrices",
      "variation_tieredPrices_2"
    )
    .addOrderBy("variation_tieredPrices_2.maxQuantity", "ASC")
    .leftJoinAndSelect(
      "variation.attributeValues",
      "variation_attributeValues_2"
    )
    .leftJoinAndSelect(
      "variation_attributeValues_2.attributeValue",
      "variation_attributeValue_2"
    )
    .leftJoinAndSelect("variation.shippingClass", "variation_shippingClass_2")
    .leftJoinAndSelect("variation.taxClass", "variation_taxClass_2")
    .where("wishlist.id = :id", { id })
    .andWhere("wishlist.deletedAt IS NULL")
    .getOne();
};

/**
 * Retrieves multiple Wishlist entities by their IDs using QueryBuilder.
 *
 * Workflow:
 * 1. Checks if the input array is non-empty.
 * 2. Creates a QueryBuilder to match all wishlist IDs in the provided list using IN clause.
 * 3. Left joins "items" relation, including nested product and productVariation.
 * 4. Filters out soft-deleted wishlists (deletedAt IS NULL).
 * 5. Returns an array of matching Wishlist entities.
 *
 * @param ids - An array of wishlist UUIDs to retrieve.
 * @returns A promise resolving to an array of Wishlist entities.
 */
export const getWishlistsByIds = async (ids: string[]): Promise<Wishlist[]> => {
  if (!ids.length) return [];
  return await wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product")
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
    .leftJoinAndSelect(
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL AND variations.isActive = true"
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
    )
    .leftJoinAndSelect("items.productVariation", "variation")
    .leftJoinAndSelect(
      "variation.tierPricingInfo",
      "variation_tierPricingInfo_2"
    )
    .leftJoinAndSelect(
      "variation_tierPricingInfo_2.tieredPrices",
      "variation_tieredPrices_2"
    )
    .addOrderBy("variation_tieredPrices_2.maxQuantity", "ASC")
    .leftJoinAndSelect(
      "variation.attributeValues",
      "variation_attributeValues_2"
    )
    .leftJoinAndSelect(
      "variation_attributeValues_2.attributeValue",
      "variation_attributeValue_2"
    )
    .leftJoinAndSelect("variation.shippingClass", "variation_shippingClass_2")
    .leftJoinAndSelect("variation.taxClass", "variation_taxClass_2")
    .where("wishlist.id IN (:...ids)", { ids })
    .andWhere("wishlist.deletedAt IS NULL")
    .getMany();
};

/**
 * Retrieves a single Wishlist entity by its associated user ID using QueryBuilder.
 *
 * Workflow:
 * 1. Creates a QueryBuilder to find a wishlist matching the provided user ID (createdBy).
 * 2. Left joins "items" relation, including nested product and productVariation.
 * 3. Filters out soft-deleted wishlists (deletedAt IS NULL).
 * 4. Returns the Wishlist entity or null if not found.
 *
 * @param userId - The UUID of the user associated with the wishlist.
 * @returns A promise that resolves to the Wishlist entity, or null if no match is found.
 */
export const getWishlistByUserId = async (
  userId: string
): Promise<Wishlist | null> => {
  return await wishlistRepository
    .createQueryBuilder("wishlist")
    .leftJoinAndSelect("wishlist.items", "items")
    .leftJoinAndSelect("items.product", "product")
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
    .leftJoinAndSelect(
      "product.variations",
      "variations",
      "variations.deletedAt IS NULL AND variations.isActive = true"
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
    )
    .leftJoinAndSelect("items.productVariation", "variation")
    .leftJoinAndSelect(
      "variation.tierPricingInfo",
      "variation_tierPricingInfo_2"
    )
    .leftJoinAndSelect(
      "variation_tierPricingInfo_2.tieredPrices",
      "variation_tieredPrices_2"
    )
    .addOrderBy("variation_tieredPrices_2.maxQuantity", "ASC")
    .leftJoinAndSelect(
      "variation.attributeValues",
      "variation_attributeValues_2"
    )
    .leftJoinAndSelect(
      "variation_attributeValues_2.attributeValue",
      "variation_attributeValue_2"
    )
    .leftJoinAndSelect("variation.shippingClass", "variation_shippingClass_2")
    .leftJoinAndSelect("variation.taxClass", "variation_taxClass_2")
    .where("wishlist.createdBy = :userId", { userId })
    .andWhere("wishlist.deletedAt IS NULL")
    .getOne();
};

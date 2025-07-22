import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  brandDef,
  brandMutationsDef,
  brandQueriesDef,
  categoryDef,
  categoryMutationsDef,
  categoryQueriesDef,
  couponDef,
  couponMutationsDef,
  couponQueriesDef,
  productAttributeDef,
  productAttributeMutationsDef,
  productAttributeQueriesDef,
  productDef,
  productMutationsDef,
  productPricingDef,
  productQueriesDef,
  productReviewDef,
  productReviewMutationsDef,
  productReviewQueriesDef,
  productVariationDef,
  sharedDef,
  shippingClassDef,
  shippingClassMutationsDef,
  shippingClassQueriesDef,
  shippingMethodDef,
  shippingMethodMutationsDef,
  shippingMethodQueriesDef,
  shippingZoneDef,
  shippingZoneMutationsDef,
  shippingZoneQueriesDef,
  tagDef,
  tagMutationsDef,
  tagQueriesDef,
  taxClassDef,
  taxClassMutationsDef,
  taxClassQueriesDef,
  taxOptionsDef,
  taxOptionsMutationsDef,
  taxOptionsQueriesDef,
  taxRateDef,
  taxRateMutationsDef,
  taxRateQueriesDef,
} from "../../component/schemas";

/**
 * Handles merging of all GraphQL schemas into a single unified type definition.
 *
 * Workflow:
 * 1. Imports shared, brand, tag, category, and product-related schema etc, definitions from the schema module.
 * 2. Uses mergeTypeDefs to combine all schema definitions into one.
 * 3. Exports the unified type definition for use in the GraphQL server.
 */
export const typeDefs = mergeTypeDefs([
  // Shared schema definition for common types used across services
  sharedDef,

  // Brand schema definition
  brandDef,

  // Schema for brand queries (fetching brand data)
  brandQueriesDef,

  // Schema for brand mutations (modifying brand data)
  brandMutationsDef,

  // Tag schema definition
  tagDef,

  // Schema for tag queries (fetching tag data)
  tagQueriesDef,

  // Schema for tag mutations (modifying tag data)
  tagMutationsDef,

  // Category schema definition
  categoryDef,

  // Schema for category queries (fetching category and subcategory data)
  categoryQueriesDef,

  // Schema for category mutations (modifying category and subcategory data)
  categoryMutationsDef,

  // Shipping Class schema definition
  shippingClassDef,

  // Schema for shippingClass queries (fetching shipping class data)
  shippingClassQueriesDef,

  // Schema for shippingClass mutations (modifying shipping class data)
  shippingClassMutationsDef,

  // Tax Class schema definition
  taxClassDef,

  // Schema for taxClass queries (fetching tax class data)
  taxClassQueriesDef,

  // Schema for taxClass mutations (modifying tax class data)
  taxClassMutationsDef,

  // Tax Rate schema definition
  taxRateDef,

  // Schema for taxRate queries (fetching tax rate data)
  taxRateQueriesDef,

  // Schema for taxRate mutations (modifying tax rate data)
  taxRateMutationsDef,

  // Product attribute schema definition
  productAttributeDef,

  // Schema for product attribute queries (fetching product attribute data)
  productAttributeQueriesDef,

  // Schema for product attribute mutations (modifying product attribute data)
  productAttributeMutationsDef,

  // Product pricing schema definition
  productPricingDef,

  // Product review schema definition
  productReviewDef,

  // Schema for product review mutations (modifying product review data)
  productReviewMutationsDef,

  // Schema for product review queries (fetching product review data)
  productReviewQueriesDef,

  // Product variation schema definition
  productVariationDef,

  // Product schema definition
  productDef,

  // Schema for product queries (fetching product data)
  productQueriesDef,

  // Schema for product mutations (modifying product data)
  productMutationsDef,

  // Shipping Zone schema definition
  shippingZoneDef,

  // Schema for shipping zone queries (fetching shipping zone data)
  shippingZoneQueriesDef,

  // Schema for shipping zone mutations (modifying shipping zone data)
  shippingZoneMutationsDef,

  // Shipping Method schema definition
  shippingMethodDef,

  // Schema for shipping method queries (fetching shipping method data)
  shippingMethodQueriesDef,

  // Schema for shipping method mutations (modifying shipping method data)
  shippingMethodMutationsDef,

  // Schema for tax options
  taxOptionsDef,

  // Schema for tax options queries (fetching tax options data)
  taxOptionsQueriesDef,

  // Schema for tax options mutations (modifying tax options data)
  taxOptionsMutationsDef,

  // Coupon schema definition
  couponDef,

  // Schema for coupon queries (fetching coupon data)
  couponQueriesDef,

  // Schema for coupon mutations (modifying coupon data)
  couponMutationsDef,
]);

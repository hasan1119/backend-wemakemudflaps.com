import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  brandDef,
  brandMutationsDef,
  brandQueriesDef,
  categoryDef,
  categoryMutationsDef,
  categoryQueriesDef,
  productAttributeDef,
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
  tagDef,
  tagMutationsDef,
  tagQueriesDef,
  taxClassDef,
  taxClassMutationsDef,
  taxClassQueriesDef,
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

  // Product attribute schema definition
  productAttributeDef,

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
]);

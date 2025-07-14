import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";

/**
 * Loads and parses the shared GraphQL schema for common types used across services.
 *
 * Workflow:
 * 1. Reads the schema definition from the `shared.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed shared GraphQL schema as a DocumentNode.
 */
export const sharedDef = gql(
  readFileSync(path.join(__dirname, "./shared.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses the GraphQL schema for brand-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `brand/brand.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for brands as a DocumentNode.
 */
export const brandDef = gql(
  readFileSync(path.join(__dirname, "./brand/brand.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for brand-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `brand/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for brands as a DocumentNode.
 */
export const brandQueriesDef = gql(
  readFileSync(path.join(__dirname, "./brand/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for brand-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `brand/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for brands as a DocumentNode.
 */
export const brandMutationsDef = gql(
  readFileSync(path.join(__dirname, "./brand/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for tag-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `tag/tag.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for tags as a DocumentNode.
 */
export const tagDef = gql(
  readFileSync(path.join(__dirname, "./tag/tag.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses GraphQL queries for tag-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `tag/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for tags as a DocumentNode.
 */
export const tagQueriesDef = gql(
  readFileSync(path.join(__dirname, "./tag/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for tag-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `tag/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for tags as a DocumentNode.
 */
export const tagMutationsDef = gql(
  readFileSync(path.join(__dirname, "./tag/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for category-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `category/category.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for categories as a DocumentNode.
 */
export const categoryDef = gql(
  readFileSync(path.join(__dirname, "./category/category.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for category-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `category/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for categories as a DocumentNode.
 */
export const categoryQueriesDef = gql(
  readFileSync(path.join(__dirname, "./category/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for category-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `category/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for categories as a DocumentNode.
 */
export const categoryMutationsDef = gql(
  readFileSync(path.join(__dirname, "./category/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for shipping class-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `shipping/shipping.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for shipping classes as a DocumentNode.
 */
export const shippingClassDef = gql(
  readFileSync(
    path.join(__dirname, "./shipping-class/shipping-class.graphql"),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses GraphQL queries for shipping class-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `shipping/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for shipping classes as a DocumentNode.
 */
export const shippingClassQueriesDef = gql(
  readFileSync(path.join(__dirname, "./shipping-class/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for shipping class-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `shipping/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for shipping classes as a DocumentNode.
 */
export const shippingClassMutationsDef = gql(
  readFileSync(path.join(__dirname, "./shipping-class/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for tax class-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `tax-class/tax-class.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for tax classes as a DocumentNode.
 */
export const taxClassDef = gql(
  readFileSync(path.join(__dirname, "./tax-class/tax-class.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for tax class-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `tax-class/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for tax classes as a DocumentNode.
 */
export const taxClassQueriesDef = gql(
  readFileSync(path.join(__dirname, "./tax-class/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for tax class-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `tax-class/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for tax classes as a DocumentNode.
 */
export const taxClassMutationsDef = gql(
  readFileSync(path.join(__dirname, "./tax-class/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for tax rate-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `tax-rate/tax-rate.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for tax ratees as a DocumentNode.
 */
export const taxRateDef = gql(
  readFileSync(path.join(__dirname, "./tax-rate/tax-rate.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for tax rate-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `tax-rate/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for tax ratees as a DocumentNode.
 */
export const taxRateQueriesDef = gql(
  readFileSync(path.join(__dirname, "./tax-rate/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for tax rate-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `tax-rate/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for tax ratees as a DocumentNode.
 */
export const taxRateMutationsDef = gql(
  readFileSync(path.join(__dirname, "./tax-rate/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for tax product-attribute-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `product/product-attribute/product-attribute.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` product-attribute.
 *
 * @returns The parsed GraphQL schema for tax statuses as a DocumentNode.
 */
export const productAttributeDef = gql(
  readFileSync(
    path.join(
      __dirname,
      "./product/product-attribute/product-attribute.graphql"
    ),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses the GraphQL schema for tax product-pricing-variation-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `product/product-pricing-variation/product-pricing.graphql` and `product/product-pricing-variation/product-variation.graphql` file.
 * 2. Parses the files content into a GraphQL DocumentNode using the `gql` product-pricing and product-variation.
 *
 * @returns The parsed GraphQL schema for tax statuses as a DocumentNode.
 */
export const productPricingDef = gql(
  readFileSync(
    path.join(
      __dirname,
      "./product/product-pricing-variation/product-pricing.graphql"
    ),
    {
      encoding: "utf-8",
    }
  )
);
export const productVariationDef = gql(
  readFileSync(
    path.join(
      __dirname,
      "./product/product-pricing-variation/product-variation.graphql"
    ),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses the GraphQL schema for tax product-review-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `product/product-review/product-review.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` product-review.
 *
 * @returns The parsed GraphQL schema for tax statuses as a DocumentNode.
 */
export const productReviewDef = gql(
  readFileSync(
    path.join(__dirname, "./product/product-review/product-review.graphql"),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses GraphQL queries for tax product-review-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `product/product-review/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` product-review.
 *
 * @returns The parsed GraphQL queries for tax classes as a DocumentNode.
 */
export const productReviewQueriesDef = gql(
  readFileSync(
    path.join(__dirname, "./product/product-review/queries.graphql"),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses GraphQL mutations for tax product-review-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `product/product-review/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` product-review.
 *
 * @returns The parsed GraphQL mutations for tax classes as a DocumentNode.
 */
export const productReviewMutationsDef = gql(
  readFileSync(
    path.join(__dirname, "./product/product-review/mutations.graphql"),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses the GraphQL schema for product-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `product/product.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for products as a DocumentNode.
 */
export const productDef = gql(
  readFileSync(path.join(__dirname, "./product/product.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for product-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `product/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for products as a DocumentNode.
 */
export const productQueriesDef = gql(
  readFileSync(path.join(__dirname, "./product/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for product-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `product/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for products as a DocumentNode.
 */
export const productMutationsDef = gql(
  readFileSync(path.join(__dirname, "./product/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for shipping method-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `shipping-method/shipping-method.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema for shipping methods as a DocumentNode.
 */
export const shippingMethodDef = gql(
  readFileSync(
    path.join(__dirname, "./shipping-method/shipping-method.graphql"),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses GraphQL queries for shipping method-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `shipping-method/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries for shipping methods as a DocumentNode.
 */
export const shippingMethodQueriesDef = gql(
  readFileSync(path.join(__dirname, "./shipping-method/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for shipping method-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `shipping-method/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations for shipping methods as a DocumentNode.
 */
export const shippingMethodMutationsDef = gql(
  readFileSync(path.join(__dirname, "./shipping-method/mutations.graphql"), {
    encoding: "utf-8",
  })
);

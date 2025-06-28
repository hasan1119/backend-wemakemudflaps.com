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

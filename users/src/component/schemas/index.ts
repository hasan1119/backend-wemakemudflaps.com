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
 * Loads and parses the GraphQL schema for user-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `./user/user.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema as a DocumentNode.
 */
export const userDef = gql(
  readFileSync(path.join(__dirname, "./user/user.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for user-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `./user/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries as a DocumentNode.
 */
export const userQueriesDef = gql(
  readFileSync(path.join(__dirname, "./user/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for user-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `./user/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations as a DocumentNode.
 */
export const userMutationsDef = gql(
  readFileSync(path.join(__dirname, "./user/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for role-permission-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `./role-permission/role-permission.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema as a DocumentNode.
 */
export const rolePermissionDef = gql(
  readFileSync(
    path.join(__dirname, "./role-permission/role-permission.graphql"),
    {
      encoding: "utf-8",
    }
  )
);

/**
 * Loads and parses GraphQL queries for role-permission-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `./role-permission/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries as a DocumentNode.
 */
export const rolePermissionQueriesDef = gql(
  readFileSync(path.join(__dirname, "./role-permission/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for role-permission-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `./role-permission/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations as a DocumentNode.
 */
export const rolePermissionMutationsDef = gql(
  readFileSync(path.join(__dirname, "./role-permission/mutations.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses the GraphQL schema for address-book-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `./address-book/address-book.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema as a DocumentNode.
 */
export const addressBookDef = gql(
  readFileSync(path.join(__dirname, "./address-book/address-book.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL queries for address-book-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `./address-book/queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries as a DocumentNode.
 */
export const addressBookQueriesDef = gql(
  readFileSync(path.join(__dirname, "./address-book/queries.graphql"), {
    encoding: "utf-8",
  })
);

/**
 * Loads and parses GraphQL mutations for address-book-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `./address-book/mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations as a DocumentNode.
 */
export const addressBookMutationsDef = gql(
  readFileSync(path.join(__dirname, "./address-book/mutations.graphql"), {
    encoding: "utf-8",
  })
);

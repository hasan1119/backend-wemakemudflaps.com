import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";

/**
 * Loads and parses the GraphQL schema for media-related types.
 *
 * Workflow:
 * 1. Reads the schema definition from the `media.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL schema as a DocumentNode.
 */
export const mediaDef = gql(
  readFileSync(path.join(__dirname, "./media.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses GraphQL queries for media-related operations.
 *
 * Workflow:
 * 1. Reads the query definitions from the `queries.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL queries as a DocumentNode.
 */
export const mediaQueriesDef = gql(
  readFileSync(path.join(__dirname, "./queries.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses GraphQL mutations for media-related operations.
 *
 * Workflow:
 * 1. Reads the mutation definitions from the `mutations.graphql` file.
 * 2. Parses the file content into a GraphQL DocumentNode using the `gql` tag.
 *
 * @returns The parsed GraphQL mutations as a DocumentNode.
 */
export const mediaMutationsDef = gql(
  readFileSync(path.join(__dirname, "./mutations.graphql"), {
    encoding: "utf-8",
  })
);

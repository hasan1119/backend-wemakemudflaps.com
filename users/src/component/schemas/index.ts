import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";

/**
 * Loads and parses the GraphQL schema definition for users.
 *
 * Reads the schema from `user.graphql` file and parses it into
 * a GraphQL DocumentNode using the `gql` tag.
 */
export const userDef = gql(
  readFileSync(path.join(__dirname, "./user.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses the GraphQL queries related to users.
 *
 * Reads the queries from `queries.graphql`, which contains
 * all user-related query operations, and converts them into
 * a GraphQL DocumentNode.
 */
export const userQueriesDef = gql(
  readFileSync(path.join(__dirname, "./queries.graphql"), { encoding: "utf-8" })
);

/**
 * Loads and parses the GraphQL mutations related to users.
 *
 * Reads the mutations from `mutations.graphql`, which includes
 * all mutation operations for user data modifications,
 * and parses them into a GraphQL DocumentNode.
 */
export const userMutationsDef = gql(
  readFileSync(path.join(__dirname, "./mutations.graphql"), {
    encoding: "utf-8",
  })
);

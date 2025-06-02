/**
 * Handles merging of all GraphQL schemas into a single unified type definition.
 *
 * Workflow:
 * 1. Imports user-related schema definitions from the schemas component.
 * 2. Uses mergeTypeDefs to combine all schema definitions into one.
 * 3. Exports the unified type definition for use in the GraphQL server.
 */
import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  userDef,
  userMutationsDef,
  userQueriesDef,
} from "../../component/schemas";

/**
 * Handles merging of all GraphQL schemas into a single unified type definition.
 *
 * Workflow:
 * 1. Imports user-related schema definitions from the schemas component.
 * 2. Uses mergeTypeDefs to combine all schema definitions into one.
 * 3. Exports the unified type definition for use in the GraphQL server.
 */
export const typeDefs = mergeTypeDefs([
  // Main user schema definition
  userDef,

  // Schema for user queries (fetching user data)
  userQueriesDef,

  // Schema for user mutations (modifying user data)
  userMutationsDef,
]);

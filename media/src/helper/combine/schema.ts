import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  mediaDef,
  mediaMutationsDef,
  mediaQueriesDef,
} from "../../component/schemas";

/**
 * Handles merging of all GraphQL schemas into a single unified type definition.
 *
 * Workflow:
 * 1. Imports media-related schema definitions from the schemas component.
 * 2. Uses mergeTypeDefs to combine all schema definitions into one.
 * 3. Exports the unified type definition for use in the GraphQL server.
 */
export const typeDefs = mergeTypeDefs([
  // Main media schema definition
  mediaDef,

  // Schema for media queries (fetching media data)
  mediaQueriesDef,

  // Schema for media mutations (modifying media data)
  mediaMutationsDef,
]);

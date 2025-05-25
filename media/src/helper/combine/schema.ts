import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  mediaDef,
  mediaMutationsDef,
  mediaQueriesDef,
} from "../../component/schemas";

/**
 * Merges all GraphQL schemas into a single unified type definition.
 */
export const typeDefs = mergeTypeDefs([
  /**
   * Media schema definition (main media model).
   */
  mediaDef,

  /**
   * Media queries (e.g., fetching media data).
   */
  mediaQueriesDef,

  /**
   * Media mutations (e.g., modifying media data).
   */
  mediaMutationsDef,
]);

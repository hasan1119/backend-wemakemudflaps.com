import { mergeResolvers } from "@graphql-tools/merge";
import {
  mediaMutationsResolver,
  mediaQueriesResolver,
} from "../../component/resolver";

/**
 * Merges all GraphQL resolvers into a single unified resolver object.
 */
export const resolvers = mergeResolvers([
  /**
   * Resolver for media mutations (e.g., modifying media data).
   */
  mediaMutationsResolver,

  /**
   * Resolver for media queries (e.g., fetching media data).
   */
  mediaQueriesResolver,
]) as any;

import { mergeResolvers } from "@graphql-tools/merge";
import {
  mediaMutationsResolver,
  mediaQueriesResolver,
} from "../../component/resolver";

/**
 * Handles merging of all GraphQL resolvers into a single unified resolver object.
 *
 * Workflow:
 * 1. Imports media mutation and query resolvers from the resolver component.
 * 2. Uses mergeResolvers to combine all resolver objects into one.
 * 3. Exports the unified resolver object for use in the GraphQL server.
 */
export const resolvers = mergeResolvers([
  // Media mutations resolver for modifying media data
  mediaMutationsResolver,

  // Media queries resolver for fetching media data
  mediaQueriesResolver,
]) as any;

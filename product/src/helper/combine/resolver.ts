import { mergeResolvers } from "@graphql-tools/merge";
import {
  productMutationsResolver,
  productQueriesResolver,
} from "../../component/resolver";

/**
 * Handles merging of all GraphQL resolvers into a single unified resolver object.
 *
 * Workflow:
 * 1. Imports product mutation and query resolvers from the resolver component.
 * 2. Uses mergeResolvers to combine all resolver objects into one.
 * 3. Exports the unified resolver object for use in the GraphQL server.
 */
export const resolvers = mergeResolvers([
  // Product mutations resolver for modifying product data
  productMutationsResolver,

  // Product queries resolver for fetching product data
  productQueriesResolver,
]) as any;

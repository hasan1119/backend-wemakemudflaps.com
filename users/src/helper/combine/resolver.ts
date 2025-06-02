import { mergeResolvers } from "@graphql-tools/merge";
import {
  userMutationsResolver,
  userQueriesResolver,
} from "../../component/resolver";

/**
 * Handles merging of all GraphQL resolvers into a single unified resolver object.
 *
 * Workflow:
 * 1. Imports user mutation and query resolvers from the resolver component.
 * 2. Uses mergeResolvers to combine all resolver objects into one.
 * 3. Exports the unified resolver object for use in the GraphQL server.
 */
export const resolvers = mergeResolvers([
  // User mutations resolver for modifying user data
  userMutationsResolver,

  // User queries resolver for fetching user data
  userQueriesResolver,
]) as any;

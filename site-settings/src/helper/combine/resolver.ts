import { mergeResolvers } from "@graphql-tools/merge";
import {
  siteSettingsMutationsResolver,
  siteSettingsQueriesResolver,
} from "../../component/resolver";

/**
 * Handles merging of all GraphQL resolvers into a single unified resolver object.
 *
 * Workflow:
 * 1. Imports site settings mutation and query resolvers from the resolver component.
 * 2. Uses mergeResolvers to combine all resolver objects into one.
 * 3. Exports the unified resolver object for use in the GraphQL server.
 */
export const resolvers = mergeResolvers([
  // Site settings mutations resolver for modifying site settings
  siteSettingsMutationsResolver,

  // Site settings queries resolver for fetching site settings data
  siteSettingsQueriesResolver,
]) as any;

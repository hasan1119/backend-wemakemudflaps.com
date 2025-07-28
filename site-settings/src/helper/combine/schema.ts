import { mergeTypeDefs } from "@graphql-tools/merge";
import { faqDef, sharedDef } from "../../component/schemas";

/**
 * Handles merging of all GraphQL schemas into a single unified type definition.
 *
 * Workflow:
 * 1. Imports site settings related schema definitions from the schemas component.
 * 2. Uses mergeTypeDefs to combine all schema definitions into one.
 * 3. Exports the unified type definition for use in the GraphQL server.
 */
export const typeDefs = mergeTypeDefs([
  // Shared schema definition for common types used across services
  sharedDef,

  // FAQ schema definition for managing frequently asked questions
  faqDef,
]);

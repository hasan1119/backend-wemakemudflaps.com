import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  addressBookDef,
  addressBookMutationsDef,
  addressBookQueriesDef,
  rolePermissionDef,
  rolePermissionMutationsDef,
  rolePermissionQueriesDef,
  sharedDef,
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
  // Shared schema definition for common types used across services
  sharedDef,

  // Main user schema definition
  userDef,

  // Schema for user queries (fetching user data)
  userQueriesDef,

  // Schema for user mutations (modifying user data)
  userMutationsDef,

  // Main role and permission schema definition
  rolePermissionDef,

  // Schema for role and permission queries (fetching rolePermission data)
  rolePermissionQueriesDef,

  // Schema for role and permission mutations (modifying role and permission data)
  rolePermissionMutationsDef,

  // Main address-book schema definition
  addressBookDef,

  // Schema for address-book queries (fetching address-book data)
  addressBookQueriesDef,

  // Schema for address-book mutations (modifying address-book data)
  addressBookMutationsDef,
]);

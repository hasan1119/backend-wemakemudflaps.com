import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  userDef,
  userMutationsDef,
  userQueriesDef,
} from "../../component/schemas";

// Merge all schemas into a single type definition.
export const typeDefs = mergeTypeDefs([
  // Merging all the GraphQL schemas into one unified schema
  userDef, // User schema definition (main user model)
  userQueriesDef, // User queries (e.g., fetching user data)
  userMutationsDef, // User mutations (e.g., modifying user data)
]);

import { mergeTypeDefs } from "@graphql-tools/merge";
import {
  mediaDef,
  mediaMutationsDef,
  mediaQueriesDef,
} from "../../component/schemas";

// Merge all schemas into a single type definition.
export const typeDefs = mergeTypeDefs([
  // Merging all the GraphQL schemas into one unified schema
  mediaDef, // Media schema definition (main media model)
  mediaQueriesDef, // Media queries (e.g., fetching media data)
  mediaMutationsDef, // User mutations (e.g., modifying user data)
]);

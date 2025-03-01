// Merge all resolvers
import { mergeResolvers } from "@graphql-tools/merge";
import {
  userMutationsResolver,
  userQueriesResolver,
} from "../../component/resolver";
import { ResolversTypes } from "../../types";

// Merge all resolvers
export const resolvers = mergeResolvers([
  userMutationsResolver,
  userQueriesResolver,
]) as ResolversTypes;

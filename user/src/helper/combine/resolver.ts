// Merge all resolvers
import { mergeResolvers } from "@graphql-tools/merge";
import {
  userMutationsResolver,
  userQueriesResolver,
} from "../../component/resolver";

// Merge all resolvers
export const resolvers = mergeResolvers([
  userMutationsResolver,
  userQueriesResolver,
]) as any;

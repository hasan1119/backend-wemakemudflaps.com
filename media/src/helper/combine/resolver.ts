// Merge all resolvers
import { mergeResolvers } from "@graphql-tools/merge";
import {
  mediaMutationsResolver,
  mediaQueriesResolver,
} from "../../component/resolver";

// Merge all resolvers
export const resolvers = mergeResolvers([
  mediaMutationsResolver,
  mediaQueriesResolver,
]) as any;

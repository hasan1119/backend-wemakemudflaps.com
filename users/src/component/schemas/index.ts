import { readFileSync } from "fs";
import gql from "graphql-tag";
import path from "path";

export const userDef = gql(
  readFileSync(path.join(__dirname, "./user.graphql"), { encoding: "utf-8" })
);
export const userQueriesDef = gql(
  readFileSync(path.join(__dirname, "./queries.graphql"), { encoding: "utf-8" })
);
export const userMutationsDef = gql(
  readFileSync(path.join(__dirname, "./mutations.graphql"), {
    encoding: "utf-8",
  })
);

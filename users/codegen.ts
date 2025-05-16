import { CodegenConfig } from "@graphql-codegen/cli";
import { print } from "graphql";
import { typeDefs } from "./src/helper/combine/schema";

const config: CodegenConfig = {
  schema: print(typeDefs),
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./context#Context",
        federation: true,
      },
    },
  },
};
export default config;

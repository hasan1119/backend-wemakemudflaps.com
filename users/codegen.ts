import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  // schema: print(typeDefs),
  schema: "http://localhost:4000/",
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

import { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Configures GraphQL code generation for TypeScript types and resolvers.
 *
 * Workflow:
 * 1. Uses the printed GraphQL schema from typeDefs as the source.
 * 2. Generates TypeScript types and resolver signatures in the specified output file.
 * 3. Configures context type and enables federation support.
 */
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

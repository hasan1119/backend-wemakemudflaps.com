import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import "reflect-metadata";
import CONFIG from "./src/config/config";
import { connectDB } from "./src/helper";
import { resolvers } from "./src/helper/combine/resolver";
import { typeDefs } from "./src/helper/combine/schema";
import createContext from "./src/middleware/context";

/**
 * Entry point for the Apollo GraphQL Subgraph server.
 *
 * - Connects to the database
 * - Initializes ApolloServer with subgraph schema, resolvers, and type definitions
 * - Starts the server and listens on the configured port
 * - Logs the subgraph URL on successful startup
 */
async function startApolloServer() {
  // Connect to the database
  await connectDB();

  // Create the Apollo Server instance with subgraph schema
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  });

  const port = CONFIG.PORT;
  const subgraphName = CONFIG.SUB_GRAPH_NAME;

  try {
    const { url } = await startStandaloneServer(server, {
      context: createContext,
      listen: { port },
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (err) {
    console.error("Error starting Apollo Subgraph:", err);
  }
}

startApolloServer();

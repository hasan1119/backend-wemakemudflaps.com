import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import "reflect-metadata";
import CONFIG from "./src/config/config";
import { AppDataSource, connectDB } from "./src/helper";
import { resolvers } from "./src/helper/combine/resolver";
import { typeDefs } from "./src/helper/combine/schema";
import createContext from "./src/middleware/context";
import loggingPlugin from "./src/plugins/loggingPlugin";

/**
 * Initializes and starts the Apollo GraphQL Subgraph server.
 *
 * Workflow:
 * 1. Establishes a connection to the database.
 * 2. Creates an ApolloServer instance with a subgraph schema built from typeDefs and resolvers.
 * 3. Starts the server on the configured port with the provided context function.
 * 4. Logs the subgraph URL on successful startup or errors if startup fails.
 */
async function startApolloServer() {
  // Initialize database connection
  await connectDB();

  // Create Apollo Server instance
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    plugins: [loggingPlugin],
  });

  const port = CONFIG.PORT;
  const subgraphName = CONFIG.SUB_GRAPH_NAME;

  try {
    // Start server and log URL
    const { url } = await startStandaloneServer(server, {
      context: createContext,
      listen: { port },
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);

    await AppDataSource.runMigrations();
  } catch (err) {
    console.error("Error starting Apollo Subgraph:", err);
  }
}

startApolloServer();

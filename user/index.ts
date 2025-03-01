import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import CONFIG from "./src/config/config";
import { connectDB } from "./src/db";
import { resolvers } from "./src/helper/combine/resolver"; // Combined resolvers
import { typeDefs } from "./src/helper/combine/schema"; // Combined schemas
import createContext from "./src/middleware/context";

async function startApolloServer() {
  // Connect to the database
  await connectDB();

  // Create the Apollo Server instance
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
  } catch (error: Error | any) {
    console.error("❌ Error starting Apollo Subgraph:", error);
  }
}

startApolloServer();

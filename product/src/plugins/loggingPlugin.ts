import { ApolloServerPlugin } from "@apollo/server";
import logger from "../utils/logger";

const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart(requestContext) {
    const { request } = requestContext;

    if (request.operationName === "SubgraphIntrospectQuery") {
      return {};
    }
    // console.log(request);
    logger.info({
      query: request.query,
      variables: request.variables,
      operationName: request.operationName,
      headers: request.http?.headers.get("authorization") || "<no-auth-header>", // log request headers if available
    }, "📥 Incoming GraphQL Request");

    return {
      async willSendResponse(context) {
        logger.info({
          operationName: context.operation?.operation,
          response: context.response.body,
        }, "📤 GraphQL Response Sent");
      },
    };
  },
};

export default loggingPlugin;

import { AppDataSource, redis } from "../helper";
import { getUserTokenInfoByUserIdFromRedis } from "../helper/redis";
import { UserSession } from "../types";
import DecodeToken from "../utils/jwt/decode-token";

/**
 * Generates the GraphQL context for each incoming request.
 *
 * Workflow:
 * 1. Extracts the JWT token from the Authorization header and decodes it.
 * 2. Retrieves the user session from Redis if a valid token is provided.
 * 3. Constructs the context object with database, user, IP, Redis, and HTTP request/response details.
 * 4. Ensures a valid context object is returned even if an error occurs.
 *
 * @param param0 - Object containing HTTP request and response objects.
 * @param param0.req - The HTTP request object.
 * @param param0.res - The HTTP response object.
 * @returns A promise resolving to the context object for Apollo Server.
 */
const createContext = async ({ req, res }) => {
  try {
    let user: UserSession | null = null;

    // Extract token from Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      const decoded = await DecodeToken(token);
      if (decoded) {
        // Fetch the user session from Redis using the decoded user ID
        const userSession = await getUserTokenInfoByUserIdFromRedis(decoded.id);
        user = userSession ? userSession : null; // Set user only if session exists
      }
    }

    // Extract necessary headers and add them to the context
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    return {
      AppDataSource,
      user,
      ip,
      redis,
      req,
      res,
    };
  } catch (error) {
    console.error("Context error: ", error.message);

    // Ensures a valid context object is returned on error
    return {
      AppDataSource,
      user: null,
      ip: "",
      acceptLanguage: "",
      languages: [],
      redis,
    };
  }
};

export default createContext;

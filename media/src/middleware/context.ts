import { AppDataSource, redis } from "../helper";
import { getUserTokenInfoByUserIdFromRedis } from "../helper/redis";
import { UserSession } from "../types";
import DecodeToken from "../utils/jwt/decode-token";

/**
 * Creates the GraphQL context for each request.
 *
 * - Extracts and decodes the JWT token from the Authorization header
 * - Loads the user session from Redis if a valid token is present
 * - Adds database, user, IP, Redis, request, and response objects to the context
 * - Always returns a valid context object, even on error
 *
 * @param {Object} param0 - The context input containing req and res
 * @param {IncomingMessage} param0.req - The HTTP request object
 * @param {ServerResponse} param0.res - The HTTP response object
 * @returns {Promise<Object>} The context object for Apollo Server
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

    // ✅ Always return a valid object, even in case of an error
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

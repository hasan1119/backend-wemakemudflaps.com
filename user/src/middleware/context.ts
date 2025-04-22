import { AppDataSource, redis } from "../helper";
import DecodeToken from "../utils/jwt/decode-token";

export type UserSession = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

const createContext = async ({ req, res }) => {
  try {
    let user: UserSession | null = null;

    // Extract token from Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const decoded = await DecodeToken(token);
      if (decoded) {
        // Fetch the user session from Redis using the decoded user ID
        const userSession = await redis.getSession<UserSession>(decoded.id);

        user = userSession || null; // Set user only if session exists
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

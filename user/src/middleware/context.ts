import { AppDataSource, redis } from "../helper";
import DecodeToken from "../utils/jwt/decode-token";

export type UserSession = {
  user_id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
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
        const userSession = await redis.getSession<UserSession>(
          decoded.trackingId.toString()
        );

        user = userSession || null; // Set user only if session exists
      }
    }

    // Extract necessary headers and add them to the context
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const acceptLanguage = req.headers["accept-language"] || "";
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim())
      .filter((lang) => /^[a-zA-Z-]+$/.test(lang));

    return {
      AppDataSource,
      user,
      ip,
      acceptLanguage,
      languages,
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

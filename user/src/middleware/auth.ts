import jwt from "jsonwebtoken";
import config from "../config/config";
import { redis } from "../helper";

// User session interface to define the structure of the session object
interface UserSession {
  user_id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role?: string;
  trackingId: number;
}

export async function authMiddleware(
  req: any, // The request object
  res: any // The response object
): Promise<UserSession> {
  try {
    // Extract the token from the authorization header
    const token =
      req.headers?.authorization && req.headers?.authorization?.split(" ")[1] || req.cookies?.token;

    // If no token is provided, throw an error
    if (!token) {
      throw new Error("No token provided in the authorization headers or cookies");
    }

    // Verify the JWT using the secret key
    const decoded = jwt.verify(token, config.SECRET_KEY) as UserSession;

    // Fetch the user session from Redis using the decoded user ID
    const session = await redis.getSession<UserSession>(
      decoded.trackingId.toString()
    );

    // If no session is found or it's invalid, throw an error
    if (!session) {
      throw new Error("Session expired or invalid");
    }

    // Return the session object if valid
    return decoded;
  } catch (err: Error | any) {
    // If an error occurs during verification or session retrieval, respond with a 403 error
    return res.status(403).send({
      message: err?.message, // Return the error message from the caught exception
    });
  }
}

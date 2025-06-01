import jwt from "jsonwebtoken";
import config from "../../config/config";
import { UserSession } from "../../types";
import { mapUserToTokenData } from "../mapper";

/**
 * Generates a signed JWT token for a user session.
 *
 * Workflow:
 * 1. Maps the provided UserSession data to a token payload format.
 * 2. Signs the payload with the configured secret key and expiration time.
 * 3. Returns the generated JWT token as a string.
 *
 * @param data - The UserSession data to encode.
 * @param expiresIn - Optional expiration time for the token (defaults to config.EXPIRE).
 * @returns A promise resolving to the signed JWT token.
 */
const EncodeToken = async (
  data: UserSession,
  expiresIn?: string
): Promise<string> => {
  // Create the token payload
  const PAYLOAD = await mapUserToTokenData(data);

  // Use the provided expiresIn value or the default from config
  const tokenExpiresIn = expiresIn || config.EXPIRE;

  // Sign and return the JWT token
  return jwt.sign(PAYLOAD, config.SECRET_KEY, { expiresIn: tokenExpiresIn });
};

export default EncodeToken;

import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config/config";

/**
 * Verifies a JWT token using a secret key.
 *
 * @param token - The JWT token to verify.
 * @returns {Promise<JwtPayload | null>} - The decoded token payload if valid, null if verification fails.
 */
const DecodeToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const decoded = jwt.verify(token, config.SECRET_KEY) as JwtPayload;
    console.log(decoded);
    // Ensure the decoded token contains the required fields
    if (
      decoded &&
      typeof decoded === "object" &&
      "id" in decoded &&
      "email" in decoded &&
      "firstName" in decoded &&
      "lastName" in decoded &&
      "role" in decoded &&
      "gender" in decoded &&
      "emailVerified" in decoded &&
      "isAccountActivated" in decoded
    ) {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export default DecodeToken;

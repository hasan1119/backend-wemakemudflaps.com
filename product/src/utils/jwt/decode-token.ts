import jwt from "jsonwebtoken";
import config from "../../config/config";
import { UserSession } from "../../types";

/**
 * Verifies and decodes a JWT token using a secret key.
 *
 * Workflow:
 * 1. Attempts to verify the JWT token with the configured secret key.
 * 2. Validates that the decoded payload contains all required UserSession fields.
 * 3. Returns the decoded UserSession object or null if verification fails or fields are missing.
 *
 * @param token - The JWT token to verify.
 * @returns A promise resolving to the decoded UserSession or null if verification fails.
 */
const DecodeToken = async (token: string): Promise<UserSession | null> => {
  try {
    const decoded = jwt.verify(token, config.SECRET_KEY) as UserSession;

    // Ensure the decoded token contains the required fields
    if (
      decoded &&
      typeof decoded === "object" &&
      "id" in decoded &&
      "avatar" in decoded &&
      "firstName" in decoded &&
      "lastName" in decoded &&
      "email" in decoded &&
      "gender" in decoded &&
      "roles" in decoded &&
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

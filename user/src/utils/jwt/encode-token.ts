import jwt from "jsonwebtoken";
import config from "../../config/config";

// Define the payload type for better type safety
interface TokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string;
  emailVerified: boolean;
  isAccountActivated: boolean;
}

/**
 * Generates a JWT token for a user based on their details.
 *
 * @param user_id - The user's unique ID.
 * @param email - The user's email.
 * @param firstName - The user's first name.
 * @param lastName - The user's last name.
 * @param role - The user's role.
 * @param gender - The user's gender.
 * @param emailVerified - The user's email verification status.
 * @param isAccountActivated - The user's account activation status.
 * @param trackingId - The user's tracking ID.
 * @param expiresIn - Optional. The token expiration time.
 * @returns {Promise<string>} - A promise that resolves to the signed JWT token.
 */
const EncodeToken = async (
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  gender: string,
  emailVerified: boolean,
  isAccountActivated: boolean,
  expiresIn?: string
): Promise<string> => {
  // Create the token payload
  const PAYLOAD: TokenPayload = {
    id,
    email,
    firstName,
    lastName,
    role,
    gender,
    emailVerified,
    isAccountActivated,
  };

  // Use the provided expiresIn value or the default from config
  const tokenExpiresIn = expiresIn || config.EXPIRE;

  // Sign and return the JWT token
  return jwt.sign(PAYLOAD, config.SECRET_KEY, { expiresIn: tokenExpiresIn });
};

export default EncodeToken;
